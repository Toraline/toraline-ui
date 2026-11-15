# Core targets, the same in every project. Synced from the boilerplate: do not edit here.
# A project's Makefile has the line:  -include agent/core.mk

.PHONY: doctor doctor-core worktree worktree-attach worktree-remove worktree-list sync-skills skills-catalog hooks local-docs

# A project with its own doctor target sets CORE_SKIP_DOCTOR := 1 before the include
# and adds doctor-core as a prerequisite of its doctor target.
ifndef CORE_SKIP_DOCTOR
doctor: doctor-core ## Check the machine and the project; each failure prints its fix
endif

doctor-core: ## The core checks: skills, profile, hooks, local-docs, GitHub, Linear
	@bash scripts/doctor.sh

worktree: ## Create the worktree of a ticket (TICKET=123 SLUG=short-slug [PERSON=name])
	@bash scripts/worktree.sh create "$(TICKET)" "$(SLUG)" $(PERSON)

worktree-attach: ## Create the worktree of a ticket on a branch that already exists (TICKET=123 BRANCH=name)
	@bash scripts/worktree.sh attach "$(TICKET)" "$(BRANCH)"

worktree-remove: ## Remove the worktree and branch of a finished ticket (TICKET=123 [FORCE=1])
	@bash scripts/worktree.sh remove "$(TICKET)" $(if $(FORCE),--force)

worktree-list: ## List the worktrees
	@bash scripts/worktree.sh list

sync-skills: ## Copy the current core from the boilerplate into this project
	@bash scripts/sync-skills.sh

skills-catalog: ## Rebuild docs/workflow/skills.md from the skill headers
	@bash scripts/skills-catalog.sh

hooks: ## Turn on the secret check before each commit
	@git config core.hooksPath .githooks && echo "Secret check is on."

local-docs: ## Create local-docs/ for this user (never committed)
	@bash scripts/init-local-docs.sh
