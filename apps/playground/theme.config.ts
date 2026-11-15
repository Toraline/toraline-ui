import type { ThemeInput } from "@toraline/tokens";

/** The heading font of this app: the font that app/fonts.ts loads, then fonts every device has. */
const headingFont = "var(--font-fraunces), Georgia, serif";

/**
 * The themes of this app. Each one is the input of the theme function "createTheme".
 * scripts/write-theme-css.ts turns this list into the file app/theme.generated.css.
 *
 * "brand" and "brand-foreground" are colors the library does not have. They become
 * the tokens --color-brand and --color-brand-foreground, and the Tailwind classes
 * bg-brand, text-brand-foreground and the others.
 */
export const themeInputs: ThemeInput[] = [
  {
    name: "light",
    base: "light",
    isDefault: true,
    colors: { brand: "#b34700", "brand-foreground": "#ffffff" },
    fonts: { heading: headingFont },
  },
  {
    name: "dark",
    base: "dark",
    colors: { brand: "#ffb37a", "brand-foreground": "var(--grey-900)" },
    fonts: { heading: headingFont },
  },
];

/** The theme names, in the order the toggle goes through them. */
export const themes = themeInputs.map((themeInput) => themeInput.name);
