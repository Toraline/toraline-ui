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
- **Figma variable**: the same thing in Figma.
- **Mode**: one set of values of a Figma variable collection. A mode is often a theme, but not always. In the file "Intraweb: UI" the modes are `v1` and `v0`, and no mode is the dark theme. So name what each mode of the file is before you compare.

## Input

- Nothing: `/sync-tokens-figma` compares everything.
- One group: `/sync-tokens-figma bg` compares only the tokens whose name starts with `bg`.

## Reads

- `agent/rules/ask-first.md`, `agent/rules/writing.md`.
- `../design-component/reference.md`: the difference report shape.
- `packages/tokens/src/` and `packages/tokens/css/`: every level 1 and level 2 token, with its value in each theme. `packages/tokens/README.md` lists them.
- The library's Figma file (link in the description of the Linear project `toraline-ui`), through any tool or MCP server with `figma` in its name: every variable collection, its modes and its values. Without access: stop and say so. Do not guess a value.
- What the Figma read tools can and cannot read (found in the first real run, on the file "Intraweb: UI"):
  - The variables tool lists only the variables used inside one frame. It gives one resolved value for each, and no collection and no mode.
  - Call the variables tool on each top-level frame, never on a page. A page id fails with "You currently have nothing selected".
  - When the full list of collections and modes is needed, stop and ask the person for an export of the variables.

## Steps

1. Read both sides. Build one table: name, value in code per theme, value in Figma per mode.
2. Match by the code syntax of the Figma variable, not by its Figma name. The code syntax is the CSS form that the variables tool returns, for example `var(--bg-primary)`, which is `--bg-primary` in code. The Figma name has another form: the layer labels show `bg/primary`. Say which forms the file uses.
3. Compare the resolved values. A color is compared as a hex value with its opacity. A size is compared in pixels (`1rem` is 16 pixels). A variable that points to another variable is compared by what it points to, and also by its final value. Say what each mode of the file is, and compare a theme of the code only with the mode that is that theme. When no mode is the dark theme, report the dark theme as missing in Figma; do not compare it with another mode.
4. Report, in this order:
   - in code and not in Figma;
   - in Figma and not in code;
   - same name, different value, per theme;
   - a theme that one side has and the other does not;
   - shadows and text styles, in a part of their own: in Figma they are styles, not variables, so the variables tool does not list them. Compare them separately, with a tool that reads the styles; without one, write "not checked";
   - layers of the Figma components that use a raw value in place of a variable (count per component). Only when a tool that reads the fills of a layer is available: the layer-tree tool shows no fills. Otherwise write "not checked".
5. For each difference, say which side you think is right and why. The rule: Intraweb's look is the reference, so a value that equals Intraweb's (`../prontera-e-juno/apps/intraweb/src/styles/themes/`) wins. Intraweb has 5 themes (`light`, `dark`, `cozy`, `old`, `glass`). Only `light` and `dark` are the reference, because the library has only those two.
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
