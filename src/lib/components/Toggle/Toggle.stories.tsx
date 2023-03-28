import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import  Toggle from './Toggle';
import useState from 'storybook-addon-state';


// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Toggle',
  component: Toggle,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    
  },
} as ComponentMeta<typeof Toggle>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Toggle> = (args) => {
  const [checked, setChecked] = useState('check', args.checked);
  React.useEffect(() => {
    setChecked(args.checked);
  }, [args.checked]);
  return(
    <Toggle    
      {...args}  
      checked={checked}
      onChange={() => setChecked(!checked)} 
    />
  );
}

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {id: 'input'};
