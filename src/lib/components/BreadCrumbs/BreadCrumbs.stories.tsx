import { ComponentStory, ComponentMeta } from '@storybook/react';
import BreadCrumbs from './BreadCrumbs';


export default {
  title: 'Example/BreadCrumbs',
  component: BreadCrumbs,
  argTypes: {},
} as ComponentMeta<typeof BreadCrumbs>;

const Template: ComponentStory<typeof BreadCrumbs> = (args) => 
   <BreadCrumbs {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  crumbs: [
    {label: 'cliente', url: 'http://aaa'},
    {label: 'Texte1', url: 'http://bbbb',},
    {label: 'Fernando Dias', url: 'http://ccc',}
]
}
