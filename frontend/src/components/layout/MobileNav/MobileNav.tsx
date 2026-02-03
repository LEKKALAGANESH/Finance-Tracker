'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { X, LayoutDashboard, Receipt, Wallet, Target, FileText, Sparkles, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNavigation } from '@/context/NavigationContext';

import { SignOutModal } from '@/components/auth/SignOutModal';

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: all 0.3s ease;
  z-index: 998;

  @media (min-width: 1024px) {
    display: none;
  }
`;

const NavDrawer = styled.nav<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  max-width: 85vw;
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  transform: ${({ $isOpen }) => ($isOpen ? 'translateX(0)' : 'translateX(-100%)')};
  transition: transform 0.3s ease;
  z-index: 999;
  display: flex;
  flex-direction: column;

  @media (min-width: 1024px) {
    display: none;
  }
`;

const NavHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LogoIcon = styled.div`
  width: 36px;
  height: 36px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
`;

const LogoText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const NavContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.md};
`;

const NavSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const NavSectionTitle = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const NavLink = styled(Link)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme, $isActive }) => ($isActive ? theme.colors.primary : theme.colors.textSecondary)};
  background: ${({ theme, $isActive }) => ($isActive ? `${theme.colors.primary}15` : 'transparent')};
  font-weight: ${({ theme, $isActive }) =>
    $isActive ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal};
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme, $isActive }) =>
      $isActive ? `${theme.colors.primary}15` : theme.colors.surfaceHover};
    color: ${({ theme, $isActive }) => ($isActive ? theme.colors.primary : theme.colors.text)};
  }

  svg {
    flex-shrink: 0;
  }
`;

const NavFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const signOutShimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const signOutIconPulse = keyframes`
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.15) rotate(-5deg); }
`;

const SignOutButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  svg {
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      ${({ theme }) => theme.colors.error}08,
      transparent
    );
    background-size: 200% 100%;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.errorLight};
    color: ${({ theme }) => theme.colors.error};
    transform: translateX(4px);
    box-shadow: -4px 0 0 ${({ theme }) => theme.colors.error};

    svg {
      color: ${({ theme }) => theme.colors.error};
      animation: ${signOutIconPulse} 0.5s ease;
    }

    &::before {
      opacity: 1;
      animation: ${signOutShimmer} 1.5s ease-in-out infinite;
    }
  }

  &:active {
    transform: translateX(2px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.error};
    outline-offset: 2px;
  }
`;

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/budgets', label: 'Budgets', icon: Wallet },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/insights', label: 'AI Insights', icon: Sparkles },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { navigateTo } = useNavigation();
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  const handleNavigation = (href: string) => {
    onClose();
    navigateTo(href);
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  const handleSignOutClick = () => {
    onClose();
    setIsSignOutModalOpen(true);
  };

  return (
    <>
      <Overlay $isOpen={isOpen} onClick={onClose} />
      <NavDrawer $isOpen={isOpen}>
        <NavHeader>
          <Logo>
            <LogoIcon>F</LogoIcon>
            <LogoText>FinTrack</LogoText>
          </Logo>
          <CloseButton onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </CloseButton>
        </NavHeader>

        <NavContent>
          <NavSection>
            <NavSectionTitle>Menu</NavSectionTitle>
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                $isActive={pathname === item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation(item.href);
                }}
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </NavSection>

          <NavSection>
            <NavSectionTitle>Account</NavSectionTitle>
            <NavLink
              href="/settings"
              $isActive={pathname === '/settings'}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('/settings');
              }}
            >
              <Settings size={20} />
              Settings
            </NavLink>
          </NavSection>
        </NavContent>

        <NavFooter>
          <SignOutButton onClick={handleSignOutClick}>
            <LogOut size={20} />
            Sign Out
          </SignOutButton>
        </NavFooter>
      </NavDrawer>

      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
      />
    </>
  );
}

export default MobileNav;
