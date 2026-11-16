import type { ReactNode } from "react";
import { createTheme } from "@toraline.tech/tokens";
import type { ThemeInput } from "@toraline.tech/tokens";
import { Button, Field, TextInput } from "@toraline.tech/ui";
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
      "bg-primary": "#0b5cad",
      "bg-primary-hover": "#084a8c",
      "text-brand": "#0b5cad",
      "bg-promo": "#b34700",
      "text-on-promo": "#ffffff",
    },
    fonts: { heading: "Georgia, serif" },
  },
  dark: {
    name: "guide-dark",
    base: "dark",
    colors: {
      "bg-primary": "#8cc8ff",
      "bg-primary-hover": "#b9dcff",
      "text-brand": "#8cc8ff",
      "bg-promo": "#ffb37a",
      "text-on-promo": "#0c111d",
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
      <p className="guide-promo-note">The color the app added</p>
      <Button>Save</Button>
      <ThemeToggle />
    </GuideTheme>
  );
}

/**
 * The result of guide 3: a Tailwind class of the app on a Button, a class of
 * the app's own CSS on a Button, and a rule of the app's own CSS on the inner
 * label of a Field.
 */
export function StyledOnTop() {
  return (
    <div className="guide-example">
      <Button>Save, as the library styles it</Button>
      <Button className="rounded-full">Save, with a Tailwind class of the app</Button>
      <Button className="guide-round">Save, with a class of the app's own CSS</Button>
      <Field className="guide-search" label="Search">
        <TextInput name="search" />
      </Field>
    </div>
  );
}
