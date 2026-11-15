---
name: review-component
description: toraline-ui - Compares one component in code, in Figma and in Intraweb with its approved design brief, in the light and the dark theme, and lists every difference with its severity and where to fix it; changes nothing. Use when the user says "review the component <PREFIX>-123", "does <name> match Figma", "check this component against the brief" or "/review-component".
disable-model-invocation: true
metadata:
  pack: project
  stage: Deliver
---

# Review component

Checks that one component is the same thing in four places: the approved design brief, the Figma component, the code of the library, and the component Intraweb has today. It leaves one difference report in the ticket's notes. It changes no code and nothing in Figma.

## Input

A ticket of a component that is built: `/review-component TOR-1146`

## Reads

- Project profile in `AGENTS.md`: `spec_location`, `output_language`.
- `agent/rules/writing.md`.
- `../design-component/reference.md`: the brief, the list of states, the difference report shape.
- The ticket, through any tool or MCP server with `linear` in its name: the `## Design brief` and the line `Figma: <link>`.
- The code: `packages/ui/src/<name>/`, its tests, its stories in `apps/catalog/stories/`.
- The Figma component, read-only, through any tool or MCP server with `figma` in its name. Without access: review brief against code only, and write "Figma: not checked" at the top of the report.
- Intraweb's component, read-only: `../prontera-e-juno/apps/intraweb/src/components/ui/`.

## Steps

1. Read the brief. With no approved brief, stop and name `/design-component`.
2. Build the catalog (`make catalog-build`) or open it (`make catalog`), and look at each story of the component in the light and the dark theme.
3. Compare, row by row of the brief:
   - **Variants and sizes:** the lists in code, the properties in Figma, the names and the default.
   - **States:** go through the list "States to check" of `reference.md`. For each state: is there a story, is the attribute the one the brief names, does it look as in Figma.
   - **Measures:** for each variant and size, the height, the padding, the gap, the radius, the border, the font family, size and weight, read from the browser and from Figma.
   - **Tokens:** each part uses the token class of the brief; no raw value in code; no raw value in the Figma layers.
   - **Behaviour:** try every key of the brief with the keyboard. Check where the focus goes.
   - **Accessibility:** the story tests pass in both themes; the accessible name; the pattern.
   - **Props:** the props in code equal the brief; each has a comment; the README lists them.
4. Compare with Intraweb: the same variant and size in Intraweb's component gives the same measures and colors. A difference that the brief's table "Differences from Intraweb" approves is not reported again.
5. Write the report in the difference report shape, most severe first. Each row says where the fix goes: code, Figma or the brief. When code and Figma agree and the brief differs, the brief may be the one that is out of date: say so, and do not decide.
6. If `spec_location` is `both` or `file`, save the report as `local-docs/notes/<component>/<TICKET-ID>/review-v<n>.md`. Show the report in the chat.

## Output

- **Done:** what was compared; the count of differences per severity; where the report is.
- **Not done:** what could not be checked (Figma access, a state with no story).
- **Next step:** `/build-component <ticket>` for fixes in code; `/figma-component <ticket>` for fixes in Figma; `/design-component <ticket>` when the brief must change. "No differences" when there are none.

## Do not

- Do not change code, Figma, the brief or the ticket's status.
- Do not post the report as a comment on GitHub, Linear or Figma. The person decides what to send.
- Do not report a difference that changes nothing a person can see as "blocks".
