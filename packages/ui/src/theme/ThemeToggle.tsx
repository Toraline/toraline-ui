"use client";

import type { ButtonHTMLAttributes, MouseEvent } from "react";
import { useTheme } from "./ThemeProvider";

export type ThemeToggleProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  /**
   * Builds the name a screen reader says for the button.
   * When missing: "Theme: <current>. Switch to <next>."
   */
  formatLabel?: (theme: string, nextTheme: string) => string;
};

const defaultFormatLabel = (theme: string, nextTheme: string) =>
  `Theme: ${theme}. Switch to ${nextTheme}.`;

/**
 * A button that changes the theme. Each press shows the next theme of the app's
 * list; after the last theme it goes back to the first.
 *
 * The button shows the current theme as text ("Theme: dark"). Its accessible name
 * (the text a screen reader says) has the current theme and the theme the next
 * press shows. Give "children" to show something else, for example an icon.
 */
export function ThemeToggle({
  formatLabel = defaultFormatLabel,
  className,
  children,
  onClick,
  ...buttonProps
}: ThemeToggleProps) {
  const { theme, themes, setTheme } = useTheme();
  const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length] ?? theme;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) {
      setTheme(nextTheme);
    }
  };

  return (
    <button
      aria-label={formatLabel(theme, nextTheme)}
      {...buttonProps}
      type="button"
      className={className ? `tui-theme-toggle ${className}` : "tui-theme-toggle"}
      onClick={handleClick}
    >
      {children ?? `Theme: ${theme}`}
    </button>
  );
}
