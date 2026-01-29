import { createGlobalStyle } from 'styled-components';
import { Theme } from './theme';

export const GlobalStyles = createGlobalStyle<{ theme: Theme }>`
  /* Premium Animation Keyframes */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes glow {
    from { box-shadow: 0 0 10px rgba(99, 102, 241, 0.3); }
    to { box-shadow: 0 0 25px rgba(99, 102, 241, 0.5); }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-3deg); }
    75% { transform: rotate(3deg); }
  }

  @keyframes countUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes progressFill {
    from { width: 0%; }
  }

  @keyframes ripple {
    0% {
      transform: scale(0);
      opacity: 0.5;
    }
    100% {
      transform: scale(4);
      opacity: 0;
    }
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily.sans};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    line-height: 1.3;
    color: ${({ theme }) => theme.colors.text};
  }

  h1 { font-size: ${({ theme }) => theme.typography.fontSize['4xl']}; }
  h2 { font-size: ${({ theme }) => theme.typography.fontSize['3xl']}; }
  h3 { font-size: ${({ theme }) => theme.typography.fontSize['2xl']}; }
  h4 { font-size: ${({ theme }) => theme.typography.fontSize.xl}; }
  h5 { font-size: ${({ theme }) => theme.typography.fontSize.lg}; }
  h6 { font-size: ${({ theme }) => theme.typography.fontSize.base}; }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover};
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  ul, ol {
    list-style: none;
  }

  /* Custom scrollbar with gradient thumb */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, ${({ theme }) => theme.colors.border} 0%, ${({ theme }) => theme.colors.borderDark} 100%);
    border-radius: ${({ theme }) => theme.borderRadius.full};
    border: 2px solid ${({ theme }) => theme.colors.surface};
    transition: background 0.2s ease;

    &:hover {
      background: linear-gradient(180deg, ${({ theme }) => theme.colors.primary}80 0%, ${({ theme }) => theme.colors.primary} 100%);
    }
  }

  /* Enhanced focus visible styles with glow */
  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.primaryLight};
  }

  /* Selection styles */
  ::selection {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primary};
  }

  /* Utility classes for animations */
  .animate-fade-in {
    animation: fadeIn 0.3s ease forwards;
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.4s ease forwards;
  }

  .animate-slide-up {
    animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  .animate-scale-in {
    animation: scaleIn 0.2s ease forwards;
  }

  .animate-pulse {
    animation: pulse 2s ease-in-out infinite;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-glow {
    animation: glow 2s ease-in-out infinite alternate;
  }

  .animate-bounce {
    animation: bounce 1s ease infinite;
  }

  /* Staggered animation delays */
  .stagger-1 { animation-delay: 0.1s; }
  .stagger-2 { animation-delay: 0.2s; }
  .stagger-3 { animation-delay: 0.3s; }
  .stagger-4 { animation-delay: 0.4s; }
  .stagger-5 { animation-delay: 0.5s; }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
