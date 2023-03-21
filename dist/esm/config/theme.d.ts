declare const theme: {
    media: {
        desktop: number;
        tablet: number;
    };
    colors: {
        black: string;
        primary: string;
        purple500: string;
        purple400: string;
        purple300: string;
        purple200: string;
        purple100: string;
        grey900: string;
        grey800: string;
        grey700: string;
        grey600: string;
        grey500: string;
        grey400: string;
        grey300: string;
        grey200: string;
        grey100: string;
        greyTransparent: string;
        red: string;
        green: string;
        blackTransparent: (percentage: string) => string;
    };
};
export type ThemeTypes = typeof theme;
export { theme };
