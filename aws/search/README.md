# Serverless semantic search

## Initial environment setup

- Add a **plaintext** secret to AWS Secrets Manager with the name `Highlights/OpenAI-API-Key`. Set the OpenAI API key as the plaintext value.

## Resources

- Lambda management is via [Serverless Framework](https://www.serverless.com/framework/docs)
- [Powertools for AWS Lambda](https://docs.powertools.aws.dev/lambda/python/latest/) provides a toolkit to implement Serverless best practices and increase developer velocity

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
