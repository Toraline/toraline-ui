# toraline-ui: run every command from the repository root.
.DEFAULT_GOAL := help
.PHONY: help setup install check build typecheck lint test catalog catalog-build catalog-browser catalog-test packages-check pack version

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

packages-check: ## Check the two published packages: same version, files of "exports", "use client", no extra file
	@node scripts/check-packages.mjs

pack: ## Build the two published packages, write their tarballs into .pack/ and list the files of each
	@rm -rf .pack/tarballs && mkdir -p .pack/tarballs
	@npm pack --workspace @toraline/tokens --workspace @toraline/ui --pack-destination .pack/tarballs
	@ls -l .pack/tarballs

version: ## Set the version of the two published packages (VERSION=2.0.0-beta.1)
	@node scripts/set-version.mjs "$(VERSION)"
	@npm install --no-audit --no-fund

check: build typecheck lint packages-check test ## What must pass before a commit (the profile's check_command)
