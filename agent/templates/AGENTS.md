# <project name>: instructions for agents

<Two sentences: what this project is and which apps it has.>

## Project profile

Skills and scripts read these values. They are the only place where this project's rules differ from another project's.

| Key | Value | Meaning |
|---|---|---|
| `packs` | `core` | Which skill packs are on |
| `ticket_prefix` | `<ask>` | Linear team key, for example `TOR` |
| `base_branch` | `<ask>` | Branch that worktrees start from and pull requests target |
| `worktree_path` | `../<repo>-<prefix>-<n>` | Where a ticket's worktree is created |
| `main_checkout` | `<ask>` | `protected`: no git changes on the main checkout. `open`: allowed |
| `spec_location` | `both` | The Linear ticket is the source of truth; a local file tracks the data and linked tickets |
| `push` | `<ask>` | `push`: push after committing and report. `ask`: ask first |
| `allow_no_verify` | `no` | May a commit skip the checks that run before it |
| `commit_format` | `type(scope): summary (<PREFIX>-N)` | Commit message pattern |
| `check_command` | `<ask>` | What must pass before a commit |
| `output_language` | `<ask>` | Language of what the agent writes for people |
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

## Skills

Skills are in [`agent/skills/`](agent/skills/). `.claude/skills` and `.cursor/skills` are links to that folder, so Claude Code and Cursor read the same files. The catalog is [docs/workflow/skills.md](docs/workflow/skills.md). When the person calls a skill (`/create-spec`, `/execute-spec`), read its `SKILL.md` and follow it. Not sure where to begin: `/start`.

Linear is reached through any tool or MCP server with `linear` in its name. Without access, ask the person for the ticket's content. Never invent it.

## Commands

```bash
make setup       # first time on this machine: hooks, local-docs, doctor
make doctor      # check the machine and the project
make worktree TICKET=123 SLUG=short-slug
make check       # what must pass before a commit
make sync-skills # copy the current core from the boilerplate
```

Setup guide for people: [docs/setup-guide.md](docs/setup-guide.md).
