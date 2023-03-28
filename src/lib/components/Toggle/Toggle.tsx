import React from 'react';
import { ToggleSwitchWrapper, Input, Container } from '../Toggle/Toggle.styled';

type Toggletypes = {
  id: string;
  value: string;
  onChange?: React.FocusEventHandler<HTMLInputElement>;
  title?: string;
  checked?: boolean;
}

const Toggle : React.FC<Toggletypes> = ({id, value, onChange, title, checked}) => {    
  return (
    <Container>    
      <Input
        id='input'
        type="checkbox"
        value={value} 
        onChange={onChange} 
        checked={checked}
      />
      <ToggleSwitchWrapper
        aria-label={title}
        htmlFor='input'
      />    
    </Container>
  
  ) 
}

export default Toggle;