import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeToggle } from "@toraline.tech/ui/theme";

const cardStyle: CSSProperties = {
  maxWidth: "32rem",
  padding: "calc(var(--spacing) * 4)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius)",
  backgroundColor: "var(--color-surface-raised)",
  boxShadow: "var(--shadow)",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
};

const headingStyle: CSSProperties = {
  margin: 0,
  color: "var(--color-primary)",
  fontFamily: "var(--font-heading)",
  fontSize: "var(--text-lg)",
};

const mutedStyle: CSSProperties = {
  color: "var(--color-text-muted)",
};

/**
 * A card that uses only level 2 tokens. A level 2 token is a CSS variable
 * whose name says what the value is for, for example --color-primary.
 * Change the theme with the control "Theme" in the toolbar: every color of
 * the card changes.
 */
function ThemeSample() {
  return (
    <section style={cardStyle} aria-labelledby="theme-sample-title">
      <h2 id="theme-sample-title" style={headingStyle}>
        A card in the current theme
      </h2>
      <p>Its colors, border, radius and shadow come from level 2 tokens.</p>
      <p style={mutedStyle}>This text uses the token --color-text-muted.</p>
      <ThemeToggle />
    </section>
  );
}

const meta = {
  title: "Foundations/Theme sample",
  component: ThemeSample,
} satisfies Meta<typeof ThemeSample>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The card, and the button of the library that changes the theme. The toolbar follows the button. */
export const Sample: Story = {};
