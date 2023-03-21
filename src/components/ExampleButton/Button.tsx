import React from 'react';

import { ButtonComponent } from './Button.styled';
import { ButtonProps } from './Button.types';

export const Button = ({ children, isWarning }: ButtonProps): JSX.Element => {
  return <ButtonComponent isWarning={isWarning}>{children}</ButtonComponent>;
};
