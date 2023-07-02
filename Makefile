.DEFAULT_GOAL := init

init:
	npm install
	poetry install

py-format: # Format the code
	poetry run black .
	poetry run isort --atomic .

py-lint:
	poetry run flake8
