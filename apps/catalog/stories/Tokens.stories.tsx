import type { Meta, StoryObj } from "@storybook/react-vite";
import { OtherThemeTokenTable, PrimitiveTables, ThemeTokenTable } from "./tokens/TokenTables";

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

/** The color tokens, with the value of each one in each theme. */
export const Colors: Story = { args: { group: "colors" } };

/** The font tokens. The values are the same in both themes. */
export const Fonts: Story = { args: { group: "fonts" } };

/** The text size tokens. */
export const TextSizes: Story = { args: { group: "textSizes" } };

/** The spacing unit. The bars are 1, 2, 4 and 8 units wide. */
export const Spacing: Story = { args: { group: "spacing" } };

/** The radius token: how round the corners of a component are. */
export const Radius: Story = { args: { group: "radius" } };

/** The shadow token: the shadow of a raised part. */
export const Shadow: Story = { args: { group: "shadow" } };

/** The level 2 tokens that are in none of the groups above. Today there is none. */
export const OtherTokens: Story = {
  args: { group: "colors" },
  render: () => <OtherThemeTokenTable />,
};

/** The level 1 tokens: the raw values. They do not change with the theme. */
export const Level1: Story = {
  args: { group: "colors" },
  render: () => <PrimitiveTables />,
};
