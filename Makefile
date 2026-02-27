.PHONY: lint format  

all: lint

lint:
	npm run lint

format:
	npx prettier --write "js/**/*.js" "preact/**/*.js"

