
var Rx = require('rx');
require('es6-promise').polyfill();

var eventStream = new Rx.Subject();

var save = function (b) {
	console.log('SAVE', b)
}

var subscribe = function(e) {
		e
			.map(function (data) {
				return Promise.all(
					[
						new Promise(function(resolve, reject) { // a response from CAPI
							data.a = 1;
							resolve(data)
						}),
						new Promise(function(resolve, reject) { // a response from SEssion API  
							data.b = 2;
							resolve(data)
						}),
					]);
			})
			.map(function (data) {
				//data.c = data.a + data.b;
				return data;
			})
			.catch(function (err) {
				console.log(err);
				Rx.Observable.empty()
			})
			.subscribe(save);
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
