'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styled, { keyframes, css } from 'styled-components';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Target,
  Sparkles,
  LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/expenses', icon: Receipt, label: 'Expenses' },
  { href: '/budgets', icon: Wallet, label: 'Budgets' },
  { href: '/goals', icon: Target, label: 'Goals' },
  { href: '/insights', icon: Sparkles, label: 'AI' },
];

const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 0.5;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: none;
  animation: ${slideUp} 0.3s ease forwards;

  @media (max-width: 768px) {
    display: block;
  }
`;

const NavBackground = styled.div`
  background: ${({ theme }) => theme.glass.backgroundStrong};
  backdrop-filter: ${({ theme }) => theme.glass.blurStrong};
  -webkit-backdrop-filter: ${({ theme }) => theme.glass.blurStrong};
  border-top: 1px solid ${({ theme }) => theme.colors.border}50;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  padding-bottom: env(safe-area-inset-bottom, 0);
`;

const NavList = styled.ul`
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0;
  margin: 0;
  list-style: none;
  height: 64px;
`;

const NavItemWrapper = styled.li`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const NavLink = styled(Link)<{ $isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  min-width: 64px;
  transition: all 0.2s ease;

  /* Ripple effect on tap */
  &::after {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    background: ${({ theme }) => theme.colors.primary}30;
    border-radius: 50%;
    opacity: 0;
    pointer-events: none;
  }

  &:active::after {
    animation: ${ripple} 0.6s ease-out;
  }

  ${({ $isActive, theme }) =>
    $isActive &&
    css`
      background: ${theme.colors.primaryLight}30;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 3px;
        background: ${theme.gradients.primary};
        border-radius: 0 0 ${theme.borderRadius.full} ${theme.borderRadius.full};
      }
    `}
`;

const IconWrapper = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  svg {
    width: 22px;
    height: 22px;
    color: ${({ $isActive, theme }) =>
      $isActive ? theme.colors.primary : theme.colors.textMuted};
    transition: all 0.2s ease;
  }

  ${({ $isActive }) =>
    $isActive &&
    css`
      transform: translateY(-2px);

      svg {
        stroke-width: 2.5px;
      }
    `}
`;

const Label = styled.span<{ $isActive: boolean }>`
  font-size: 11px;
  font-weight: ${({ $isActive, theme }) =>
    $isActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium};
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary : theme.colors.textMuted};
  transition: all 0.2s ease;
  white-space: nowrap;
`;

// Active indicator dot (alternative style)
const ActiveDot = styled.div<{ $isActive: boolean }>`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  position: absolute;
  bottom: 6px;
  opacity: ${({ $isActive }) => ($isActive ? 1 : 0)};
  transform: ${({ $isActive }) => ($isActive ? 'scale(1)' : 'scale(0)')};
  transition: all 0.2s ease;
`;

export function BottomNavBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <NavContainer role="navigation" aria-label="Main navigation">
      <NavBackground>
        <NavList>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <NavItemWrapper key={item.href}>
                <NavLink
                  href={item.href}
                  $isActive={active}
                  aria-current={active ? 'page' : undefined}
                >
                  <IconWrapper $isActive={active}>
                    <item.icon />
                  </IconWrapper>
                  <Label $isActive={active}>{item.label}</Label>
                </NavLink>
              </NavItemWrapper>
            );
          })}
        </NavList>
      </NavBackground>
    </NavContainer>
  );
}

// Spacer component to prevent content from being hidden behind the bottom nav
const BottomNavSpacerStyled = styled.div`
  display: none;
  height: calc(64px + env(safe-area-inset-bottom, 0));

  @media (max-width: 768px) {
    display: block;
  }
`;

export function BottomNavSpacer() {
  return <BottomNavSpacerStyled />;
}
