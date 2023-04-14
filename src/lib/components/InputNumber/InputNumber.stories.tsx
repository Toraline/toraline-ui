import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import useState from 'storybook-addon-state';

import  InputNumber from './InputNumber';


// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/InputNumber',
  component: InputNumber,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    
  },
} as ComponentMeta<typeof InputNumber>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof InputNumber> = (args) => {
  const [value, setValue] = useState('inputNumber', args.value)
  React.useEffect(() => {
    setValue(args.value)
  }, [args.value])
  return (<InputNumber {...args} value={value} setValue={setValue} />)
};

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {value: 0, unit: '%'};
