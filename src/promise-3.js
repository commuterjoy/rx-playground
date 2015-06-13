// `npm install rx randomstring es6-promise`

var Rx				= require('rx');
var randomstring	= require("randomstring");
var transforms		= require('./transforms');

require('es6-promise').polyfill();

// -------- Simulated SQS stream

var sqsStream = new Rx.Subject();

setInterval(() => {
	console.log('SQS generated an event');
	sqsStream.onNext(JSON.stringify({
		session: randomstring.generate()
	}));
}, 500);

// -------- Enrichment pipeline 

var enrichmentStream = sqsStream
	.map(data => {			// -- 1. Transform the data in to a nice format
		return JSON.parse(data);
	})
	.flatMap(data => {		// -- 2. Example async operation
		return Promise
			.all([
				new Promise((resolve, reject) => { // a response from CAPI
					resolve(1);
				}), 
				new Promise((resolve, reject) => { // a response from Session API
					resolve(2);	// TODO - randomly delay and fail this
				}),
				Promise.resolve(data)	// not sure how to return the original data other than this
			])
	})
	.map(data => {			// -- 3. Append the async results to the original data structure
		var [a, b] = data;
		data[2].annotations = { a: a, b: b };
		return data[2];
	})
	.map(data => {			// -- 4. Some token transform on a property
		data.annotations.foo = data.session.replace(/[a-z]/g, '-'); 
		return data;
	})
	.flatMap(data => {		// -- 5. Example of how we might conditionally do something asynchronously, downstream of the above transforms
		if (/^[0-9]/.test(data.session)) {
			return Promise
				.all([
					Promise.resolve(data),	// the original data structure must always be passed first 
					new Promise((resolve, reject) => { // a response from some async process
						resolve(3);
					}) 
				])
		} else {
			return Promise.all([Promise.resolve(data)])	// pass through if conditional is false
		}
	})
	.map(data => { 			// -- 6. Conditionally append the previous result 
		if (data[1]) data[0].annotations.boo = data[1];
		return data[0];
	})


// output
enrichmentStream.subscribe(
    x => {
		console.log('Next', JSON.stringify(x))	// Eg. push to kinesis
    },
    err => {
        console.log('Error: ' + err);
    },
    () => {
        console.log('Completed');
    }
)
