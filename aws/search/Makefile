deps: # Install dependencies and generate the requirements.txt file with pinned and hashed versions
	poetry install
	poetry export --output requirements.txt

deploy:
	poetry run chalice deploy