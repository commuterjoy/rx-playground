
var Rx				= require('rx');
var randomstring	= require("randomstring");
require('es6-promise').polyfill();

var pipeline = function (e) {

	console.log(e);

	// Fetch data from various sources 
	var p = Promise.all(
		[
			new Promise(function(resolve, reject) { resolve(1) }), // a response from CAPI
			new Promise(function(resolve, reject) { resolve(2) })  // a response from Session API
		]);

	// Make stream from the promise
	var source = Rx.Observable.fromPromise(p);

	// Transform
	var transform = source
		.map(function (data) {
			var a = data[0];
			var b = data[1];
			return {
				a: a,
				b: b,
				c: a + b
			};
		})
		.map(function (data) {
			return data;
		});

	// Do something with the transformed stream
	transform.subscribe(function (data) {
		console.log('Pushing to sink: ', data)
	});

};

// 
var sqsStream = new Rx.Subject();

// simulate a message being popped off SQS
setInterval(function () {
	console.log('sqs stream generated an event');
	sqsStream.onNext({ 
		session: randomstring.generate()
	});
}, 500);

pipeline(sqsStream);

