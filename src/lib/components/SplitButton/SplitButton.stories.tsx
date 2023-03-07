import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import  SplitButton, {DropdownButtons} from './SplitButton';



// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/SplitButton',
  component: SplitButton,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    
  },
} as ComponentMeta<typeof SplitButton>;

const dropdownButtons:DropdownButtons = [
  {
    onClick: () => {},
    text: 'Text 1',
  },
  {
    onClick: () => {},
    text: 'Text 2',
  },
  {
    onClick: () => {},
    text: 'Text 3',
  }
]

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof SplitButton> = () => <SplitButton onClickMainButton={() => {}} mainButtonText='Baixar documentos' dropdownButtons={dropdownButtons}/>;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {};
