import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      primaryHover: string;
      primaryLight: string;
      secondary: string;
      secondaryHover: string;
      success: string;
      successLight: string;
      warning: string;
      warningLight: string;
      error: string;
      errorLight: string;
      info: string;
      infoLight: string;
      background: string;
      surface: string;
      surfaceHover: string;
      border: string;
      borderDark: string;
      text: string;
      textSecondary: string;
      textMuted: string;
      textInverse: string;
      categoryFood: string;
      categoryTransport: string;
      categoryShopping: string;
      categoryEntertainment: string;
      categoryBills: string;
      categoryHealth: string;
      categoryEducation: string;
      categoryOther: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      full: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
    typography: {
      fontFamily: {
        sans: string;
        mono: string;
      };
      fontSize: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
        '4xl': string;
      };
      fontWeight: {
        normal: number;
        medium: number;
        semibold: number;
        bold: number;
      };
    };
    breakpoints: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    transitions: {
      fast: string;
      normal: string;
      slow: string;
    };
  }
}
