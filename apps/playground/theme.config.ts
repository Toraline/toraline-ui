import type { ThemeInput } from "@toraline.tech/tokens";

/**
 * The heading font of the theme "paper": a font that app/fonts.ts loads and the
 * library does not know, then fonts every device has.
 */
const paperHeadingFont = "var(--font-fraunces), Georgia, serif";

/**
 * The themes of this app. Each one is the input of the theme function "createTheme".
 * scripts/write-theme-css.ts turns this list into the file app/theme.generated.css.
 *
 * "bg-promo" and "text-on-promo" are colors the library does not have. They become
 * the tokens --bg-promo and --text-on-promo, and the Tailwind classes bg-promo
 * and text-on-promo.
 *
 * The themes "light" and "dark" keep the fonts of the library: Inter and Poppins.
 * The theme "paper" is this app's own. It shows that an app can still set
 * another font, and change a color, through the theme function.
 */
export const themeInputs: ThemeInput[] = [
  {
    name: "light",
    base: "light",
    isDefault: true,
    colors: { "bg-promo": "#b34700", "text-on-promo": "#ffffff" },
  },
  {
    name: "dark",
    base: "dark",
    colors: { "bg-promo": "#ffb37a", "text-on-promo": "#0c111d" },
  },
  {
    name: "paper",
    base: "light",
    colors: {
      "bg-page": "var(--color-cream-100)",
      "bg-promo": "#b34700",
      "text-on-promo": "#ffffff",
    },
    fonts: { heading: paperHeadingFont },
  },
];

/** The theme names, in the order the toggle goes through them. */
export const themes = themeInputs.map((themeInput) => themeInput.name);
