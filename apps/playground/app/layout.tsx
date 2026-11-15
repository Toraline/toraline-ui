import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { THEME_COOKIE_NAME, resolveTheme } from "@toraline/tokens";
import { ThemeProvider } from "@toraline/ui/theme";
import { themes } from "../theme.config";
import { fraunces } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "toraline-ui playground",
  description: "Test page for the tokens, the themes and the theme toggle.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // fraunces.variable is a class that defines the CSS variable --font-fraunces.
  // The browser sends the saved theme in a cookie. The server reads it here and
  // writes it on <html>, so the page arrives already in the right theme.
  const cookieStore = await cookies();
  const theme = resolveTheme(cookieStore.get(THEME_COOKIE_NAME)?.value, themes);

  return (
    <html lang="en" data-theme={theme} className={fraunces.variable}>
      <body className="bg-surface text-text">
        <ThemeProvider themes={themes} initialTheme={theme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
