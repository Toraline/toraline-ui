"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.theme = void 0;
const theme = {
    media: {
        desktop: 1440,
        tablet: 800,
    },
    colors: {
        black: '#000',
        primary: '#5e00a1',
        purple500: '#3d0069',
        purple400: '#51009b',
        purple300: '#833cda',
        purple200: '#b593ea',
        purple100: '#d0b1ff',
        grey900: '#0f1928',
        grey800: '#27303e',
        grey700: '#3f4753',
        grey600: '#6f757e',
        grey500: '#9fa3a9',
        grey400: '#cfd1d4',
        grey300: '#e7e8e9',
        grey200: '#f3f3f4',
        grey100: '#fff',
        greyTransparent: 'rgba(207, 209, 212, .75)',
        red: '#f04848',
        green: '#84D235',
        blackTransparent: (percentage) => `rgba(0, 0, 0, ${percentage})`,
    },
};
exports.theme = theme;
//# sourceMappingURL=theme.js.map