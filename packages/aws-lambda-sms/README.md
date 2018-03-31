## How it works

1. A scheduled CloudWatch event triggers the Lambda function
1. Lambda makes a request to an API endpoint to retrieve a random highlight
1. Lambda sends a message to an SNS topic
1. The SNS topic sends an SMS to my phone with the message

## Deploying

Deploy the handler to Lambda. This script copies the files into a `dist` directory and installs production dependencies.

### Prerequisites

* [`trash`](https://github.com/sindresorhus/trash-cli) is installed
* An AWS profile is configured

```
npm run deploy
```
