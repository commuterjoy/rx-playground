
var Rx = require('rx');

var eventStream = new Rx.Subject();

var save = function (b) {
	console.log('SAVE', b)
}

var subscribe = function(e) {
		e
			.map(function (data) {
				data.foo = data.session.replace(/[a-z]/g, '-');
				return data;
			})
			.catch(Rx.Observable.empty())
			.subscribe(save);
};

subscribe(eventStream);
var randomstring = require("randomstring");

// simulate a message being popped off SQS
setInterval(function () {
	eventStream.onNext({ 
		session: randomstring.generate()
	});
}, 2000);
