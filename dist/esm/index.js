import React from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from './config/theme';
const UiInit = ({ children, themeConfig = theme }) => React.createElement(ThemeProvider, { theme: themeConfig }, children);
export default UiInit;
export * from './components';
//# sourceMappingURL=index.js.map