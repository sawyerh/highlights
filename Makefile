.DEFAULT_GOAL := init

init:
	make py-init
	make js-init

js-init:
	npm install

py-init:
	poetry lock --no-update
	poetry install --sync --no-root

py-format: # Format the code
	poetry run black .
	poetry run isort --atomic .

py-lint:
	poetry run flake8
