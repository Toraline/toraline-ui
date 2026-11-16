import { useEffect, useLayoutEffect } from "react";
import type { ReactNode } from "react";
import type { Decorator, Preview } from "@storybook/react-vite";
import { useGlobals } from "storybook/preview-api";
import { THEME_ATTRIBUTE, resolveTheme } from "@toraline.tech/tokens";
import { ThemeProvider, useTheme } from "@toraline.tech/ui/theme";

// Tailwind CSS 4 with the preset of the library (the tokens, the two themes,
// and the classes of the components), and the CSS of the catalog itself.
import "./preview.css";

import { StoryLanguageContext } from "../stories/shared/language";
import { catalogLanguages, defaultCatalogLanguage, resolveCatalogLanguage } from "./languages";
import { catalogThemes, defaultCatalogTheme } from "./themes";

/**
 * Tells the toolbar when the theme changed inside a story, for example after
 * a press on ThemeToggle. Without it the toolbar would still name the old theme.
 */
function ToolbarSync({
  toolbarTheme,
  onThemeChange,
}: {
  toolbarTheme: string;
  onThemeChange: (theme: string) => void;
}) {
  const { theme } = useTheme();

  useEffect(() => {
    if (theme !== toolbarTheme) {
      onThemeChange(theme);
    }
  }, [theme, toolbarTheme, onThemeChange]);

  return null;
}

/**
 * Shows a story in one theme, the way the library expects it: the attribute
 * data-theme on <html>, and ThemeProvider around the story.
 */
function ThemeFrame({
  theme,
  onThemeChange,
  children,
}: {
  theme: string;
  onThemeChange: (theme: string) => void;
  children: ReactNode;
}) {
  // A layout effect runs before the effect of ThemeProvider, which reads the
  // attribute. So the provider starts with the theme of the toolbar.
  useLayoutEffect(() => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
  }, [theme]);

  return (
    // "key" makes a new provider when the toolbar changes the theme, because
    // the provider reads "initialTheme" only once.
    <ThemeProvider key={theme} themes={catalogThemes} initialTheme={theme}>
      <ToolbarSync toolbarTheme={theme} onThemeChange={onThemeChange} />
      {children}
    </ThemeProvider>
  );
}

/** A decorator is a function that wraps every story. This one applies the theme of the toolbar. */
const withTheme: Decorator = (Story, context) => {
  const [, updateGlobals] = useGlobals();
  const theme = resolveTheme(context.globals.theme as string | undefined, catalogThemes);

  return (
    <ThemeFrame theme={theme} onThemeChange={(nextTheme) => updateGlobals({ theme: nextTheme })}>
      <Story />
    </ThemeFrame>
  );
};

/**
 * Gives every story the language of the toolbar. Only the stories of the
 * documentation pages read it (the tables of the tokens page). A component
 * story is in English in every language.
 */
const withLanguage: Decorator = (Story, context) => (
  <StoryLanguageContext value={resolveCatalogLanguage(context.globals.language)}>
    <Story />
  </StoryLanguageContext>
);

/** The configuration of every story: the two controls of the toolbar, and the decorators. */
const preview: Preview = {
  // A global is a value that every story shares. "theme" is the name of the current theme.
  globalTypes: {
    theme: {
      description: "The theme of every story",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: catalogThemes.map((theme) => ({ value: theme, title: `Theme: ${theme}` })),
        dynamicTitle: true,
      },
    },
    // "language" is the language of the documentation pages: the guide and the tokens page.
    language: {
      description: "The language of the guide and of the tokens page",
      toolbar: {
        title: "Language",
        icon: "globe",
        items: catalogLanguages.map(({ value, title }) => ({ value, title })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: defaultCatalogTheme,
    language: defaultCatalogLanguage,
  },
  decorators: [withLanguage, withTheme],
  // Every component gets a documentation page, built from its stories and its props.
  tags: ["autodocs"],
  parameters: {
    // The space around a story.
    layout: "padded",
    options: {
      // The order of the sidebar: the guide first, then the tokens, then the components.
      storySort: {
        order: ["Guide", ["How to use the library", "Live examples"], "Foundations", "Components"],
      },
    },
    a11y: {
      // "error": an accessibility problem in a story makes the test of that story fail.
      test: "error",
    },
  },
};

export default preview;
