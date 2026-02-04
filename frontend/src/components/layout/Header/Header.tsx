'use client';

import styled, { keyframes } from 'styled-components';
import { Wallet, Sun, Moon, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { SignOutModal } from '@/components/auth/SignOutModal';

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
`;

const ring = keyframes`
  0% { transform: rotate(0); }
  10% { transform: rotate(15deg); }
  20% { transform: rotate(-15deg); }
  30% { transform: rotate(10deg); }
  40% { transform: rotate(-10deg); }
  50% { transform: rotate(5deg); }
  60% { transform: rotate(-5deg); }
  70% { transform: rotate(0); }
  100% { transform: rotate(0); }
`;

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.glass.backgroundStrong};
  backdrop-filter: ${({ theme }) => theme.glass.blur};
  -webkit-backdrop-filter: ${({ theme }) => theme.glass.blur};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border}60;
  height: 68px;
  position: sticky;
  top: 0;
  z-index: 99;

  /* Tablet */
  @media (max-width: 1023px) {
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
    height: 72px;
  }

  /* Mobile */
  @media (max-width: 767px) {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
    height: 64px;
  }

  /* Small Mobile */
  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    height: 58px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const logoGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(91, 91, 247, 0.4); }
  50% { box-shadow: 0 0 30px rgba(91, 91, 247, 0.6); }
`;

const BrandContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  /* Hide on laptop/desktop when sidebar is visible */
  @media (min-width: 1024px) {
    display: none;
  }

  /* Tablet */
  @media (max-width: 1023px) {
    gap: ${({ theme }) => theme.spacing.md};
  }

  /* Mobile */
  @media (max-width: 767px) {
    gap: ${({ theme }) => theme.spacing.sm};
  }

  /* Small Mobile */
  @media (max-width: 480px) {
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

const LogoIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: ${({ theme }) => theme.shadows.primary};
  position: relative;
  animation: ${logoGlow} 3s ease-in-out infinite;

  svg {
    width: 22px;
    height: 22px;
  }

  /* Tablet - larger premium look */
  @media (max-width: 1023px) {
    width: 46px;
    height: 46px;
    border-radius: ${({ theme }) => theme.borderRadius.xl};

    svg {
      width: 24px;
      height: 24px;
    }
  }

  /* Mobile */
  @media (max-width: 767px) {
    width: 40px;
    height: 40px;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  /* Small Mobile */
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;

    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const BrandName = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  background: ${({ theme }) => theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${({ theme }) => theme.gradients.primary};
    border-radius: ${({ theme }) => theme.borderRadius.full};
    opacity: 0.6;
  }

  /* Tablet - larger premium look */
  @media (max-width: 1023px) {
    font-size: 1.5rem;
    letter-spacing: -0.03em;

    &::after {
      height: 3px;
      bottom: -5px;
    }
  }

  /* Mobile */
  @media (max-width: 767px) {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};

    &::after {
      height: 2px;
      bottom: -3px;
    }
  }

  /* Small Mobile */
  @media (max-width: 480px) {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    letter-spacing: -0.01em;

    &::after {
      height: 2px;
      bottom: -2px;
      opacity: 0.5;
    }
  }
`;

const PageTitle = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
  padding-left: ${({ theme }) => theme.spacing.md};
  border-left: 1px solid ${({ theme }) => theme.colors.border}60;
  margin-left: ${({ theme }) => theme.spacing.sm};

  @media (max-width: 768px) {
    display: none;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  /* Tablet */
  @media (max-width: 1023px) {
    gap: ${({ theme }) => theme.spacing.md};
  }

  /* Mobile */
  @media (max-width: 767px) {
    gap: ${({ theme }) => theme.spacing.sm};
  }

  /* Small Mobile */
  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const IconButton = styled.button<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primaryLight : theme.colors.surfaceHover}50;
  border: 1px solid ${({ theme }) => theme.colors.border}60;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  svg {
    transition: all 0.3s ease;
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary}40;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.colors.primary}15;

    svg {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: translateY(0);
  }

  /* Tablet - larger touch targets */
  @media (max-width: 1023px) {
    width: 46px;
    height: 46px;
    border-radius: ${({ theme }) => theme.borderRadius.xl};

    svg {
      width: 22px;
      height: 22px;
    }
  }

  /* Mobile */
  @media (max-width: 767px) {
    width: 40px;
    height: 40px;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  /* Small Mobile */
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    border-radius: ${({ theme }) => theme.borderRadius.lg};

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const ThemeToggleButton = styled(IconButton)<{ $isDark: boolean }>`
  background: ${({ theme, $isDark }) =>
    $isDark
      ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
      : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'};
  border-color: ${({ theme, $isDark }) =>
    $isDark ? theme.colors.border : '#f59e0b'}40;
  color: ${({ $isDark }) => ($isDark ? '#fbbf24' : '#f59e0b')};

  &:hover {
    background: ${({ $isDark }) =>
      $isDark
        ? 'linear-gradient(135deg, #334155 0%, #475569 100%)'
        : 'linear-gradient(135deg, #fde68a 0%, #fcd34d 100%)'};
    color: ${({ $isDark }) => ($isDark ? '#fcd34d' : '#d97706')};
    border-color: ${({ $isDark }) => ($isDark ? '#fbbf24' : '#f59e0b')}60;
    box-shadow: 0 4px 12px ${({ $isDark }) => ($isDark ? '#fbbf24' : '#f59e0b')}25;
  }
`;

const NotificationButton = styled(IconButton)`
  &:hover svg {
    animation: ${ring} 0.6s ease;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 10px;
  height: 10px;
  background: ${({ theme }) => theme.gradients.danger};
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.surface};
  animation: ${pulse} 2s ease-in-out infinite;

  &::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.error};
    opacity: 0.3;
    animation: ${pulse} 2s ease-in-out infinite;
  }

  /* Tablet */
  @media (max-width: 1023px) {
    top: 10px;
    right: 10px;
    width: 11px;
    height: 11px;
  }

  /* Mobile */
  @media (max-width: 767px) {
    top: 7px;
    right: 7px;
    width: 9px;
    height: 9px;
  }

  /* Small Mobile */
  @media (max-width: 480px) {
    top: 6px;
    right: 6px;
    width: 8px;
    height: 8px;
    border-width: 1.5px;
  }
`;

const UserMenuContainer = styled.div`
  position: relative;
`;

const UserButton = styled.button<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 6px 12px 6px 6px;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  background: ${({ theme }) => theme.colors.surfaceHover}50;
  border: 1px solid ${({ theme }) => theme.colors.border}60;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.primary}40;
    box-shadow: 0 4px 12px ${({ theme }) => theme.colors.primary}10;
  }

  svg.chevron {
    transition: transform 0.2s ease;
    transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0)')};
    color: ${({ theme }) => theme.colors.textMuted};
    width: 16px;
    height: 16px;
  }

  /* Tablet */
  @media (max-width: 1023px) {
    padding: 8px 14px 8px 8px;
    gap: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borderRadius.xl};

    svg.chevron {
      width: 18px;
      height: 18px;
    }
  }

  /* Mobile */
  @media (max-width: 767px) {
    padding: 5px 10px 5px 5px;
    gap: ${({ theme }) => theme.spacing.sm};

    svg.chevron {
      width: 14px;
      height: 14px;
    }
  }

  /* Small Mobile */
  @media (max-width: 480px) {
    padding: 4px 8px 4px 4px;
    gap: 4px;

    svg.chevron {
      width: 12px;
      height: 12px;
    }
  }
`;

const Avatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.gradients.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  box-shadow: ${({ theme }) => theme.shadows.primary};

  /* Tablet */
  @media (max-width: 1023px) {
    width: 38px;
    height: 38px;
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }

  /* Mobile */
  @media (max-width: 767px) {
    width: 32px;
    height: 32px;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }

  /* Small Mobile */
  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-right: ${({ theme }) => theme.spacing.xs};

  /* Hide on mobile and smaller */
  @media (max-width: 767px) {
    display: none;
  }
`;

const UserName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.2;
`;

const UserRole = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.2;
`;

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 220px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border}60;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl}, 0 0 40px ${({ theme }) => theme.colors.primary}10;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transform: ${({ $isOpen }) => ($isOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)')};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 200;
  overflow: hidden;
`;

const DropdownHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border}60;
  background: ${({ theme }) => theme.colors.surfaceHover}30;
`;

const DropdownUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const DropdownUserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const DropdownUserName = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const DropdownUserEmail = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const DropdownContent = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.primary};

    svg {
      color: ${({ theme }) => theme.colors.primary};
    }
  }

  svg {
    color: ${({ theme }) => theme.colors.textMuted};
    transition: color 0.15s ease;
  }
`;

const DropdownLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.primary};

    svg {
      color: ${({ theme }) => theme.colors.primary};
    }
  }

  svg {
    color: ${({ theme }) => theme.colors.textMuted};
    transition: color 0.15s ease;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border}60;
  margin: ${({ theme }) => theme.spacing.sm} 0;
`;

const logoutShimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const LogoutItem = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* Premium gradient background */
  background: ${({ theme }) => theme.gradients.primary};
  color: white;
  box-shadow: 0 4px 14px rgba(91, 91, 247, 0.3);

  svg {
    color: white;
    transition: transform 0.3s ease;
  }

  /* Shimmer effect overlay */
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
      rgba(255, 255, 255, 0.25),
      transparent
    );
    background-size: 200% 100%;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(91, 91, 247, 0.4);

    svg {
      transform: translateX(2px);
    }

    &::before {
      opacity: 1;
      animation: ${logoutShimmer} 1.5s ease infinite;
    }
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOutClick = () => {
    setIsMenuOpen(false);
    setIsSignOutModalOpen(true);
  };

  return (
    <HeaderContainer>
      <LeftSection>
        <BrandContainer>
          <LogoIcon>
            <Wallet />
          </LogoIcon>
          <BrandName>FinanceTracker</BrandName>
        </BrandContainer>
        {title && <PageTitle>{title}</PageTitle>}
      </LeftSection>

      <RightSection>
        <ThemeToggleButton
          onClick={toggleTheme}
          aria-label="Toggle theme"
          $isDark={isDark}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </ThemeToggleButton>

        <NotificationButton aria-label="Notifications">
          <Bell size={20} />
          <NotificationBadge />
        </NotificationButton>

        <UserMenuContainer ref={menuRef}>
          <UserButton onClick={() => setIsMenuOpen(!isMenuOpen)} $isOpen={isMenuOpen} aria-label="User menu" aria-expanded={isMenuOpen}>
            <Avatar>{userInitial}</Avatar>
            <UserInfo>
              <UserName>{userName}</UserName>
              <UserRole>Personal Account</UserRole>
            </UserInfo>
            <ChevronDown size={16} className="chevron" />
          </UserButton>

          <DropdownMenu $isOpen={isMenuOpen}>
            <DropdownHeader>
              <DropdownUserInfo>
                <Avatar>{userInitial}</Avatar>
                <DropdownUserDetails>
                  <DropdownUserName>{userName}</DropdownUserName>
                  <DropdownUserEmail>{user?.email || 'user@example.com'}</DropdownUserEmail>
                </DropdownUserDetails>
              </DropdownUserInfo>
            </DropdownHeader>
            <DropdownContent>
              <DropdownLink href="/settings" onClick={() => setIsMenuOpen(false)}>
                <User size={18} />
                Profile
              </DropdownLink>
              <DropdownLink href="/settings" onClick={() => setIsMenuOpen(false)}>
                <Settings size={18} />
                Settings
              </DropdownLink>
              <Divider />
              <LogoutItem onClick={handleSignOutClick}>
                <LogOut size={18} />
                Sign Out
              </LogoutItem>
            </DropdownContent>
          </DropdownMenu>
        </UserMenuContainer>
      </RightSection>

      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
      />
    </HeaderContainer>
  );
}

export default Header;
