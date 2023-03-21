import React from 'react';
import { ThemeProvider } from 'styled-components';
import { theme, ThemeTypes } from './config/theme';

type UIInitProps = {
  children: React.ReactNode;
  themeConfig?: ThemeTypes;
};

const UiInit = ({ children, themeConfig = theme }: UIInitProps): JSX.Element => <ThemeProvider theme={themeConfig}>{children}</ThemeProvider>;

export default UiInit;

export * from './components';
