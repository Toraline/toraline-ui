---
name: figma-component
description: toraline-ui - Creates or updates one component in the library's Figma file from its approved design brief, with one Figma variant per variant, size and state, and every color, radius and font bound to a Figma variable. Use when the user says "create the Figma component for <PREFIX>-123", "update <name> in Figma", "put this component in Figma" or "/figma-component".
disable-model-invocation: true
metadata:
  pack: project
  stage: Build
---

# Figma component

Makes the Figma side of one component match its approved design brief. It leaves one Figma component (a component set when it has variants) in the library's Figma file, and a link to it in the ticket. It writes no code.

## Input

A ticket whose description has an approved `## Design brief`: `/figma-component TOR-1146`

## Reads

- Project profile in `AGENTS.md`: `output_language`.
- `agent/rules/ask-first.md`, `agent/rules/writing.md`.
- `../design-component/reference.md`: the shape of the brief and of the difference report.
- The ticket, through any tool or MCP server with `linear` in its name.
- The library's Figma file: "Toraline UI Package" (https://www.figma.com/design/pXP3o9rTaRDkxGd5CuoCRa/Toraline-UI-Package). The description of the Linear project `toraline-ui` names it. The file "Intraweb: UI" is the file of the Intraweb app: it is the reference for the look, and it is never changed.
- `packages/tokens/`: the token names, to match them with the Figma variables.

## Needs

- A tool or MCP server with `figma` in its name that can write to the file. With read-only access, or with none: stop at step 3 and give the person the list of changes to make by hand. Never say a Figma change was made when it was not.
- When the session has a skill for writing to Figma (for example one named `figma-use`), load it before the first write.

## Steps

1. Read the brief. If the ticket has no `## Design brief`, or its status is not `approved`, stop and name `/design-component`.
2. Read the component in Figma, if it exists: its variants, its properties, the variables it uses, and the layers that have a raw value in place of a variable.
3. Write the list of changes: what will be created, renamed, changed or removed. Use the difference report shape for what exists and differs. Show it and ask for a yes. Figma is a shared place: nothing is written before the yes.
4. Check the variables first. Every token class in the brief's "Tokens" table needs a Figma variable with the same name, in the modes `light` and `dark` of the collection `Theme`. A variable name has `/` where the token has `-` after its group: the token `bg-primary` is the variable `bg/primary`. A missing variable is not created here: stop and name `/sync-tokens-figma`.
5. Create or update the component:
   - One component set. One Figma property per row of "Variants and sizes", with the same names and values as the props in code (`variant`, `size`).
   - One variant per state of the brief that changes the look (rest, hover, focus, disabled, loading, error, and so on).
   - Auto layout for every frame. Spacing, radius, colors, fonts and shadows are bound to variables or styles. A raw value stays only where the code has no token for it (for example 6, 10 or 20 pixels, or a full radius); list each one in the report.
   - A part that has parts of its own (a tab inside Tabs, a link inside TabNav) is one component set per part, on the same page.
   - An optional icon is one instance-swap property plus one boolean property that shows or hides it.
   - The focus ring is a layer named `focus-ring`. It is the only layer whose name is not a `data-slot`.
   - Layer names equal the `data-slot` names of the brief's "Parts" table.
   - The component's description holds one line on what it is for, and the ticket id.
6. Do not delete or detach anything that other frames of the file use. A component that must be replaced is renamed with the prefix `Deprecated / `, and the list of frames that still use it goes in the report.
7. Next to the component set, build one frame in the mode `dark` that holds one instance of each variant. Take a screenshot of the component set (light) and of that frame (dark). Compare both with the brief, row by row, and with the same component in the catalog (https://toraline-ui.vercel.app/).
8. Add the link of the Figma component to the ticket, under `## Design brief`, as the line `Figma: <link>`.

## Output

- **Done:** the link of the Figma component; the variants and properties it has.
- **Not done:** rows of the brief that Figma cannot express, changes left for the person, missing variables.
- **Next step:** `/build-component <ticket>`, or `/review-component <ticket>` when the code already exists.

## Do not

- Do not change the brief to fit Figma. A row that cannot be done is reported.
- Do not create or change variables. That is `sync-tokens-figma`.
- Do not publish the Figma library and do not change who can open the file.
- Do not touch pages or components that are not the component of this ticket.
