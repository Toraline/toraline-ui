---
name: start
description: Asks what the person wants to do and names the skill to run; the first time in a repository it also fills the project profile. Use when the user says "/start", "where do I begin", "which skill do I use" or "help".
disable-model-invocation: true
metadata:
  pack: core
  stage: Start
---

# Start

The entry point. It asks the person's goal and names the one skill that fits. The first time it runs in a repository, it also asks for every profile value that is not set and writes the answers into `AGENTS.md`.

## Input

Nothing is required. A goal or a ticket id is optional: `/start`, `/start <PREFIX>-<n>`, `/start I want to plan my week`.

## Reads

- Project profile in `AGENTS.md`: every key (`packs`, `ticket_prefix`, `base_branch`, `worktree_path`, `main_checkout`, `spec_location`, `push`, `allow_no_verify`, `commit_format`, `check_command`, `output_language`, `external_writes`).
- `agent/rules/writing.md`, `agent/rules/ask-first.md`, `agent/rules/git-safety.md`.
- `docs/workflow/working-pattern.md` (the flow), `docs/workflow/status-skills.md` (Linear status to skill), `docs/workflow/skills.md` (the catalog).
- The folder names in `agent/skills/`.

## Steps

### Part A. Fill the profile (only when a value is not set)

1. For each of the 12 keys, run `bash scripts/profile.sh get <key>`. An empty result means the value is `<ask>` or missing. If no key is empty, go to Part B.
2. Tell the person how many values are missing. Then ask for them one question at a time, in the order of the table below. Wait for each answer before asking the next one.

| Key | Question | Allowed answers |
|---|---|---|
| `packs` | Do other people work on this project with you? | No: `core`. Yes: `core, team` |
| `ticket_prefix` | What is the key of your Linear team? It is the letters before the number in a ticket id. | Letters only |
| `base_branch` | Which branch do pull requests target? | A branch name that exists on `origin` |
| `worktree_path` | Where is a ticket's worktree created? | The default `../<repo>-<prefix>-<n>`, or another pattern |
| `main_checkout` | May an agent change files and run git commands in the folder you cloned? | No: `protected`. Yes: `open` |
| `spec_location` | Where is a spec kept? | `both` (Linear ticket and local file), `ticket`, `file` |
| `push` | After a commit, does the agent push right away, or ask you first? | Push right away: `push`. Ask first: `ask` |
| `allow_no_verify` | May a commit skip the checks that run before it? | `no` or `yes` |
| `commit_format` | What is the pattern of a commit message? | A pattern, for example `type(scope): summary (<PREFIX>-N)` |
| `check_command` | Which command must pass before a commit? | A command that exists in this project |
| `output_language` | In which language does the agent write for you? | A language name |
| `external_writes` | Which outside actions may the agent do without asking each time? | A list, for example `GitHub: push, open pull request`, or `none` |
| `finished_status` | Which Linear status does a ticket get when the agent's work on it is finished? | A status name that exists in the Linear team. Default: `Needs QA` |

3. Check each answer before writing it. For `base_branch`, run `git ls-remote --heads origin <answer>`. For `check_command`, check that the command or `make` target exists. If the check fails, say what failed and ask the same question again.
4. After each accepted answer, edit only the Value cell of that key's row in the profile table of `AGENTS.md`. Keep the backticks. Change no other text in the file.
5. Read the value back with `bash scripts/profile.sh get <key>`. If it differs from the answer, fix the row.
6. If the person does not know an answer, leave `<ask>` in the row, record the key as not set, and go to the next key.
7. Do not stage or commit `AGENTS.md`. Say in the report that the file changed and is not committed.

### Part B. Name the skill

1. If the message already states the goal clearly, skip the question. If not, ask one question: "What do you want to do now?" and show these options.

| Goal | Skill |
|---|---|
| Set up this machine, or something in the setup is broken | `setup-local` |
| See every skill that exists here | `help-skills` |
| Plan the work of one week | `plan-cycle` |
| Use the week's plan today (log time, tick tasks, reschedule) | `cycle-mode` |
| Understand a ticket before building it | `refine-ticket` |
| Write the spec of a ticket | `create-spec` |
| Build a ticket that has a spec | `execute-spec` |
| Go on with a ticket that was stopped in the middle | `continue` |
| Check my own change before saving it | `review-diff` |
| Commit | `commit` |
| Open a pull request | `open-pr` |
| Handle review comments on my pull request | `validate-comments`, then `fix-pr` |
| Ship what is merged | `release` |
| Start a new module | `new-module` |

2. If the person gave a ticket id and no goal, read the ticket's status in Linear (any tool or MCP server with `linear` in its name) and pick the skill from `docs/workflow/status-skills.md`. Without Linear access, ask the person for the ticket's status. Never guess it.
3. When `packs` contains `team`, also offer the team skills listed in `docs/workflow/skills.md`.
4. Check that the folder `agent/skills/<skill>/` exists. If it does not, say that the skill is not installed here and name the closest one that is. Never name a skill that has no folder.
5. If the goal fits two skills, ask one question to choose. If no skill fits, say so plainly.
6. Say in one or two sentences what the chosen skill does and what it will ask for (for example: the ticket id).
7. Ask: "Run `/<skill>` now?" On yes, read `agent/skills/<skill>/SKILL.md` and follow it from its first step.

## Output

A fixed report, written in the profile's `output_language`:

- **Done:** the profile values written into `AGENTS.md` (key and value), and the skill that was named.
- **Not done:** the profile keys still `<ask>`, and why. `AGENTS.md` is changed and not committed, if Part A wrote to it.
- **Next step:** the chosen skill, by name, with the exact text to type (for example `/refine-ticket <PREFIX>-<n>`).

## Do not

- Do not ask two questions in one message.
- Do not choose a profile value for the person, and do not write a value they did not give.
- Do not change any part of `AGENTS.md` other than the Value cells of the profile table.
- Do not stage, commit or push anything.
- Do not choose the skill for the person when the goal is ambiguous. Ask.
- Do not name a skill that is not in `agent/skills/`.
- Do not start the chosen skill's work before the person says yes.
