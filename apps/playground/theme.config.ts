import type { ThemeInput } from "@toraline/tokens";

/** The heading font of this app: the font that app/fonts.ts loads, then fonts every device has. */
const headingFont = "var(--font-fraunces), Georgia, serif";

/**
 * The themes of this app. Each one is the input of the theme function "createTheme".
 * scripts/write-theme-css.ts turns this list into the file app/theme.generated.css.
 */
export const themeInputs: ThemeInput[] = [
  { name: "light", base: "light", isDefault: true, fonts: { heading: headingFont } },
  { name: "dark", base: "dark", fonts: { heading: headingFont } },
];

/** The theme names, in the order the toggle goes through them. */
export const themes = themeInputs.map((themeInput) => themeInput.name);
