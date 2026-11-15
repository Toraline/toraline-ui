# toraline-ui: run every command from the repository root.
.DEFAULT_GOAL := help
.PHONY: help setup install check build typecheck lint test catalog catalog-build catalog-browser catalog-test

-include agent/core.mk

help: ## List the commands
	@grep -hE '^[a-zA-Z0-9_-]+:.*?## ' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

install: ## Install the dependencies of every package
	@npm install --no-audit --no-fund

setup: install hooks local-docs doctor ## First-time setup on this machine

build: ## Build every package, the catalog and the playground
	@npm run build

typecheck: ## Type check every package
	@npm run typecheck

lint: ## Lint the new code (legacy/ is not linted)
	@npm run lint

test: catalog-browser ## Run the tests of every package, and every story of the catalog in each theme
	@npm test

catalog: ## Open the catalog (Storybook) for development, on http://localhost:6006
	@npm run dev -w @toraline/catalog

catalog-build: ## Build the static catalog into apps/catalog/storybook-static
	@npm run build -w @toraline/catalog

catalog-browser: ## Download the browser that runs the story tests (does nothing when it is already there)
	@npx playwright install --only-shell chromium

catalog-test: catalog-browser ## Run only the story tests: every story in each theme, with the accessibility check
	@npx vitest run --project 'stories-*'

check: build typecheck lint test ## What must pass before a commit (the profile's check_command)
