import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeToggle } from "@toraline/ui/theme";

/** A half-filled circle, used as the icon of the theme button. It has the color of the text. */
function ContrastIcon() {
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 1a7 7 0 0 1 0 14Z" fill="currentColor" />
    </svg>
  );
}

/**
 * The button that changes the theme. Each press shows the next theme. The
 * catalog puts every story inside ThemeProvider, so the button works here,
 * and the control "Theme" of the toolbar follows it.
 */
const meta = {
  title: "Components/ThemeToggle",
  component: ThemeToggle,
} satisfies Meta<typeof ThemeToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The button shows the current theme. A screen reader also says what a press does. */
export const Default: Story = {};

/**
 * The prop "formatLabel" changes the name a screen reader says for the button.
 * The name starts with the text the button shows ("Theme: light"). A person
 * who controls the device with the voice says the text they see, so that text
 * must be in the name.
 */
export const WithAnotherAccessibleName: Story = {
  args: {
    formatLabel: (theme, nextTheme) => `Theme: ${theme}. Press to show the theme ${nextTheme}.`,
  },
};

/** "children" replaces the text that is shown, here with an icon. The accessible name stays. */
export const WithAnIcon: Story = {
  args: { children: <ContrastIcon /> },
};
