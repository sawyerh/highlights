# Serverless semantic search

## Initial environment setup

1. Add a **plaintext** secret to AWS Secrets Manager with the name `Highlights/OpenAI-API-Key`. Set the OpenAI API key as the plaintext value.
1. Create the initial set of embeddings.
   1. [Export the Firestore data](../../firebase/exporter/instructions.md)
   1. Place the Firestore export in the `tmp` directory
   1. Run `export OPENAI_API_KEY=[your key here]`
   1. Run `make create-embeddings`
   1. Upload the outputted `tmp/embeddings.parquet` to S3

## Resources

- Lambda management is via [Serverless Framework](https://www.serverless.com/framework/docs)
- [Powertools for AWS Lambda](https://docs.powertools.aws.dev/lambda/python/latest/) provides a toolkit to implement Serverless best practices and increase developer velocity
- [AWS SDK for pandas](https://aws-sdk-pandas.readthedocs.io/en/stable/index.html) provides a toolkit to read and write Pandas DataFrames to and from AWS data stores like S3.

## Usage

### Deployment

```
make deploy
```

### Invocation

After successful deployment, you can invoke the deployed function by using the following command:

```bash
npx serverless invoke --function hello
```

### Local development

You can invoke your function locally by using the following command:

```bash
npx serverless invoke local --function hello
```
