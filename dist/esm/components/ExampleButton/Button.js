import React from 'react';
import { ButtonComponent } from './Button.styled';
export const Button = ({ children, isWarning }) => {
    return React.createElement(ButtonComponent, { isWarning: isWarning }, children);
};
//# sourceMappingURL=Button.js.map