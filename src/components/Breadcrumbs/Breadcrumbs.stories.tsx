import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumbs } from './Breadcrumbs';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Breadcrumbs',
  component: Breadcrumbs,
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/7.0/react/api/csf
 * to learn how to use render functions.
 */
export const Default: Story = {
  args: {
    crumbs: [
      {
        label: 'Usuários',
        url: '/users',
      },
      {
        label: 'Maria',
        url: '/users/maria',
      },
    ],
  },
};
