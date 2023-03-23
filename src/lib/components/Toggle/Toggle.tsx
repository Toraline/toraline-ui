import React from 'react';
import { ToggleSwitchWrapper, Input } from '../Toggle/Toggle.styled';

type Toggletypes = {
  id: string;
}

const Toggle : React.FC<Toggletypes> = ({id}) => {    
  return (
    <div>      
      <Input id='input' type="checkbox"  />               
      <ToggleSwitchWrapper htmlFor='input'/>      
    </div>
    
  )
}

export default Toggle;