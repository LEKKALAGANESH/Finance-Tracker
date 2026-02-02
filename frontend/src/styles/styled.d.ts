import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      // Primary colors
      primary: string;
      primaryHover: string;
      primaryLight: string;
      primaryDark: string;
      // Secondary colors
      secondary: string;
      secondaryHover: string;
      secondaryLight: string;
      // Status colors
      success: string;
      successHover: string;
      successLight: string;
      successDark: string;
      warning: string;
      warningHover: string;
      warningLight: string;
      warningDark: string;
      error: string;
      errorHover: string;
      errorLight: string;
      errorDark: string;
      info: string;
      infoHover: string;
      infoLight: string;
      infoDark: string;
      // Neutral colors
      background: string;
      surface: string;
      surfaceHover: string;
      surfaceActive: string;
      border: string;
      borderHover: string;
      borderDark: string;
      borderFocus: string;
      // Text colors
      text: string;
      textSecondary: string;
      textMuted: string;
      textInverse: string;
      textOnPrimary: string;
      textOnSuccess: string;
      textOnWarning: string;
      textOnError: string;
      // Focus ring colors
      focusRing: string;
      focusRingOffset: string;
      // Overlay colors
      overlay: string;
      overlayStrong: string;
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
