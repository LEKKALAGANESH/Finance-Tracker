import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      // Primary colors
      primary: string;
      primaryHover: string;
      primaryLight: string;
      // Secondary colors
      secondary: string;
      secondaryHover: string;
      // Status colors
      success: string;
      successLight: string;
      warning: string;
      warningLight: string;
      error: string;
      errorLight: string;
      info: string;
      infoLight: string;
      // Neutral colors
      background: string;
      surface: string;
      surfaceHover: string;
      border: string;
      borderDark: string;
      // Text colors
      text: string;
      textSecondary: string;
      textMuted: string;
      textInverse: string;
      // Category colors
      categoryFood: string;
      categoryTransport: string;
      categoryShopping: string;
      categoryEntertainment: string;
      categoryBills: string;
      categoryHealth: string;
      categoryEducation: string;
      categoryOther: string;
    };
    gradients: {
      primary: string;
      primaryHover: string;
      secondary: string;
      success: string;
      warning: string;
      danger: string;
      info: string;
      dark: string;
      light: string;
      shimmer: string;
      hero: string;
      card: string;
    };
    glass: {
      background: string;
      backgroundStrong: string;
      blur: string;
      blurStrong: string;
      border: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      primary: string;
      primaryLg: string;
      success: string;
      error: string;
      glow: string;
      glowStrong: string;
      inset: string;
      insetLg: string;
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
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
      bounce: string;
      smooth: string;
      spring: string;
    };
    animations: {
      fadeIn: string;
      slideUp: string;
      slideDown: string;
      scaleIn: string;
      pulse: string;
      shimmer: string;
      float: string;
      glow: string;
    };
  }
}
