export const lightTheme = {
  colors: {
    // Primary colors
    primary: "#6366f1",
    primaryHover: "#4f46e5",
    primaryLight: "#e0e7ff",

    // Secondary colors
    secondary: "#8b5cf6",
    secondaryHover: "#7c3aed",

    // Status colors
    success: "#10b981",
    successLight: "#d1fae5",
    warning: "#f59e0b",
    warningLight: "#fef3c7",
    error: "#ef4444",
    errorLight: "#fee2e2",
    info: "#3b82f6",
    infoLight: "#dbeafe",

    // Neutral colors
    background: "#f8fafc",
    surface: "#ffffff",
    surfaceHover: "#f1f5f9",
    border: "#e2e8f0",
    borderDark: "#cbd5e1",

    // Text colors
    text: "#0f172a",
    textSecondary: "#475569",
    textMuted: "#94a3b8",
    textInverse: "#ffffff",

    // Category colors (for expenses)
    categoryFood: "#f97316",
    categoryTransport: "#3b82f6",
    categoryShopping: "#ec4899",
    categoryEntertainment: "#8b5cf6",
    categoryBills: "#ef4444",
    categoryHealth: "#10b981",
    categoryEducation: "#06b6d4",
    categoryOther: "#6b7280",
  },

  // Gradient system for premium look
  gradients: {
    primary: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    primaryHover: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    secondary: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
    success: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
    warning: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    danger: "linear-gradient(135deg, #ef4444 0%, #ec4899 100%)",
    info: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
    dark: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    light: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    shimmer: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
    hero: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(236, 72, 153, 0.05) 100%)",
    card: "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
  },

  // Glassmorphism effects
  glass: {
    background: "rgba(255, 255, 255, 0.7)",
    backgroundStrong: "rgba(255, 255, 255, 0.85)",
    blur: "blur(12px)",
    blurStrong: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },

  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    // Colored shadows for buttons and cards
    primary: "0 4px 14px 0 rgba(99, 102, 241, 0.35)",
    primaryLg: "0 8px 24px 0 rgba(99, 102, 241, 0.4)",
    success: "0 4px 14px 0 rgba(16, 185, 129, 0.35)",
    error: "0 4px 14px 0 rgba(239, 68, 68, 0.35)",
    // Glow effects
    glow: "0 0 20px rgba(99, 102, 241, 0.3)",
    glowStrong: "0 0 40px rgba(99, 102, 241, 0.4)",
    // Inset shadows for depth
    inset: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    insetLg: "inset 0 4px 8px 0 rgb(0 0 0 / 0.1)",
  },

  borderRadius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
    full: "9999px",
  },

  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },

  typography: {
    fontFamily: {
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },

  transitions: {
    fast: "150ms ease",
    normal: "200ms ease",
    slow: "300ms ease",
    // Premium easing curves
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  },

  // Animation keyframes reference
  animations: {
    fadeIn: "fadeIn 0.3s ease forwards",
    slideUp: "slideUp 0.3s ease forwards",
    slideDown: "slideDown 0.3s ease forwards",
    scaleIn: "scaleIn 0.2s ease forwards",
    pulse: "pulse 2s ease-in-out infinite",
    shimmer: "shimmer 2s infinite",
    float: "float 3s ease-in-out infinite",
    glow: "glow 2s ease-in-out infinite alternate",
  },
};

export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    // Override for dark mode
    background: "#0f172a",
    surface: "#1e293b",
    surfaceHover: "#334155",
    border: "#334155",
    borderDark: "#475569",

    text: "#f8fafc",
    textSecondary: "#cbd5e1",
    textMuted: "#64748b",

    primaryLight: "#312e81",
    successLight: "#064e3b",
    warningLight: "#78350f",
    errorLight: "#7f1d1d",
    infoLight: "#1e3a8a",
  },
  gradients: {
    ...lightTheme.gradients,
    hero: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 50%, rgba(236, 72, 153, 0.1) 100%)",
    card: "linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)",
    shimmer: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
  },
  glass: {
    background: "rgba(30, 41, 59, 0.7)",
    backgroundStrong: "rgba(30, 41, 59, 0.85)",
    blur: "blur(12px)",
    blurStrong: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.3)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.3)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.3)",
    primary: "0 4px 14px 0 rgba(99, 102, 241, 0.5)",
    primaryLg: "0 8px 24px 0 rgba(99, 102, 241, 0.55)",
    success: "0 4px 14px 0 rgba(16, 185, 129, 0.5)",
    error: "0 4px 14px 0 rgba(239, 68, 68, 0.5)",
    glow: "0 0 20px rgba(99, 102, 241, 0.4)",
    glowStrong: "0 0 40px rgba(99, 102, 241, 0.5)",
    inset: "inset 0 2px 4px 0 rgb(0 0 0 / 0.2)",
    insetLg: "inset 0 4px 8px 0 rgb(0 0 0 / 0.3)",
  },
};

export type Theme = typeof lightTheme;
