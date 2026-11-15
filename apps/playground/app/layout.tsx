import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { THEME_COOKIE_NAME, resolveTheme } from "@toraline.tech/tokens";
import { ThemeProvider } from "@toraline.tech/ui/theme";
import { themes } from "../theme.config";
import { fraunces, inter, poppins } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "toraline-ui playground",
  description: "Test page for the tokens, the themes and the theme toggle.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // inter.variable is a class that defines the CSS variable --font-inter, and the
  // same for the other two fonts. The classes are on <html>, where the tokens of
  // the library read the variables.
  // The browser sends the saved theme in a cookie. The server reads it here and
  // writes it on <html>, so the page arrives already in the right theme.
  const cookieStore = await cookies();
  const theme = resolveTheme(cookieStore.get(THEME_COOKIE_NAME)?.value, themes);

  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${inter.variable} ${poppins.variable} ${fraunces.variable}`}
    >
      <body className="bg-page text-primary">
        <ThemeProvider themes={themes} initialTheme={theme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
