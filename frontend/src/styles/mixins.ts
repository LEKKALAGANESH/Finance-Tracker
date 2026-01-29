import { css } from 'styled-components';
import { Theme } from './theme';

// Flexbox mixins
export const flexCenter = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const flexBetween = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const flexColumn = css`
  display: flex;
  flex-direction: column;
`;

// Card styles
export const cardStyle = css<{ theme: Theme }>`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

// Button base styles
export const buttonBase = css<{ theme: Theme }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all ${({ theme }) => theme.transitions.fast};
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Input base styles
export const inputBase = css<{ theme: Theme }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.surfaceHover};
    cursor: not-allowed;
  }
`;

// Truncate text
export const truncate = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Responsive breakpoints (min-width - mobile first)
export const media = {
  sm: (styles: ReturnType<typeof css>) => css`
    @media (min-width: 640px) {
      ${styles}
    }
  `,
  md: (styles: ReturnType<typeof css>) => css`
    @media (min-width: 768px) {
      ${styles}
    }
  `,
  lg: (styles: ReturnType<typeof css>) => css`
    @media (min-width: 1024px) {
      ${styles}
    }
  `,
  xl: (styles: ReturnType<typeof css>) => css`
    @media (min-width: 1280px) {
      ${styles}
    }
  `,
};

// Max-width media queries (for targeting smaller screens)
export const mediaMax = {
  sm: (styles: ReturnType<typeof css>) => css`
    @media (max-width: 639px) {
      ${styles}
    }
  `,
  md: (styles: ReturnType<typeof css>) => css`
    @media (max-width: 767px) {
      ${styles}
    }
  `,
  lg: (styles: ReturnType<typeof css>) => css`
    @media (max-width: 1023px) {
      ${styles}
    }
  `,
  xl: (styles: ReturnType<typeof css>) => css`
    @media (max-width: 1279px) {
      ${styles}
    }
  `,
};

// Touch-friendly minimum sizes
export const touchTarget = css`
  min-height: 44px;
  min-width: 44px;
`;

// Hide on mobile, show on desktop
export const hideOnMobile = css`
  @media (max-width: 767px) {
    display: none !important;
  }
`;

// Show on mobile, hide on desktop
export const showOnMobile = css`
  display: none !important;
  @media (max-width: 767px) {
    display: flex !important;
  }
`;

// Responsive container padding
export const responsivePadding = css<{ theme: Theme }>`
  padding: ${({ theme }) => theme.spacing.md};

  @media (min-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }

  @media (min-width: 1024px) {
    padding: ${({ theme }) => theme.spacing.xl};
  }
`;

// Responsive grid that stacks on mobile
export const responsiveGrid = css`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

// Safe area for mobile devices with notches
export const safeAreaPadding = css`
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
`;
