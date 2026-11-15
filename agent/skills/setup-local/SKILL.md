---
name: setup-local
description: Walks from make doctor to a working setup on this machine, fixing each failing check, then make setup, local-docs and the sign-in to Linear and GitHub. Use when the user says "/setup-local", "set up my machine", "first time in this project" or "my setup is broken".
disable-model-invocation: true
metadata:
  pack: core
  stage: Start
---

# Setup local

Gets this machine ready to work on the project, with `make doctor` as the guide. It leaves a `make doctor` run with no `FAIL` line, the `local-docs/` folder, and Linear and GitHub signed in.

## Input

Nothing is required: `/setup-local`. Optional: the text of an error the person saw.

## Reads

- Project profile in `AGENTS.md`: `ticket_prefix`, `base_branch`, `push`, `main_checkout`, `check_command`, `output_language`.
- `agent/rules/ask-first.md`, `agent/rules/git-safety.md`, `agent/rules/writing.md`.
- `docs/setup-guide.md`, `README.md`, `Makefile`, `agent/core.mk`.
- `scripts/doctor.sh` (what each check means), `.env.example`, `.mcp.json`, `.cursor/mcp.json`.

## Steps

1. **Find the folder.** Run `git rev-parse --show-toplevel` and work from that folder. Run `git rev-parse --git-dir` and `git rev-parse --git-common-dir`. If the two differ, this folder is a worktree: run `bash scripts/worktree.sh setup`, which copies `.env` from the main checkout.
2. **Run `make doctor`.** Read every line. A line starts with `OK`, `WARNING` or `FAIL`.
3. **Fix each `FAIL` line, one at a time.** Each line prints its own fix after the word `Fix:`. Tell the person what the line means in one sentence, then act by the table below.

| Kind of fix | What to do |
|---|---|
| A project command (`make sync-skills`, `make hooks`, `make local-docs`) | Run it |
| A command that installs or changes software on the machine (`nvm install`, `brew install ...`) | Show the exact command. Run it only after the person says yes |
| A command that deletes a folder or file | Show the exact command and what it deletes. Run it only after the person says yes |
| A sign-in that opens a browser or asks for typing (`gh auth login`) | Ask the person to run it in their own terminal. Wait until they say it is done |

4. **Run `make doctor` again.** Repeat steps 3 and 4 until no line starts with `FAIL`. If the same line fails 2 times after its fix, stop and report the exact line.
5. **Handle each `WARNING` line.** A warning does not block. Explain it in one sentence and offer its fix by the same table. Special cases:
   - `.env does not exist`: run `cp .env.example .env`.
   - `.env is missing: <keys>`: name the keys. Copy a key from `.env.example` only when it has a default value there. A secret is typed by the person into `.env`. Never write or invent a secret.
   - `profile <key> is not set`: do not fix it here. Put `start` in the report as the next step.
6. **Run `make setup`.** It turns on the secret check before each commit, creates `local-docs/` and runs `make doctor`. If the project's `Makefile` adds more to `setup` (installing dependencies, starting a database), read the target first and tell the person what it will do.
7. **Check `local-docs/`.** If `local-docs/notes/` does not exist in the main checkout, run `make local-docs`. The script never overwrites a file.
8. **Sign in to GitHub.** Run `gh auth status`. If it is not signed in, ask the person to run `gh auth login` in their terminal.
9. **Sign in to Linear.** Check that a tool or MCP server with `linear` in its name answers a read call (for example: list the teams).
   - No access in Claude Code: the server is declared in `.mcp.json`. Ask the person to sign in when Claude Code asks.
   - No access in Cursor: the server is declared in `.cursor/mcp.json`. Ask the person to open Cursor Settings, then MCP, then `linear`, and sign in.
   - Ask one question at a time and wait for "done" before checking again.
10. **Start the project.** Read `README.md` and the `Makefile` for the command that starts the apps. If one exists, show it, say what it starts, and run it after a yes. If none exists, say "this project has no start command yet" in the report.
11. **Run the checks once.** Run the profile's `check_command`. Report the result. Do not fix failing code in this skill.
12. **Report.**

## Output

A fixed report, written in the profile's `output_language`:

- **Done:** each `FAIL` and `WARNING` line that was fixed, with the command that fixed it; whether `local-docs/` exists; whether GitHub and Linear are signed in; the result of `check_command`.
- **Not done:** each line still `FAIL` or `WARNING`, with its exact text and why it was not fixed; each step the person must do by hand.
- **Next step:** `start` (it fills any profile value still not set, then names the skill for your goal).

## Do not

- Do not install software, delete a folder or delete a file without a yes for that exact command.
- Do not write a secret into `.env`, and do not invent a value for a key.
- Do not put a real value into `.env.example`.
- Do not stage, commit or push anything. `.env` is never committed.
- Do not run a command that resets or deletes a database.
- Do not edit `scripts/`, `agent/core.mk` or the rule files to make a check pass.
- Do not say a sign-in worked unless a read call or `gh auth status` proved it.
