.DEFAULT_GOAL := init

init:
	npm install
	poetry lock --no-update
	poetry install --sync

py-format: # Format the code
	poetry run black .
	poetry run isort --atomic .

py-lint:
	poetry run flake8
