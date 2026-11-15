import localFont from "next/font/local";

/**
 * The fonts this app loads by itself, with next/font. The library names its
 * default fonts and downloads no font file: each app loads them.
 *
 * next/font puts each font in a CSS variable. app/layout.tsx puts the classes
 * that define the variables on <html>.
 *
 * The font files are in the folder fonts/, so the build needs no network.
 * They are copied from npm packages, and their licenses (SIL Open Font
 * License 1.1) are in the same folder:
 * - Inter (latin, weights 100 to 900): @fontsource-variable/inter 5.3.0.
 * - Poppins (latin, weights 400, 500 and 600): @fontsource/poppins 5.3.0.
 * - Fraunces (latin, weights 100 to 900): @fontsource-variable/fraunces 5.3.0.
 */

/**
 * Inter, the default font of normal text. The library reads the variable
 * --font-inter: its token --font-body is "var(--font-inter, "Inter"), ...".
 */
export const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-inter",
});

/**
 * Poppins, the default font of headings and buttons, in the 3 weights the
 * library uses. The library reads the variable --font-poppins.
 */
export const poppins = localFont({
  src: [
    { path: "./fonts/poppins-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/poppins-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/poppins-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  display: "swap",
  variable: "--font-poppins",
});

/**
 * Fraunces, a font the library does not know. theme.config.ts gives the
 * variable --font-fraunces to the theme function as the heading font of the
 * theme "paper". The browser downloads the file only when that theme is shown.
 */
export const fraunces = localFont({
  src: "./fonts/fraunces-latin-wght-normal.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-fraunces",
  preload: false,
});
