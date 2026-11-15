---
name: sync-tokens-figma
description: toraline-ui - Compares the tokens in code with the variables in the library's Figma file, for each theme, and reports every difference in name, value or mode; changes one side only after a yes. Use when the user says "compare the tokens with Figma", "are the Figma variables up to date", "sync the tokens" or "/sync-tokens-figma".
disable-model-invocation: true
metadata:
  pack: project
  stage: Deliver
---

# Sync tokens with Figma

Keeps the tokens of `packages/tokens` and the variables of the library's Figma file equal. By default it only reports. It leaves a difference report, and, after a yes, the changes on the side the person chose.

## Words

- **Token**: a named design value in code, stored as a CSS variable. Level 1 is a raw value. Level 2 is a meaning, and it has one value per theme.
- **Figma variable**: the same thing in Figma. A **mode** in Figma is a theme.

## Input

- Nothing: `/sync-tokens-figma` compares everything.
- One group: `/sync-tokens-figma bg` compares only the tokens whose name starts with `bg`.

## Reads

- `agent/rules/ask-first.md`, `agent/rules/writing.md`.
- `../design-component/reference.md`: the difference report shape.
- `packages/tokens/src/` and `packages/tokens/css/`: every level 1 and level 2 token, with its value in each theme. `packages/tokens/README.md` lists them.
- The library's Figma file (link in the description of the Linear project `toraline-ui`), through any tool or MCP server with `figma` in its name: every variable collection, its modes and its values. Without access: stop and say so. Do not guess a value.

## Steps

1. Read both sides. Build one table: name, value in code per theme, value in Figma per mode.
2. Match by name. The name in code and in Figma is the same except for the form: `--bg-primary` in code is `bg/primary` or `bg-primary` in Figma. Say which form the file uses.
3. Compare the resolved values. A color is compared as a hex value with its opacity. A size is compared in pixels (`1rem` is 16 pixels). A variable that points to another variable is compared by what it points to, and also by its final value.
4. Report, in this order:
   - in code and not in Figma;
   - in Figma and not in code;
   - same name, different value, per theme;
   - a theme that one side has and the other does not;
   - layers of the Figma components that use a raw value in place of a variable (count per component).
5. For each difference, say which side you think is right and why. The rule: Intraweb's look is the reference, so a value that equals Intraweb's (`../prontera-e-juno/apps/intraweb/src/styles/themes/`) wins.
6. Stop here unless the person asks to fix. Then ask one question: "Which side changes: code or Figma?", per group of differences.
7. A change in code is made in a ticket's worktree, as any code change, with `make check`. A change in Figma is made only with a write tool for Figma, after the yes, and each changed variable is listed in the report.
8. Run the comparison again and show what is left.

## Output

- **Done:** the count of tokens compared and of differences per kind; what was changed and where.
- **Not done:** differences left, and why (no access, waiting for a decision).
- **Next step:** `/review-component <ticket>` for a component whose tokens changed.

## Do not

- Do not change a value on any side without a yes for that group.
- Do not rename a token in code here. A rename breaks every app; it needs its own ticket.
- Do not delete a Figma variable that a component still uses.
- Do not publish the Figma library.
