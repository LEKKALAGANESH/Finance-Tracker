'use client';

import { HTMLAttributes, ReactNode } from 'react';
import styled, { css } from 'styled-components';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  children: ReactNode;
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

const paddingStyles = {
  none: css`padding: 0;`,
  sm: css`padding: ${({ theme }) => theme.spacing.sm};`,
  md: css`padding: ${({ theme }) => theme.spacing.md};`,
  lg: css`padding: ${({ theme }) => theme.spacing.lg};`,
};

const variantStyles = {
  default: css`
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  `,
  outlined: css`
    background: transparent;
    border: 1.5px solid ${({ theme }) => theme.colors.border};

    &:hover {
      border-color: ${({ theme }) => theme.colors.primary}40;
    }
  `,
  elevated: css`
    background: ${({ theme }) => theme.colors.surface};
    border: none;
    box-shadow: ${({ theme }) => theme.shadows.lg};
  `,
  glass: css`
    background: ${({ theme }) => theme.glass.background};
    backdrop-filter: ${({ theme }) => theme.glass.blur};
    -webkit-backdrop-filter: ${({ theme }) => theme.glass.blur};
    border: 1px solid ${({ theme }) => theme.colors.border}50;
    box-shadow: ${({ theme }) => theme.shadows.md};
  `,
};

const StyledCard = styled.div<{
  $variant: 'default' | 'outlined' | 'elevated' | 'glass';
  $padding: 'none' | 'sm' | 'md' | 'lg';
  $hoverable: boolean;
}>`
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  ${({ $variant }) => variantStyles[$variant]}
  ${({ $padding }) => paddingStyles[$padding]}

  /* Subtle gradient overlay for depth */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      ${({ theme }) => theme.colors.border}80 20%,
      ${({ theme }) => theme.colors.border}80 80%,
      transparent 100%
    );
    opacity: 0.5;
  }

  /* Hoverable state with lift effect */
  ${({ $hoverable }) =>
    $hoverable &&
    css`
      cursor: pointer;

      &:hover {
        transform: translateY(-4px);
        box-shadow: ${({ theme }) => theme.shadows.xl};
      }

      &:active {
        transform: translateY(-2px);
      }
    `}
`;

const StyledCardHeader = styled.div<{ $hasIcon: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border}60;
  position: relative;

  /* Gradient line at bottom */
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: ${({ theme }) => theme.spacing.lg};
    width: 40px;
    height: 2px;
    background: ${({ theme }) => theme.gradients.primary};
    border-radius: ${({ theme }) => theme.borderRadius.full};
    opacity: 0.8;
  }
`;

const HeaderLeft = styled.div<{ $hasIcon: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: ${({ theme }) => theme.gradients.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.primary};
  color: ${({ theme }) => theme.colors.textInverse};

  svg {
    width: 22px;
    height: 22px;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  letter-spacing: -0.01em;
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;

const StyledCardBody = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const StyledCardFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border}60;
  background: ${({ theme }) => theme.colors.surfaceHover}30;
`;

export function Card({
  variant = 'default',
  padding = 'none',
  hoverable = false,
  children,
  ...props
}: CardProps) {
  return (
    <StyledCard $variant={variant} $padding={padding} $hoverable={hoverable} {...props}>
      {children}
    </StyledCard>
  );
}

export function CardHeader({ title, subtitle, action, icon, ...props }: CardHeaderProps) {
  return (
    <StyledCardHeader $hasIcon={!!icon} {...props}>
      <HeaderLeft $hasIcon={!!icon}>
        {icon && <IconWrapper>{icon}</IconWrapper>}
        <HeaderContent>
          <Title>{title}</Title>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </HeaderContent>
      </HeaderLeft>
      {action}
    </StyledCardHeader>
  );
}

export function CardBody({ children, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <StyledCardBody {...props}>{children}</StyledCardBody>;
}

export function CardFooter({ children, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <StyledCardFooter {...props}>{children}</StyledCardFooter>;
}
