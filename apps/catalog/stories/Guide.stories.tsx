import type { Meta, StoryObj } from "@storybook/react-vite";
import { StyledOnTop, ThemedApp } from "./guide/GuideExamples";

/** The live examples of the guide. The page "How to use the library" shows them under the guide. */
const meta = {
  title: "Guide/Live examples",
  component: ThemedApp,
  // The page of these stories is written by hand in Guide.mdx.
  tags: ["!autodocs"],
  parameters: {
    // The examples have no prop to change, so the panel "Controls" is not shown.
    controls: { disable: true },
  },
} satisfies Meta<typeof ThemedApp>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The result of guide 2. The button "Save" is blue, not purple: the theme of
 * the app changed the main color. Change the theme with the toolbar or with
 * the button: the example follows.
 */
export const ThemeOfTheApp: Story = {};

/** The result of guide 3. The second and the third button and the field have round corners, from classes of the app. */
export const StyleOnTop: Story = {
  render: () => <StyledOnTop />,
};
