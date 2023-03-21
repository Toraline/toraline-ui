import type { Meta, StoryObj } from '@storybook/react';
import { SplitButton as SplitButtonComponent } from './SplitButton';

const meta: Meta<typeof SplitButtonComponent> = {
  title: 'Button',
  component: SplitButtonComponent,
  args: {
    mainButtonText: 'Main button',
    dropdownOptions: [
      {
        onClick: () => {},
        text: 'Option 1',
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof SplitButtonComponent>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/7.0/react/api/csf
 * to learn how to use render functions.
 */
export const SplitButton: Story = {
  args: {},
};
