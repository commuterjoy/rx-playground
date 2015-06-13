// `npm install rx randomstring es6-promise`

var Rx				= require('rx');
var randomstring	= require("randomstring");
require('es6-promise').polyfill();

// -------- Simulated SQS stream

var sqsStream = new Rx.Subject();
var c = 0;

setInterval(function () {
	console.log('SQS generated an event', c++);
	sqsStream.onNext(JSON.stringify({
		session: randomstring.generate(),
		c: c
	}));
}, 500);

var enrichmentStream = sqsStream
	.map(function (data) {			// -- 1. Transform the data in to a nice format
		return JSON.parse(data);
	})
	.flatMap(function (data) {		// -- 2. Example async operation
		return Promise
			.all([
				new Promise(function(resolve, reject) { // a response from CAPI
					resolve(1);
				}), 
				new Promise(function(resolve, reject) { // a response from Session API
					setTimeout(function () { 
						resolve(2);	
					}, Math.random() * 3000);	// proves the messages don't have to arrive in order
				}),
				Promise.resolve(data)	// not sure how to return the original data other than this
			])
	})
	.map(function (data) {			// -- 3. Append the async results to the original data structure
		data[2].annotations = { a: data[0], b: data[1] };	// TODO destructure
		return data[2];
	})
	.map(function (data) {			// -- 4. Some token transform on a property
		data.annotations.foo = data.session.replace(/[a-z]/g, '-'); 
		return data;
	})
	.flatMap(function (data) {		// -- 5. Example of how we might conditionally do something asynchronously, downstream of the above transforms
		if (/^[0-9]/.test(data.session)) {
			return Promise
				.all([
					Promise.resolve(data),	// the original data structure must always be passed first 
					new Promise(function(resolve, reject) { // a response from some async process
						resolve(3);
					}) 
				])
		} else {
			return Promise.all([Promise.resolve(data)])	// pass through if conditional is false
		}
	})
	.map(function (data) { 			// -- 6. Conditionally append the previous result 
		if (data[1]) data[0].annotations.boo = data[1];
		return data[0];
	})


// output
enrichmentStream.subscribe(
    function (x) {
		console.log('Next', JSON.stringify(x))	// Eg. push to kinesis
    },
    function (err) {
        console.log('Error: ' + err);
    },
    function () {
        console.log('Completed');
    }
)
