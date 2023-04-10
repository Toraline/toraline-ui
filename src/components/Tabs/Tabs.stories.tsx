import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Tabs',
  component: Tabs,
};

export default meta;
type Story = StoryObj<typeof Tabs>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/7.0/react/api/csf
 * to learn how to use render functions.
 */
export const Default: Story = {
  args: {
    tabs: [
      {
        label: 'Todos',
        id: 'todos',
        component: <p>oi 1</p>,
        isActive: true,
      },
      {
        label: 'Pedidos',
        id: 'pedidos',
        component: <p>oi 2</p>,
        isActive: false,
      },
      {
        label: 'Premium',
        id: 'premium',
        component: <p>oi 3</p>,
        isActive: false,
      },
      {
        label: 'Suporte',
        id: 'suporte',
        component: <p>oi 4</p>,
        isActive: false,
      },
    ],
  },
};
