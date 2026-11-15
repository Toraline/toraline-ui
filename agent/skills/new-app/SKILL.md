---
name: new-app
description: Creates the skeleton of a new app inside the monorepo, with the same structure as the existing apps. Use when the user says "create a new app", "add an app called <name>", "scaffold an app" or "/new-app".
disable-model-invocation: true
metadata:
  pack: core
  stage: Build
---

# New app

Creates the skeleton of one new app: the folder, the configuration, one starting screen or endpoint, one test, and the entries in the root files that list the apps. It copies the structure of an existing app of this repository. It adds no product behavior.

## Input

The ticket id, the app name in kebab-case, and one or two sentences saying what the app is for.

Example: `/new-app <PREFIX>-123 admin-portal "Internal page for the support team"`

## Reads

- Project profile in `AGENTS.md`: `ticket_prefix`, `base_branch`, `worktree_path`, `main_checkout`, `check_command`, `output_language`.
- `agent/rules/writing.md`, `agent/rules/git-safety.md`, `agent/rules/ask-first.md`.
- `docs/` files about architecture and project standards, if they exist.
- The folder that holds the apps (for example `apps/`) and every existing app in it: its package or build file, its configuration files, its folder tree, its `README.md`, its `AGENTS.md` if it has one.
- The root files that name each app: `Makefile`, the root package or workspace file, `.env.example`, the continuous integration configuration, `README.md`.

## Steps

1. Read the profile values with `scripts/profile.sh get <key>`.
2. Collect the input. Ask only for what is missing, one question at a time:
   1. Which ticket is this work for? A new app is a change to the repository, so it needs a ticket and a worktree. Without a ticket, stop.
   2. The app name (kebab-case).
   3. What the app is for.
   4. Which existing app is the model to copy the structure from. Show the list of existing apps. Skip this question when there is only one app of that kind.
   5. What must differ from the model on purpose (for example: the port). The answer can be "nothing".
3. Check the name: kebab-case; no existing folder with that name in the apps folder; not the name of a shared package. If a check fails, stop and say which one.
4. Study the model app. Write down, from the real files:
   - the technology and the exact versions it uses (a framework name such as Next.js or Django is only an example; use what the model app uses);
   - its folder tree, to the depth where its conventions are visible;
   - its commands for run, test, lint and build;
   - how it reads environment variables, and which port it uses;
   - each root file that mentions it, and the exact lines.
   Read the versions and names from the files. Do not write them from memory.
5. Choose a free port, if the app listens on one: read the ports of the existing apps and take the next number that is not used.
6. Show the plan and ask for a yes: name, purpose, model app, port, the differences from the model, the list of files to create, the root files to change with the lines to add. Wait for a clear yes.
7. Open the ticket's worktree. Run `make worktree-list`. If the ticket has no worktree, run `make worktree TICKET=<n> SLUG=new-app-<name>` from the main checkout. Work only inside the worktree. Confirm with `git rev-parse --show-toplevel`.
8. Check whether the repository has its own generator for apps (a make target or a script that the model app's documentation names). If it has one, use it and skip to step 10. If it fails, stop and report its message.
9. Create the skeleton by hand, in the apps folder, as `<name>/`:
   - the package or build file, with the same versions and scripts as the model app;
   - the same configuration files (compiler, linter, formatter, tests), adjusted only where the name or the port appears;
   - the same folder tree, with only the files needed for the app to start;
   - one starting screen or one health endpoint that shows the app name;
   - one test that passes, in the model app's test style;
   - a `README.md`: what the app is for, how to run it, and the list of differences from the model;
   - an `.env.example` when the model app has one, with names only and no real values.
   Do not copy the model app's product code, texts, images, branding or data.
10. Add the new app to the root files, following the lines of the model app exactly: `Makefile` targets, workspace list, `.env.example`, continuous integration, the app list in `README.md`. Change nothing else in these files.
11. Install the dependencies and run the new app's test, lint and build commands. Then run the profile's `check_command`. Fix only problems of the skeleton.
12. Add an entry at the top of `log.md` in the ticket's notes folder (`local-docs/notes/<feature>/<TICKET-ID>/` or `local-docs/notes/<TICKET-ID>/`): date, app name, model app, files created, root files changed, result of the checks.

## Output

A fixed report:

- **Done:** folder of the new app; files created; root files changed, with the lines added; port; the commands to run, test, lint and build the app; result of `check_command`; path of `log.md`.
- **Not done:** what was skipped or failed, and why; the differences from the model app; what was not verified (for example: the app was not opened in a browser).
- **Next step:** `review-diff` in this worktree.

## Do not

- Do not use a generic project generator with its default settings. The model is an existing app of this repository.
- Do not overwrite or change an existing app.
- Do not add product features, a database, or dependencies that the model app does not have, unless the person listed them as a difference.
- Do not copy product content, branding or data from the model app.
- Do not write real secrets. Only names in `.env.example`.
- Do not create the app in the main checkout when `main_checkout` is `protected`.
- Do not commit, push or open a pull request.
