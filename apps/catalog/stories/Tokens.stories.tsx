import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  OtherThemeTokenTable,
  PrimitiveTables,
  TextStyleTable,
  ThemeTokenTable,
} from "./tokens/TokenTables";

/**
 * The stories of the tokens page. Each story is one table. The page
 * Tokens.mdx shows all of them together.
 */
const meta = {
  title: "Foundations/Tokens",
  component: ThemeTokenTable,
  // The page of these stories is written by hand in Tokens.mdx.
  tags: ["!autodocs"],
  parameters: {
    // A table has no prop to change, so the panel "Controls" is not shown.
    controls: { disable: true },
  },
} satisfies Meta<typeof ThemeTokenTable>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The background colors, with the value of each one in each theme. */
export const Backgrounds: Story = { args: { group: "backgrounds" } };

/** The text colors. */
export const TextColors: Story = { args: { group: "textColors" } };

/** The border colors. */
export const Borders: Story = { args: { group: "borders" } };

/** The icon colors. */
export const Icons: Story = { args: { group: "icons" } };

/** The colors of charts and progress bars. */
export const DataColors: Story = { args: { group: "dataColors" } };

/** The font tokens. The values are the same in both themes. */
export const Fonts: Story = { args: { group: "fonts" } };

/** The text size tokens. */
export const TextSizes: Story = { args: { group: "textSizes" } };

/** The spacing unit. The bars are 1, 2, 4 and 8 units wide. */
export const Spacing: Story = { args: { group: "spacing" } };

/** The 4 radius sizes: how round a corner is, from a button to a drawer. */
export const Radius: Story = { args: { group: "radius" } };

/** The 5 shadows, from the smallest to the shadow of a dialog. */
export const Shadows: Story = { args: { group: "shadows" } };

/** The text styles: one class that sets the font, the size, the line height and the weight of a text. */
export const TextStyles: Story = {
  args: { group: "backgrounds" },
  render: () => <TextStyleTable />,
};

/** The level 2 tokens that are in none of the groups above. Today there is none. */
export const OtherTokens: Story = {
  args: { group: "backgrounds" },
  render: () => <OtherThemeTokenTable />,
};

/** The level 1 tokens: the raw values. They do not change with the theme. */
export const Level1: Story = {
  args: { group: "backgrounds" },
  render: () => <PrimitiveTables />,
};
