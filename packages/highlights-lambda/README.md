## How it works

1. SES receives the email
1. SES adds the email to S3
1. SES triggers the Lambda function
1. Lambda downloads the email from S3
1. Lambda pulls volume and highlights data from the email's body
1. Lambda adds any new data to Firestore

## Configuration

The Lambda function relies on the following environment variables. You'll need to set these to test locally:

* `KEY_PREFIX` - The directory within the bucket where the email objects can be found (SES only gives us the message ID, which is used for the object's name).
* `S3_BUCKET` - The bucket where the emails are added to
* `SERVICE_ACCOUNT` - Google Cloud Service Account JSON object
