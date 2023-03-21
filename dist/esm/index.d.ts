import React from 'react';
import { ThemeTypes } from './config/theme';
type UIInitProps = {
    children: React.ReactNode;
    themeConfig?: ThemeTypes;
};
declare const UiInit: ({ children, themeConfig }: UIInitProps) => JSX.Element;
export default UiInit;
export * from './components';
