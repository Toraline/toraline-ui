import React from 'react';
import { ThemeProvider } from 'styled-components';
import { theme, ThemeTypes } from './config/theme';

const UiInit = ({
  children, themeConfig = theme
} : { children: React.ReactNode, themeConfig: ThemeTypes}): JSX.Element => (
  <ThemeProvider theme={themeConfig}>
    {children}
  </ThemeProvider>
);

export default UiInit
