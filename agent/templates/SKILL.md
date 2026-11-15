---
name: skill-name
description: One sentence saying what the skill does. Use when the user says "example phrase", "another phrase" or "/skill-name".
disable-model-invocation: true
metadata:
  pack: core
  stage: Plan
---

# Skill title

One or two sentences: what this skill is for and what it leaves behind.

## Input

What the person must give, with one example: `/skill-name TOR-123`.

## Reads

- Project profile in `AGENTS.md`: `ticket_prefix`, `base_branch` (list only the keys used).
- `agent/rules/writing.md`, `agent/rules/git-safety.md`, `agent/rules/ask-first.md` (list only the ones used; never paste their text here).
- Other files, by path.

## Steps

1. Numbered. Each step names the script or command it runs, if any.
2. One question at a time when the skill must ask.

## Output

A fixed report:

- **Done:** what now exists, with paths.
- **Not done:** what was skipped or failed, and why.
- **Next step:** the next skill to run, by name.

## Do not

- The things this skill never does.
