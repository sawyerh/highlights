init:
	poetry lock --no-update
	poetry install --sync

deploy:
	npx serverless deploy --verbose --stage production

create-embeddings: # Bulk-create the embeddings for a Firestore export
	[ -n "${OPENAI_API_KEY}" ] || (echo "OPENAI_API_KEY is not set" && exit 1)
	poetry run python scripts/bulk_create_embeddings.py

logs:
	npx serverless logs --function ai --tail --stage production

test:
	poetry run pytest -vv --capture=no

test-watch:
	poetry run pytest-watch -v