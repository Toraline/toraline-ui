# toraline-ui: instructions for agents

The component library of Toraline, as a monorepo: `packages/tokens` (design tokens and themes), `packages/ui` (styled React components, published as `@toraline.tech/ui`) `apps/catalog` (Storybook) and `apps/playground` (a private Next.js app that is the test page for themes, fonts and the Tailwind preset). Version 2 is built on the branch `main` (named `v2` until 2026-11-15); the old library is unchanged in `legacy/` and on the branch `old-package`.

## Project profile

Skills and scripts read these values. They are the only place where this project's rules differ from another project's.

| Key | Value | Meaning |
|---|---|---|
| `packs` | `core` | Which skill packs are on |
| `ticket_prefix` | `TOR` | Linear team key, for example `TOR` |
| `base_branch` | `main` | Branch that worktrees start from and pull requests target |
| `worktree_path` | `../<repo>-<prefix>-<n>` | Where a ticket's worktree is created |
| `main_checkout` | `protected` | `protected`: no git changes on the main checkout. `open`: allowed |
| `spec_location` | `both` | The Linear ticket is the source of truth; a local file tracks the data and linked tickets |
| `push` | `push` | `push`: push after committing and report. `ask`: ask first |
| `allow_no_verify` | `no` | May a commit skip the checks that run before it |
| `commit_format` | `type(scope): summary (TOR-N)` | Commit message pattern |
| `check_command` | `make check` | What must pass before a commit |
| `output_language` | `English` | Language of what the agent writes for people |
| `external_writes` | `GitHub: push, open pull request` | Outside tools the agent may write to without asking |
| `finished_status` | `Needs QA` | Linear status a ticket gets when the agent's work on it is finished |

Extra values, used only when `packs` includes `team`:

| Key | Value | Meaning |
|---|---|---|
| `review_rules` | `<ask>` | Path of the file a code review checks against |
| `release_branches` | `<ask>` | Release branches, as `source -> target` pairs; the first pair is the default |
| `required_reviewers` | `<ask>` | Who must review, for example the path of a CODEOWNERS file |

A value of `<ask>` is not set yet. The `start` skill asks for it the first time it runs here.

## Before working

- Read the three rule files: [writing](agent/rules/writing.md), [git safety](agent/rules/git-safety.md), [ask first](agent/rules/ask-first.md).
- The flow, in order: [docs/workflow/working-pattern.md](docs/workflow/working-pattern.md).
- Where each kind of thing lives: [docs/workflow/sources-of-truth.md](docs/workflow/sources-of-truth.md).
- Technical decisions, newest first: [docs/decisions.md](docs/decisions.md). The plan and its phases are in the Linear project `toraline-ui`.
- Never change `legacy/`. It is the old library, kept until version 2 is fully released.
- Never run `npm publish` or `npm login`, and never handle an npm token. A person publishes, with the steps in [docs/releasing.md](docs/releasing.md).

## Skills

Skills are in [`agent/skills/`](agent/skills/). `.claude/skills` and `.cursor/skills` are links to that folder, so Claude Code and Cursor read the same files. The catalog is [docs/workflow/skills.md](docs/workflow/skills.md). When the person calls a skill (`/create-spec`, `/execute-spec`), read its `SKILL.md` and follow it. Not sure where to begin: `/start`.

Linear is reached through any tool or MCP server with `linear` in its name. Without access, ask the person for the ticket's content. Never invent it.

## Commands

```bash
make setup       # first time on this machine: npm install, hooks, local-docs, doctor
make doctor      # check the machine and the project
make worktree TICKET=123 SLUG=short-slug
make check       # what must pass before a commit
make catalog     # open the catalog (Storybook) on http://localhost:6006
make catalog-build # build the static catalog into apps/catalog/storybook-static
make catalog-test  # run every story as a test, in each theme, with the accessibility check
make pack        # build the two published packages, write their tarballs into .pack/tarballs/, list their files
make version VERSION=2.0.0-beta.1 # set the version of the two published packages
make sync-skills # copy the current core from the boilerplate
```

Setup guide for people: [docs/setup-guide.md](docs/setup-guide.md).
