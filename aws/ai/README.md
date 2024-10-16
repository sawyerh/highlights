# Serverless AI

This directory contains the code supporting features like Semantic Search and Summarization.

## How it works

### Search

```mermaid
sequenceDiagram
   autonumber
   participant Consumer
   participant Lambda
   participant S3
   participant OpenAI

   Consumer ->> Lambda: GET /search
   Lambda ->> S3: Download embeddings.parquet
   S3 ->> Lambda: embeddings.parquet
   Lambda ->> OpenAI: Create embedding for query
   OpenAI ->> Lambda: Embedding
   Note over Lambda: Calculate similarity for each embedding
   Lambda ->> Consumer: Highlights with highest similarity
```

### Summarize

```mermaid
sequenceDiagram
   autonumber
   participant Consumer
   participant Lambda
   participant S3
   participant OpenAI

   Consumer ->> Lambda: POST /summarize
   Lambda ->> S3: Download embeddings.parquet
   S3 ->> Lambda: embeddings.parquet
   Note over Lambda: Find all highlights for the volume
   Lambda ->> OpenAI: Prompt with highlights
   OpenAI ->> Lambda: Chat completion
   Lambda ->> Consumer: Completion as JSON response
```

## Initial environment setup

1. Add a `SecureString` to AWS SSM with the name `/Highlights/OpenAI-API-Key`. Set the API key as the plaintext value.
1. Add a `SecureString` to AWS SSM with the name `/Highlights/Anthropic-API-Key`. Set the API key as the plaintext value.
1. Add a `SecureString` to AWS SSM with the name `/Highlights/Clients-Secret`. Set the value to a [generated secret](https://generate-secret.now.sh/32). This will be used to authenticate requests from other apps,like the Firebase functions.
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
- Test mocking and spying is via [`pytest-mock`](https://pytest-mock.readthedocs.io/en/latest/usage.html)

## Usage

Reference the `Makefile` for the full list of commands. More commands are available via the Serverless CLI.

## Checking the embeddings

To read the embeddings file, to check if an embedding was added for instance, run the following:

```sh
$ poetry run python

import pandas as pd
df = pd.read_parquet('tmp/embeddings.parquet')
df.tail()
```
