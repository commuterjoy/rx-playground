HEROKU_AUTH_TOKEN := `heroku auth:token`

run:
	@export accessKey=`cat ~/.aws-access.spoor`; \
	 export secretAccessKey=`cat ~/.aws-secret.spoor`; \
	 export SQS_EGEST=`cat ~/.aws-sqs.spoor-egest`; \
	 node sqs.js
