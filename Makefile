# toraline-ui: run every command from the repository root.
.DEFAULT_GOAL := help
.PHONY: help setup install check build typecheck lint test

-include agent/core.mk

help: ## List the commands
	@grep -hE '^[a-zA-Z0-9_-]+:.*?## ' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

install: ## Install the dependencies of every package
	@npm install --no-audit --no-fund

setup: install hooks local-docs doctor ## First-time setup on this machine

build: ## Build every package
	@npm run build

typecheck: ## Type check every package
	@npm run typecheck

lint: ## Lint the new code (legacy/ is not linted)
	@npm run lint

test: ## Run the tests of every package
	@npm test

check: build typecheck lint test ## What must pass before a commit (the profile's check_command)
