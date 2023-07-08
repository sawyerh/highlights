init:
	poetry lock --no-update
	poetry install --sync

deploy:
	npx serverless deploy

create-embeddings:
	[ -n "${OPENAI_API_KEY}" ] || (echo "OPENAI_API_KEY is not set" && exit 1)
	poetry run python embeddings/bulk_create_embeddings.py