
var Rx = require('rx');
require('es6-promise').polyfill();

var eventStream = new Rx.Subject();

var save = function (b) {
	console.log('SAVE', b)
}

var subscribe = function(e) {
		
	var p = Promise.all(
		[
			new Promise(function(resolve, reject) { // a response from CAPI
				resolve(1)
			}),
			new Promise(function(resolve, reject) { // a response from SEssion API  
				resolve(2)
			}),
		]);

	console.log('promise resolved', p);
	
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
		})
	
	// Do something with the transformed stream
	transform.subscribe(function (data) {
		console.log('Pushing to sink: ', data)
	});

};

subscribe(eventStream);
var randomstring = require("randomstring");

// simulate a message being popped off SQS
setInterval(function () {
	console.log('sqs event happened');
	eventStream.onNext({ 
		session: randomstring.generate()
	});
}, 500);
