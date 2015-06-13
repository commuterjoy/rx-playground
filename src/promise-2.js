
var Rx				= require('rx');
var randomstring	= require("randomstring");
require('es6-promise').polyfill();

// -------- SQS stream

var sqsStream = new Rx.Subject();

setInterval(function () {
	console.log('SQS generated an event');
	sqsStream.onNext(JSON.stringify({
		session: randomstring.generate(),
	}));
}, 500);

var enrichmentStream = sqsStream
	.map(function (data) {
		return JSON.parse(data);
	})
	.concatMap(function (x) {
		x.annotations = {};
		return Promise
			.all([
				new Promise(function(resolve, reject) { // a response from CAPI
					x.annotations.capi = 1;
					resolve(x);
				}), 
				new Promise(function(resolve, reject) { // a response from Session API
					x.annotations.session = 2;
					resolve(x);
				}) 
			])
	})

enrichmentStream.subscribe(function (data) {
	console.log(data);
})

/*
// Do a some other operations here
var fooStream = sqsStream
	.map(function (data) {
		return data;
	})
*/


