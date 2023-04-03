import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import Table, { TableProps } from './Table';

const tableInformation: TableProps = {
  tableHeader: [
    {
      label:'Data',
      key:'data',
    },
    {
      label:'Tipo',
      key:'tipo',
      
    },
    {
      label:'Cliente',
      key:'cliente',
    }
  ],
  tableRows: [
    {
      cells:[
        {
          key:'data',
          component:'valor 1',
          id:'tipo1',
        },
        {
          key:'tipo',
          component:'valor 1',
          id:'tipo-1',
        },
        {
          key:'cliente',
          component:'valor 1',
          id:'cliente-1',
        },
      ]
    },
    {
      cells:[
        {
          key:'data',
          component:'valor 2',
          id:'valor-1',
        },
        {
          key:'tipo',
          component:'valor 2',
          id:'tipo-1',
        },
        {
          key:'cliente',
          component:'valor 2',
          id:'cliente-1',
        },
      ]
    },
  ],
}
// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Example/Table',
    component: Table,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    args: tableInformation
  } as ComponentMeta<typeof Table>;
  
  // More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
  const Template: ComponentStory<typeof Table> = (args) => <Table {...args}/>;
  
  export const Primary = Template.bind({});
  // More on args: https://storybook.js.org/docs/react/writing-stories/args
  Primary.args = {};
  