---
name: design-screen
description: toraline-ui - Runs the design process of one screen or flow of an app that uses the library (the person's goal, the steps, the content, the layout, the components it uses, the loading, empty and error states) and writes an approved design brief in the ticket. Use when the user says "design the screen <name>", "design this flow", "which components does this screen need" or "/design-screen".
disable-model-invocation: true
metadata:
  pack: project
  stage: Plan
---

# Design screen

The design thinking for one screen or one flow of an app that uses `@toraline.tech/ui`. It leaves one approved design brief in the screen's ticket, and a list of the components the library is missing. It writes no code and changes nothing in Figma.

One component is the job of `design-component`.

## Input

- A ticket of a screen, in any Linear project: `/design-screen TOR-1300`
- A description with no ticket: `/design-screen "Intraweb: list of orders with filters"`. The skill asks in which project the ticket goes before creating it.

## Reads

- Project profile in `AGENTS.md`: `ticket_prefix`, `spec_location`, `output_language`.
- `agent/rules/writing.md`, `agent/rules/ask-first.md`.
- `../design-component/reference.md`: the shape "Design brief of a screen".
- The ticket and its linked tickets, through any tool or MCP server with `linear` in its name. Without access: ask the person for the ticket text.
- `packages/ui/README.md`: the components that exist and their props. The catalog (`make catalog`) shows them.
- The app's repository, read-only, when the person names it: the screens next to this one, to keep the same patterns.
- Figma, read-only, through any tool or MCP server with `figma` in its name, when the ticket links a frame. Without access: say so under "Not verified".

## Steps

1. Read the ticket and the sources. Write down who the person is, their goal, and what is already decided.
2. Ask what is missing, one question at a time, each with your recommendation. Start with the goal and the steps. Layout comes after the steps are agreed.
3. Write the steps of the flow, then the content of the screen, then the layout for a phone and for a desktop.
4. Map each region to a component of the library, with its variant. Use only components and variants that exist in `packages/ui/README.md`.
5. For each need that no component covers, do not design a new component here. Add a row to "Missing components" and propose one ticket in the Linear project `toraline-ui`, to be designed with `design-component`.
6. Fill every row of "States of the screen". A state with no answer is a question for the person.
7. Show the full brief and ask: "Do you approve this design brief?" Wait for a clear yes.
8. After the yes: write the brief into the ticket under `## Design brief`. If `spec_location` is `both` or `file`, save a copy as `local-docs/notes/<screen>/<TICKET-ID>/brief.md`. Show the list of proposed tickets for missing components and ask for a yes before creating them.

## Output

- **Done:** the ticket id; whether the brief is approved; the components the screen uses.
- **Not done:** open questions; missing components with their proposed tickets.
- **Next step:** `/design-component` for each missing component; then the app's own skill that builds the screen.

## Do not

- Do not write code, and do not change Figma.
- Do not ask two questions in one message.
- Do not invent a component, a variant or a prop that the library does not have. A gap is a row in "Missing components".
- Do not create tickets before the yes.
