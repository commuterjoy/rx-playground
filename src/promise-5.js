// `npm install rx randomstring es6-promise`

var Rx				= require('rx');
var randomstring	= require('randomstring');
var transforms		= require('./transforms');
var EventEmitter	= require('events').EventEmitter;

require('es6-promise').polyfill();

const emitter = new EventEmitter();

var messageStream = Rx.Observable.fromEvent(emitter, 'message');

var subscribe = stream => {

	stream
		.map(transforms.toJson)			// -- 1. Transform the data in to a nice format
		.map(data => {
			if (Math.random() < 0.1) throw new Error('something pretty bad happened. shut down, exploded');
			return data;
		})
		.flatMap(data => {		// -- 2. Example async operation
			return Promise
				.all([
					new Promise((resolve, reject) => { // a response from CAPI
						resolve(1);
					}), 
					new Promise((resolve, reject) => { // a response from Session API
						setTimeout(() => { 
							resolve(2);	
						}, Math.random() * 1000);
					}),
					Promise.resolve(data)	// not sure how to return the original data other than this
				])
		})
		.subscribe(
		    x => {
				console.log('Next', x);
			},
			err => {
				console.log('Error', err);
				subscribe(stream);
			}
		)
}

subscribe(messageStream);

// -------- Simulated SQS stream

var c = 0;

setInterval(() => {
	emitter.emit('message', JSON.stringify({ session: randomstring.generate(), c: c++ }));
}, 100);

// -------- Enrichment pipeline 

emitter.on('message', function (message) {
	console.log('new sqs message');
});
