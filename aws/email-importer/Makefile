deploy: # Deploy to AWS
	npx serverless deploy --verbose --stage production

logs: # AWS Lambda logs for the function
	npx serverless logs --function importer --tail --stage production

invoke-with-test-event: # Invoke the real AWS Lambda function with a test event
	npx serverless invoke --function importer --stage production --path fixtures/test-event.json --log

invoke-local: # Invoke the function locally with a test event
	npx serverless invoke local --function importer --stage production --path fixtures/test-event.json