deploy: # Deploy to AWS
	npx serverless deploy --verbose --stage production

logs: # AWS Lambda logs for the function
	npx serverless logs --function importer --tail --stage production

invoke-with-test-event: # Invoke the function with a test event
	npx serverless invoke --function importer --stage production --path fixtures/test-event.json --log