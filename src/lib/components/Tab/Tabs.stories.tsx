import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import  Tab from './Tabs';


// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Tab',
  component: Tab,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    
  },
} as ComponentMeta<typeof Tab>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Tab> = (args) => <Tab {...args}/>;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
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
      isActive: false
    },
    {  
      label: 'Premium', 
      id: 'premium', 
      component: <p>oi 3</p>, 
      isActive: false
    },
    {  
      label: 'Suporte', 
      id: 'suporte', 
      component: <p>oi 4</p>, 
      isActive: false
    },
  ]
};
