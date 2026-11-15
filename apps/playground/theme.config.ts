import type { ThemeInput } from "@toraline.tech/tokens";

/** The heading font of this app: the font that app/fonts.ts loads, then fonts every device has. */
const headingFont = "var(--font-fraunces), Georgia, serif";

/**
 * The themes of this app. Each one is the input of the theme function "createTheme".
 * scripts/write-theme-css.ts turns this list into the file app/theme.generated.css.
 *
 * "bg-promo" and "text-on-promo" are colors the library does not have. They become
 * the tokens --bg-promo and --text-on-promo, and the Tailwind classes bg-promo
 * and text-on-promo.
 */
export const themeInputs: ThemeInput[] = [
  {
    name: "light",
    base: "light",
    isDefault: true,
    colors: { "bg-promo": "#b34700", "text-on-promo": "#ffffff" },
    fonts: { heading: headingFont },
  },
  {
    name: "dark",
    base: "dark",
    colors: { "bg-promo": "#ffb37a", "text-on-promo": "#0c111d" },
    fonts: { heading: headingFont },
  },
];

/** The theme names, in the order the toggle goes through them. */
export const themes = themeInputs.map((themeInput) => themeInput.name);
