import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeToggle } from "@toraline.tech/ui/theme";

const cardStyle: CSSProperties = {
  maxWidth: "32rem",
  padding: "calc(var(--spacing) * 4)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-xl)",
  backgroundColor: "var(--bg-surface)",
  boxShadow: "var(--shadow-card)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-body)",
};

const headingStyle: CSSProperties = {
  margin: 0,
  color: "var(--text-brand)",
  fontFamily: "var(--font-heading)",
  fontSize: "var(--text-lg)",
};

const mutedStyle: CSSProperties = {
  color: "var(--text-tertiary)",
};

/**
 * A card that uses only level 2 tokens. A level 2 token is a CSS variable
 * whose name says what the value is for, for example --bg-primary.
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
      <p style={mutedStyle}>This text uses the token --text-tertiary.</p>
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
