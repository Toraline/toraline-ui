import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SideBar } from './SideBar';

const props = {
    items: [
        {
            to: '/',
            showContent: <span>H</span>,
            content: 'Home',
            dropdownItems: [
                {
                    to:'/',
                    content:'Novo Pedido',
                },
                {
                    to:'/',
                    content: <span>Novo Pedido</span>,
                },
            ],         
            gap: '12px',            
        },
        {
            to: '/',
            showContent: <span>H</span>,
            content: 'Home',                    
            gap: '12px',            
        }
    ],
    gap: undefined,
    footerGap: '24px',
    footerItems: [
        {
            to: '/',
            showContent: 'C',
            content: <span>Configurações</span>,
        },        
        {
            to: '/',
            showContent: 'x',
            content: <span>xonfigurações</span>,
        },
    ],
}

const meta: Meta<typeof SideBar> = {
  title: 'SideBar',
  component: SideBar,
};

export default meta;
type Story = StoryObj<typeof SideBar>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/7.0/react/api/csf
 * to learn how to use render functions.
 */
export const ExampleSideBar: Story = {
  args: props,
};
