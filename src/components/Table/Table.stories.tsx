import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import Table from './Table';
import { TableProps } from './Table.types';

const tableInformation: TableProps = {
  tableHeader: [
    {
      label: 'Teste',
      key: 'teste',
    },
    {
      label: 'Teste',
      key: 'teste',
    },
  ],
  tableRows: [
    {
      cells: [
        {
          key: 'data',
          component: 'valor 1',
          id: 'tipo1',
        },
        {
          key: 'data',
          component: 'valor 2',
          id: 'tipo1',
        },
      ],
    },
  ],
};

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Table',
  component: Table,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  args: tableInformation,
} as ComponentMeta<typeof Table>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Table> = (args) => <Table {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {};
