.PHONY: dev dev-demo build build-demo start lint test

dev:
	npm run dev

dev-demo:
	npm run dev:demo

build:
	npm run build

build-demo:
	npm run build:demo

start:
	npm run start

lint:
	npm run lint

test:
	npx vitest run
