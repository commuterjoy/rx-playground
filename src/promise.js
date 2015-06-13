
var Rx				= require('rx');
var randomstring	= require("randomstring");
require('es6-promise').polyfill();

/*

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

*/

// -------- SQS stream

var sqsStream = new Rx.Subject();

setInterval(function () {

	console.log('SQS generated an event');
		
	var p = Promise
				.all(
					[
						new Promise(function(resolve, reject) { resolve(1) }), // a response from CAPI
						new Promise(function(resolve, reject) { resolve(2) })  // a response from Session API
					])
				.then(function (a) {
	
				sqsStream.onNext({ 
					session: randomstring.generate(),
					foo: a[0],
					boo: a[1]
				});
		});


}, 500);

var sqsStream = new Rx.Subject();

var processStream = sqsStream
  .map(function (data) {
	return data;
  });

processStream.subscribe(function (n) {
	console.log(n);
})

