"use client";

import {
  BarChart3,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styled, { keyframes } from "styled-components";

import { SignOutModal } from "@/components/auth/SignOutModal";
import { useState } from "react";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const SidebarContainer = styled.aside<{ $isCollapsed: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${({ $isCollapsed }) => ($isCollapsed ? "76px" : "260px")};
  background: ${({ theme }) => theme.glass.backgroundStrong};
  backdrop-filter: ${({ theme }) => theme.glass.blurStrong};
  -webkit-backdrop-filter: ${({ theme }) => theme.glass.blurStrong};
  border-right: 1px solid ${({ theme }) => theme.colors.border}60;
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    width: ${({ $isCollapsed }) => ($isCollapsed ? "0" : "260px")};
    ${({ $isCollapsed }) => $isCollapsed && "border: none; box-shadow: none;"}
  }
`;

const Logo = styled.div<{ $isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border}60;
  position: relative;

  /* Gradient glow behind logo */
  &::before {
    content: "";
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    background: ${({ theme }) => theme.colors.primary};
    filter: blur(20px);
    opacity: 0.3;
    border-radius: 50%;
  }

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    background: ${({ theme }) => theme.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    white-space: nowrap;
    opacity: ${({ $isCollapsed }) => ($isCollapsed ? 0 : 1)};
    transform: translateX(
      ${({ $isCollapsed }) => ($isCollapsed ? "-10px" : "0")}
    );
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  svg {
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: ${({ theme }) => theme.shadows.primary};
  flex-shrink: 0;
  position: relative;
  z-index: 1;
`;

const ToggleButton = styled.button<{ $isCollapsed: boolean }>`
  position: absolute;
  right: -14px;
  top: 28px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  box-shadow: ${({ theme }) => theme.shadows.md};

  &:hover {
    background: ${({ theme }) => theme.gradients.primary};
    color: white;
    border-color: transparent;
    transform: scale(1.1);
    box-shadow: ${({ theme }) => theme.shadows.primary};
  }

  svg {
    transform: ${({ $isCollapsed }) =>
      $isCollapsed ? "rotate(180deg)" : "none"};
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileToggle = styled.button`
  display: none;
  position: fixed;
  top: ${({ theme }) => theme.spacing.md};
  left: ${({ theme }) => theme.spacing.md};
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.glass.backgroundStrong};
  backdrop-filter: ${({ theme }) => theme.glass.blur};
  border: 1px solid ${({ theme }) => theme.colors.border}60;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text};
  z-index: 101;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const Nav = styled.nav`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  overflow-y: auto;
  overflow-x: hidden;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }
`;

const NavSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const NavLabel = styled.span<{ $isCollapsed: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  padding: 0 ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  display: ${({ $isCollapsed }) => ($isCollapsed ? "none" : "block")};
`;

const Tooltip = styled.span`
  position: absolute;
  left: 100%;
  margin-left: 12px;
  padding: 6px 12px;
  background: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.background};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transform: translateX(-8px);
  transition: all 0.2s ease;
  z-index: 200;
  box-shadow: ${({ theme }) => theme.shadows.lg};

  &::before {
    content: "";
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 6px solid transparent;
    border-right-color: ${({ theme }) => theme.colors.text};
  }
`;

const NavIconWrapper = styled.div<{ $isActive: boolean }>`
  width: 36px;
  height: 36px;
  min-width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary : "transparent"};
  color: ${({ theme, $isActive }) => ($isActive ? "white" : "inherit")};
  transition: all 0.2s ease;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const NavItem = styled(Link)<{ $isActive: boolean; $isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  text-decoration: normal;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ $isCollapsed }) => ($isCollapsed ? "8px" : "8px 12px")};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary : theme.colors.textSecondary};
  background: ${({ theme, $isActive, $isCollapsed }) =>
    $isActive && !$isCollapsed ? theme.colors.primaryLight : "transparent"};
  font-weight: ${({ theme, $isActive }) =>
    $isActive
      ? theme.typography.fontWeight.semibold
      : theme.typography.fontWeight.medium};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 4px;
  position: relative;
  justify-content: ${({ $isCollapsed }) =>
    $isCollapsed ? "center" : "flex-start"};

  &:hover {
    background: ${({ theme, $isActive, $isCollapsed }) =>
      $isCollapsed
        ? "transparent"
        : $isActive
          ? theme.colors.primaryLight
          : theme.colors.surfaceHover};
    color: ${({ theme, $isActive }) =>
      $isActive ? theme.colors.primary : theme.colors.text};
  }

  &:hover ${NavIconWrapper} {
    background: ${({ theme, $isActive }) =>
      $isActive ? theme.colors.primaryHover : theme.colors.surfaceHover};
    color: ${({ theme, $isActive }) =>
      $isActive ? "white" : theme.colors.primary};
    transform: scale(1.05);
  }

  span {
    white-space: nowrap;
    opacity: ${({ $isCollapsed }) => ($isCollapsed ? 0 : 1)};
    width: ${({ $isCollapsed }) => ($isCollapsed ? 0 : "auto")};
    overflow: hidden;
    transition:
      opacity 0.2s ease,
      width 0.2s ease;
  }

  /* Tooltip on collapsed state */
  &:hover ${Tooltip} {
    opacity: ${({ $isCollapsed }) => ($isCollapsed ? 1 : 0)};
    visibility: ${({ $isCollapsed }) => ($isCollapsed ? "visible" : "hidden")};
    transform: ${({ $isCollapsed }) =>
      $isCollapsed ? "translateX(0)" : "translateX(-8px)"};
  }
`;

const dangerIconWiggle = keyframes`
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-8deg); }
  75% { transform: rotate(8deg); }
`;

const NavButtonIconWrapper = styled.div<{ $isDanger?: boolean }>`
  width: 36px;
  height: 36px;
  min-width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: transparent;
  color: ${({ theme, $isDanger }) =>
    $isDanger ? theme.colors.error : theme.colors.textSecondary};
  transition: all 0.2s ease;

  svg {
    width: 20px;
    height: 20px;
    transition: transform 0.2s ease;
  }
`;

const NavButton = styled.button<{ $isCollapsed: boolean; $isDanger?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ $isCollapsed }) => ($isCollapsed ? "8px" : "8px 12px")};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme, $isDanger }) =>
    $isDanger ? theme.colors.error : theme.colors.textSecondary};
  width: 100%;
  text-align: left;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  justify-content: ${({ $isCollapsed }) =>
    $isCollapsed ? "center" : "flex-start"};

  &:hover {
    background: ${({ $isCollapsed, $isDanger, theme }) =>
      $isCollapsed
        ? "transparent"
        : $isDanger
          ? `${theme.colors.error}08`
          : "inherit"};
  }

  &:hover ${NavButtonIconWrapper} {
    background: ${({ theme, $isDanger }) =>
      $isDanger ? theme.colors.errorLight : theme.colors.surfaceHover};
    color: ${({ theme, $isDanger }) =>
      $isDanger ? theme.colors.error : theme.colors.primary};
    transform: scale(1.05);

    svg {
      animation: ${({ $isDanger }) => ($isDanger ? dangerIconWiggle : "none")}
        0.4s ease;
    }
  }

  &:focus-visible {
    outline: 2px solid
      ${({ theme, $isDanger }) =>
        $isDanger ? theme.colors.error : theme.colors.primary};
    outline-offset: 2px;
  }

  span {
    white-space: nowrap;
    opacity: ${({ $isCollapsed }) => ($isCollapsed ? 0 : 1)};
    width: ${({ $isCollapsed }) => ($isCollapsed ? 0 : "auto")};
    overflow: hidden;
    transition:
      opacity 0.2s ease,
      width 0.2s ease;
  }

  /* Tooltip on collapsed state */
  &:hover ${Tooltip} {
    opacity: ${({ $isCollapsed }) => ($isCollapsed ? 1 : 0)};
    visibility: ${({ $isCollapsed }) => ($isCollapsed ? "visible" : "hidden")};
    transform: ${({ $isCollapsed }) =>
      $isCollapsed ? "translateX(0)" : "translateX(-8px)"};
  }
`;

const UserSection = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border}60;
  background: ${({ theme }) => theme.colors.surfaceHover}30;
`;

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/insights", label: "AI Insights", icon: Sparkles },
];

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  const handleSignOutClick = () => {
    setIsSignOutModalOpen(true);
  };

  return (
    <>
      <MobileToggle onClick={onToggle}>
        <Menu size={20} />
      </MobileToggle>

      <SidebarContainer $isCollapsed={isCollapsed}>
        <ToggleButton $isCollapsed={isCollapsed} onClick={onToggle}>
          <ChevronLeft size={14} />
        </ToggleButton>

        <Logo $isCollapsed={isCollapsed}>
          <LogoIcon>
            <Wallet size={22} />
          </LogoIcon>
          <h1>FinanceTracker</h1>
        </Logo>

        <Nav>
          <NavSection>
            <NavLabel $isCollapsed={isCollapsed}>Menu</NavLabel>
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                $isActive={pathname === item.href}
                $isCollapsed={isCollapsed}
              >
                <NavIconWrapper $isActive={pathname === item.href}>
                  <item.icon />
                </NavIconWrapper>
                <span>{item.label}</span>
                <Tooltip>{item.label}</Tooltip>
              </NavItem>
            ))}
          </NavSection>

          <NavSection>
            <NavLabel $isCollapsed={isCollapsed}>Settings</NavLabel>
            <NavItem
              href="/settings"
              $isActive={pathname === "/settings"}
              $isCollapsed={isCollapsed}
            >
              <NavIconWrapper $isActive={pathname === "/settings"}>
                <Settings />
              </NavIconWrapper>
              <span>Settings</span>
              <Tooltip>Settings</Tooltip>
            </NavItem>
          </NavSection>
        </Nav>

        <UserSection>
          <NavButton
            $isCollapsed={isCollapsed}
            $isDanger
            onClick={handleSignOutClick}
          >
            <NavButtonIconWrapper $isDanger>
              <LogOut />
            </NavButtonIconWrapper>
            <span>Sign Out</span>
            <Tooltip>Sign Out</Tooltip>
          </NavButton>
        </UserSection>
      </SidebarContainer>

      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
      />
    </>
  );
}
