import React from 'react';
import { ToggleSwitchWrapper, Input, Container } from '../Toggle/Toggle.styled';

type Toggletypes = {
  id: string;
  value: string;
  onChange?: React.FocusEventHandler<HTMLInputElement>;
  label?: string;
  checked?: boolean;
}

const Toggle : React.FC<Toggletypes> = ({ id = 'toggle-checkbox', value, onChange, label, checked }) => {    
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
        aria-label={label}
        htmlFor={id}
      />    
    </Container>
  ) 
}

export default Toggle;
