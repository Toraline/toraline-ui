import React from 'react';
import { ToggleSwitchWrapper, Input, Container } from '../Toggle/Toggle.styled';

type Toggletypes = {
  id: string;
  value: string;
  onChange?: React.FocusEventHandler<HTMLInputElement>;
  title?: string;
  checked?: boolean;
}

const Toggle : React.FC<Toggletypes> = ({ id = 'toggle-checkbox', value, onChange, title, checked }) => {    
  return (
    <Container>    
      <Input
        id={id}
        type="checkbox"
        value={value} 
        onChange={onChange} 
        checked={checked}
      />
      <ToggleSwitchWrapper
        aria-label={title}
        htmlFor={id}
      />    
    </Container>
  ) 
}

export default Toggle;
