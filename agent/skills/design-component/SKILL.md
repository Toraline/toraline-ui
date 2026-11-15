---
name: design-component
description: toraline-ui - Runs the design process of one component before any code or Figma work (who uses it, the problem, how Intraweb and other libraries solve it, parts, variants, states, accessibility, tokens, props) and writes an approved design brief in the ticket. Use when the user says "design the component <name>", "design brief for <PREFIX>-123", "think through this component" or "/design-component".
disable-model-invocation: true
metadata:
  pack: project
  stage: Plan
---

# Design component

The design thinking for one component of `@toraline.tech/ui`. It leaves one approved design brief in the component's ticket. It writes no code and changes nothing in Figma. `figma-component` and `build-component` start from the brief.

A whole screen or flow of an app is the job of `design-screen`.

## Input

One of these:

- A ticket of a component: `/design-component TOR-1146`
- A component name with no ticket: `/design-component "Select"`. The skill then searches the Linear project `toraline-ui` for its ticket, and asks before creating one.

## Reads

- Project profile in `AGENTS.md`: `ticket_prefix`, `spec_location`, `output_language`.
- `agent/rules/writing.md`, `agent/rules/ask-first.md`.
- `reference.md` beside this file: the shape of the design brief and the list of states to check.
- The ticket, its parent and its sibling tickets, through any tool or MCP server with `linear` in its name. Without access: ask the person for the ticket text. Never invent it.
- This repository: `packages/ui/README.md` (the rules every component follows), `packages/ui/src/template/README.md`, `packages/tokens/README.md` (the tokens), `docs/decisions.md`, and the components that already exist in `packages/ui/src/`.
- Intraweb, read-only: the same component in `../prontera-e-juno/apps/intraweb/src/components/ui/`, the files that use it (search for its imports), and `../prontera-e-juno/docs/architecture/intraweb-design-system.md`. Intraweb is the first app that installs the library, and it must look the same afterwards.
- Figma, read-only, through any tool or MCP server with `figma` in its name: the component in the library's Figma file (linked in the description of the Linear project `toraline-ui`). Without access: say so in the brief under "Not verified" and go on.

## Steps

### Phase 1: understand

1. Read the ticket and the sources above. If the folder `../prontera-e-juno` is missing, say so and ask for its path.
2. Write down the facts, each with its source: where Intraweb uses the component (count the files), which variants, sizes and states it has there, which props, which tokens and classes, what the Figma component has, and where code and Figma differ.
3. Look at how 2 or 3 well-known libraries solve the same component, only for the questions that are open: its parts, its keyboard behaviour, its accessibility pattern. Name each source. The WAI-ARIA Authoring Practices Guide is the reference for keyboard and screen reader behaviour.

### Phase 2: questions

4. List what the sources do not settle. Ask the person one question at a time, each with your recommendation and its reason. Typical questions: a variant that exists in Figma and not in code; a behaviour Intraweb has that looks like a bug; a state nobody designed (see the list in `reference.md`).
5. An answer of "I do not know yet" becomes a line under "Open questions" in the brief. It blocks approval only when the component cannot be built without it.

### Phase 3: the brief

6. Write the brief in the shape of `reference.md`, from the facts and the answers only. Do not fill a gap with an assumption: a gap is a question.
7. Show the full brief and ask: "Do you approve this design brief?" Wait for a clear yes.
8. After the yes, write the brief into the ticket under the heading `## Design brief`, with the approval date. If `spec_location` is `both` or `file`, also save it as `local-docs/notes/<component>/<TICKET-ID>/brief.md`. `<component>` is the name in lowercase with dashes.

## Output

- **Done:** the ticket id; whether the brief is approved; where it is saved.
- **Not done:** the open questions, and what could not be read (Figma, Intraweb).
- **Next step:** `/figma-component <ticket>` when the Figma component is missing or differs from the brief; `/build-component <ticket>` when Figma already matches.

## Do not

- Do not write code, and do not change Figma.
- Do not ask two questions in one message.
- Do not change the look or the behaviour that Intraweb has today without a yes: the default is that Intraweb looks the same after it installs the library.
- Do not change anything in `../prontera-e-juno`.
- Do not write the brief into the ticket before the yes.
