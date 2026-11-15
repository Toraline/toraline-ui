import type { ReactNode } from "react";
import { createTheme } from "@toraline.tech/tokens";
import type { ThemeInput } from "@toraline.tech/tokens";
import { Button, Input } from "@toraline.tech/ui";
import { ThemeToggle, useTheme } from "@toraline.tech/ui/theme";
import "./guide-examples.css";

/**
 * The live examples of the guide (docs/guide.md). They use the same values
 * and the same class names as the guide, so the page shows what the guide gives.
 */

/**
 * The themes of guide 2, with the same colors. The names start with "guide-",
 * so they do not replace the themes "light" and "dark" of the catalog.
 */
const guideThemeInputs: Record<string, ThemeInput> = {
  light: {
    name: "guide-light",
    base: "light",
    colors: {
      primary: "#0b5cad",
      "primary-hover": "#084a8c",
      brand: "#b34700",
      "brand-foreground": "#ffffff",
    },
    fonts: { heading: "Georgia, serif" },
  },
  dark: {
    name: "guide-dark",
    base: "dark",
    colors: {
      primary: "#8cc8ff",
      "primary-hover": "#b9dcff",
      brand: "#ffb37a",
      "brand-foreground": "#0f1928",
    },
    fonts: { heading: "Georgia, serif" },
  },
};

/** The CSS of the two themes, built by the theme function of the library. */
const guideThemeCss = Object.values(guideThemeInputs).map(createTheme).join("\n");

/**
 * Shows its content in the theme of the guide that matches the current theme
 * of the catalog. An app writes the CSS to a file before the build; here it
 * is in a <style> element, because the example is only one part of a page.
 */
function GuideTheme({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const guideTheme = guideThemeInputs[theme] ?? guideThemeInputs.light;

  return (
    <>
      <style>{guideThemeCss}</style>
      <div className="guide-example" data-theme={guideTheme?.name}>
        {children}
      </div>
    </>
  );
}

/** The result of guide 2: the app's own main color, an added color, a heading font, and the theme button. */
export function ThemedApp() {
  return (
    <GuideTheme>
      <h2 className="guide-example__heading">My app</h2>
      <p className="guide-brand-note">The color the app added</p>
      <Button>Save</Button>
      <ThemeToggle />
    </GuideTheme>
  );
}

/** The result of guide 3: a class of the app on a Button, and on the inner field of an Input. */
export function StyledOnTop() {
  return (
    <div className="guide-example">
      <Button>Save, as the library styles it</Button>
      <Button className="guide-round">Save, with the class of the app</Button>
      <Input className="guide-search" label="Search" name="search" />
    </div>
  );
}
