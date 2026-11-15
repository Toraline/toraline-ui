# Template of a component

This folder is the starting point of a new component of `@toraline.tech/ui`. `Example` is a small, working component: it is type checked, linted and tested with the rest of the package. It is not exported from the package, so an app cannot import it.

The rules a component follows are in [`packages/ui/README.md`](../../README.md#rules-every-component-follows).

## Files

| File | What it is |
|---|---|
| `Example.tsx` | The component: the list of variants, the list of sizes, the props with one comment each, and the function |
| `Example.test.tsx` | The tests every component has |
| `index.ts` | What the folder exports |
| `example.css` | The styles, inside the cascade layer `components` |

## Steps for a new component

Replace `<name>` with the name in lowercase with dashes (`split-button`) and `<Name>` with the name in React style (`SplitButton`).

1. Copy this folder to `packages/ui/src/<name>/`. Delete the copy of this `README.md`.
2. Rename `Example.tsx` to `<Name>.tsx` and `Example.test.tsx` to `<Name>.test.tsx`. Inside the files, rename `Example`, `example` and `tui-example`.
3. Move `example.css` to `packages/ui/css/<name>.css`.
4. Add the line `@import "./<name>.css";` to `packages/ui/css/styles.css`.
5. Export the component and its types from `packages/ui/src/index.ts`.
6. When the component uses React state, an effect or an event handler of its own, put `"use client";` on the first line of `<Name>.tsx`. Then move the lists of variants and sizes to a new file `<name>-options.ts` with no `"use client"`, as `src/button/button-options.ts` does.
7. Add the component to the page of `apps/playground`, with every variant and state.
8. Add the component to `packages/ui/README.md`: its props and one short example.
9. When the styles put text on a background that the contrast test does not have yet, add the pair to `packages/tokens/src/tokens.test.ts`.
10. Run `make check` from the repository root.
