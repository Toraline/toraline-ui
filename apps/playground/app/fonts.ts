import localFont from "next/font/local";

/**
 * The font this app loads by itself, with next/font. The library does not know it.
 * next/font puts the font in the CSS variable --font-fraunces. theme.config.ts
 * gives that variable to the theme function as the heading font.
 *
 * The file is Fraunces (latin, weights 100 to 900), copied from the npm package
 * @fontsource-variable/fraunces 5.3.0. Its license is in fonts/LICENSE-Fraunces.txt.
 */
export const fraunces = localFont({
  src: "./fonts/fraunces-latin-wght-normal.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-fraunces",
});
