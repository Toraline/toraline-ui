import { useEffect, useLayoutEffect } from "react";
import type { ReactNode } from "react";
import type { Decorator, Preview } from "@storybook/react-vite";
import { useGlobals } from "storybook/preview-api";
import { THEME_ATTRIBUTE, resolveTheme } from "@toraline/tokens";
import { ThemeProvider, useTheme } from "@toraline/ui/theme";

// The tokens and the two themes of the library.
import "@toraline/tokens/css";
// The styles of the library's components.
import "@toraline/ui/styles.css";
// The CSS of the catalog itself.
import "./preview.css";

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

/** The configuration of every story: the theme control of the toolbar, and the decorator. */
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
  },
  initialGlobals: {
    theme: defaultCatalogTheme,
  },
  decorators: [withTheme],
  parameters: {
    // The space around a story.
    layout: "padded",
  },
};

export default preview;
