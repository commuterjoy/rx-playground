
var AWS			= require('aws-sdk'); 
var Rx			= require('rx');
var	querystring	= require('querystring');

AWS.config.update({
	accessKeyId: process.env.accessKey, 
	secretAccessKey: process.env.secretAccessKey, 
	"region": "eu-west-1"
});

var sqs = new AWS.SQS();
var sqsUrlEgest = process.env.SQS_EGEST;
var eventStream = new Rx.Subject();

var save = function (data) {
	console.log('SAVE', data.queryText);
}

var subscribe = function(e) {
		e
			.pluck('Messages')
			.map(function (data) {
				return JSON.parse(data[0].Body).annotations.referer;
			})
			.filter(function (data)	{
				return /queryText/.test(data.search);
			})
			.map(function (data) {
				return querystring.parse(data.search)
			})
			.catch(function (err) {
				console.log(err);
				return Rx.Observable.empty()
			})
			.subscribe(save);
};

subscribe(eventStream);

(function pollQueueForMessages() {

	console.log('polling');
	
	sqs.receiveMessage({
		QueueUrl: sqsUrlEgest,
		WaitTimeSeconds: 20
	}, function(err, data) {
			if (err) console.log(err, err.stack); // an error occurred
			else {
				eventStream.onNext(data);
				pollQueueForMessages();
			}
	});

})();
