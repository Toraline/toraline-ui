# Design brief: shapes

Used by `design-component`, `design-screen`, `figma-component`, `build-component` and `review-component`. Replace every `<placeholder>`. Write in the profile's `output_language`.

## Design brief of a component

Goes in the component's ticket under `## Design brief`. The other skills find it by that heading. Keep the headings exactly.

```markdown
## Design brief

Approved on <YYYY-MM-DD> by <who approved>. Status: <draft / approved>.

### What it is for
<Two or three sentences: who uses it, in which situation, and what goes wrong without it.>

### Where it is used today
| Place | How many files | Notes |
|---|---|---|
| Intraweb | <n> | <for example: mostly inside forms> |

### Parts
| Part | `data-slot` | What it is |
|---|---|---|

### Variants and sizes
| Name | Values | Default | Source |
|---|---|---|---|
| variant | <primary, secondary> | <primary> | <Intraweb `button.tsx` / Figma / decided on <date>> |

### States
| State | How it is set | What changes | What a screen reader says |
|---|---|---|---|

### Behaviour
- Keyboard: <keys and what each does>.
- Pointer and touch: <what a click, a press outside, a hover does>.
- Focus: <where the focus goes when it opens and closes>.

### Accessibility
- Pattern: <the WAI-ARIA pattern, with its link, or "native element">.
- Name: <where the accessible name comes from>.
- Contrast: <the token pairs that must pass in both themes>.

### Tokens
| Part | Property | Token class |
|---|---|---|

### Props
| Prop | Type | Default | What it does |
|---|---|---|---|

### Texts
<Texts the component shows by itself. The library has no translations: each one is a prop that the app gives.>

### Differences from Intraweb
| What | Intraweb today | The library | Why | Approved |
|---|---|---|---|---|

### Not in this component
- <What was left out, and where it goes.>

### Open questions
- <Question>: <what is missing>.

### Not verified
- <What could not be read or checked, for example the Figma file.>
```

## States to check

Go through this list for every component. A state that does not apply is written as "does not apply", not left out.

1. Rest.
2. Hover (only on devices that can hover).
3. Keyboard focus.
4. Pressed or active.
5. Disabled.
6. Read-only (form controls).
7. Loading or busy.
8. Error or invalid, with its message.
9. Empty: no value, no items.
10. Selected, checked or current.
11. Open and closed (anything that opens).
12. Long content: a very long label, many items, a narrow container.
13. Right-to-left text: say whether it was considered.
14. Light theme and dark theme.
15. Reduced motion, for anything that animates.

## Design brief of a screen

Goes in the screen's ticket under `## Design brief`.

```markdown
## Design brief

Approved on <YYYY-MM-DD> by <who approved>. Status: <draft / approved>.

### The person and the goal
<Who opens this screen, what they want to get done, and how they know it worked.>

### Where it starts and where it ends
<The screen or event before it, and where the person goes after.>

### Steps
| # | The person does | The screen shows |
|---|---|---|

### Content
| Item | Where the data comes from | Required |
|---|---|---|

### Layout
<The regions of the screen, in reading order, for a phone and for a desktop.>

### Components
| Region | Component of `@toraline.tech/ui` | Variant | Exists today |
|---|---|---|---|

### Missing components
| Need | Proposed component | Ticket |
|---|---|---|

### States of the screen
| State | What the person sees |
|---|---|
| Loading | |
| Empty | |
| Error | |
| No permission | |
| Offline | |
| Success | |

### Accessibility
- Order of the headings, the landmark regions, where the focus goes when the screen opens.

### Open questions
- <Question>: <what is missing>.

### Not verified
- <What could not be read or checked.>
```

## Difference report

Used by `review-component` and `sync-tokens-figma`.

```markdown
| # | What | Brief | Figma | Code | Severity | Fix in |
|---|---|---|---|---|---|---|
| 1 | <for example: height of size md> | 40px | 40px | 44px | <blocks / should fix / note> | <code / Figma / brief> |
```

- **blocks**: the component looks or behaves differently for a person, or fails accessibility.
- **should fix**: a naming or structure difference that will cause a mistake later.
- **note**: a difference that changes nothing a person can see.
