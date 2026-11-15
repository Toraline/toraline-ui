---
name: build-component
description: toraline-ui - Builds one component of the library in code from its approved design brief and its Figma component (the component with Tailwind classes that read the tokens, its tests, its stories in the catalog, the playground, the README and the change list) and runs the checks. Use when the user says "build the component <PREFIX>-123", "implement <name>", "code this component" or "/build-component".
disable-model-invocation: true
metadata:
  pack: project
  stage: Build
---

# Build component

Turns one approved design brief into a working component of `@toraline.tech/ui`. It leaves one commit in the worktree of the feature: the component, its tests, its stories, its documentation. It does not design: what the brief does not say is a question, not a guess.

## Input

A ticket whose description has an approved `## Design brief`: `/build-component TOR-1146`

## Reads

- Project profile in `AGENTS.md`: `base_branch`, `commit_format`, `check_command`, `push`, `finished_status`.
- `agent/rules/git-safety.md`, `agent/rules/ask-first.md`, `agent/rules/writing.md`.
- `../design-component/reference.md`: the shape of the brief.
- The ticket and its parent, through any tool or MCP server with `linear` in its name.
- `packages/ui/src/template/README.md`: the steps for a new component. `packages/ui/README.md`: the rules every component follows. `docs/decisions.md`: the conventions and the choices already made.
- The Figma component linked in the brief (`Figma: <link>`), read-only, through any tool or MCP server with `figma` in its name. Without access, build from the brief and say so under "Not verified".
- The same component in Intraweb, read-only: `../prontera-e-juno/apps/intraweb/src/components/ui/`.

## Steps

1. Read the brief. If the ticket has no `## Design brief`, or its status is not `approved`, stop and name `/design-component`.
2. Find the worktree. All tickets of one phase share one feature branch and one worktree (see `agent/rules/git-safety.md`). Use the worktree of the parent ticket; create it with `make worktree TICKET=<parent number> SLUG=<short-slug>` when it does not exist.
3. Follow the steps of `packages/ui/src/template/README.md` to create the component from the template.
4. Build from the brief, table by table:
   - "Variants and sizes" become the exported lists and the class maps.
   - "States" are set by the HTML or ARIA attribute the brief names, and styled with the Tailwind variant of that attribute.
   - "Tokens" give the token class of each part. No raw color, radius, font or shadow.
   - "Parts" give the `data-slot` of each inner element.
   - "Props" give the props, each with one comment. "Texts" are props; the library has no built-in text.
   - "Behaviour" and "Accessibility" give the keyboard handling and the pattern.
5. Write the tests the template names: it renders, each variant and size, each state, the keyboard, the accessible name, `className` on top, and `ref`.
6. Add the stories in `apps/catalog/stories/`: one story that shows every value of each list, one story per state. The story tests run the accessibility check in both themes.
7. Add the component to `apps/playground`, to `packages/ui/README.md` (props and one example) and to `CHANGELOG.md` under the current version. A change that breaks an app goes first, with what the app must change.
8. Compare with the Figma component: sizes, spacing, colors, radius and font of each variant and state, in both themes. Fix the code where it differs from the brief. Where the brief and Figma differ, do not choose: list it for `/review-component`.
9. Run `make check`. Fix what fails. Do not change a token value or lower a test to make it pass.
10. Stage the files by name and commit in the profile's `commit_format`, one commit for this ticket. Push as the profile's `push` says. Open the pull request when the feature branch has none.
11. Set the ticket to the profile's `finished_status`.

## Output

- **Done:** the files created; the commit; the result of `make check`; the stories added.
- **Not done:** rows of the brief that were not built, and why; differences between brief and Figma.
- **Next step:** `/review-component <ticket>`.

## Do not

- Do not add a variant, a size, a prop or a behaviour that the brief does not have. Ask, or name `/design-component`.
- Do not add a dependency without recording it in `docs/decisions.md`.
- Do not change Figma, and do not change anything in `../prontera-e-juno`.
- Do not merge the pull request, and do not publish to npm.
