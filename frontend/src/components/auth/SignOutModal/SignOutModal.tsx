'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes, css } from 'styled-components';
import {
  LogOut,
  Shield,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  X,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SignOutStep = 'confirm' | 'signing-out' | 'success' | 'error';

// Hook for prefers-reduced-motion that updates dynamically
function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReduced(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReduced;
}

// Static check for styled-components (they need a static value)
const staticPrefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

// Animations with reduced motion support
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const slideDown = keyframes`
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-20px) scale(0.98);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.08); opacity: 0.9; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const confetti = keyframes`
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(-100px) rotate(720deg); opacity: 0; }
`;

const wave = keyframes`
  0%, 100% { transform: rotate(0deg); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-8deg); }
  30% { transform: rotate(14deg); }
  40% { transform: rotate(-4deg); }
  50% { transform: rotate(10deg); }
  60% { transform: rotate(0deg); }
`;

const scaleIn = keyframes`
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
`;

const ripple = keyframes`
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2.4); opacity: 0; }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
`;

// Overlay with blur
const Overlay = styled.div<{ $isClosing: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: ${({ theme }) => theme.spacing.lg};
  animation: ${({ $isClosing }) =>
    staticPrefersReducedMotion
      ? 'none'
      : $isClosing
        ? css`${fadeOut} 0.2s ease forwards`
        : css`${fadeIn} 0.3s ease`
  };

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md};
  }

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.sm};
    align-items: flex-end;
  }
`;

// Modal Container with glassmorphism
const ModalContainer = styled.div<{ $isClosing: boolean; $step: SignOutStep }>`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow:
    0 0 0 1px ${({ theme }) => theme.colors.border}30,
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 80px ${({ theme }) => theme.colors.primary}08;
  width: 100%;
  max-width: 420px;
  position: relative;
  overflow: hidden;
  animation: ${({ $isClosing }) =>
    staticPrefersReducedMotion
      ? 'none'
      : $isClosing
        ? css`${slideDown} 0.2s ease forwards`
        : css`${slideUp} 0.35s cubic-bezier(0.16, 1, 0.3, 1)`
  };

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    max-width: 480px;
  }

  @media (max-width: 480px) {
    max-width: 100%;
    border-radius: ${({ theme }) => theme.borderRadius.xl} ${({ theme }) => theme.borderRadius.xl} 0 0;
    max-height: 85vh;
    overflow-y: auto;
  }
`;

// Top gradient accent
const TopAccent = styled.div<{ $step: SignOutStep }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: ${({ $step, theme }) => {
    switch ($step) {
      case 'success':
        return theme.gradients?.success || `linear-gradient(135deg, ${theme.colors.success} 0%, #34d399 100%)`;
      case 'error':
        return `linear-gradient(135deg, ${theme.colors.error} 0%, #f87171 100%)`;
      case 'signing-out':
        return theme.gradients.primary;
      default:
        return `linear-gradient(135deg, ${theme.colors.error} 0%, #f87171 100%)`;
    }
  }};
  transition: background 0.5s ease;
`;

// Close button
const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textMuted};
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

// Content wrapper
const Content = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.lg};
    padding-bottom: calc(${({ theme }) => theme.spacing.xl} + env(safe-area-inset-bottom, 0px));
  }
`;

// Screen reader only text
const SrOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

// Live region for announcements
const LiveRegion = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

// Step indicator
const StepIndicator = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StepDot = styled.div<{ $active: boolean; $completed: boolean }>`
  width: ${({ $active }) => $active ? '24px' : '8px'};
  height: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ $active, $completed, theme }) =>
    $completed
      ? theme.colors.success
      : $active
      ? theme.gradients.primary
      : theme.colors.border};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

// Icon containers for different states
const IconContainer = styled.div<{ $variant: 'danger' | 'loading' | 'success' | 'error' }>`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  position: relative;

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'danger':
        return css`
          background: linear-gradient(135deg, ${theme.colors.errorLight} 0%, ${theme.colors.error}15 100%);

          &::before {
            content: '';
            position: absolute;
            inset: -6px;
            border-radius: 50%;
            background: ${theme.colors.error};
            opacity: 0.1;
            animation: ${staticPrefersReducedMotion ? 'none' : css`${pulse} 2s ease-in-out infinite`};
          }

          svg {
            color: ${theme.colors.error};
            animation: ${staticPrefersReducedMotion ? 'none' : css`${float} 3s ease-in-out infinite`};
          }
        `;
      case 'loading':
        return css`
          background: linear-gradient(135deg, ${theme.colors.primaryLight} 0%, ${theme.colors.primary}15 100%);

          &::before {
            content: '';
            position: absolute;
            inset: -6px;
            border-radius: 50%;
            border: 3px solid transparent;
            border-top-color: ${theme.colors.primary};
            animation: ${staticPrefersReducedMotion ? 'none' : css`${spin} 1s linear infinite`};
          }

          svg {
            color: ${theme.colors.primary};
          }
        `;
      case 'success':
        return css`
          background: linear-gradient(135deg, ${theme.colors.successLight || '#d1fae5'} 0%, ${theme.colors.success}15 100%);
          animation: ${staticPrefersReducedMotion ? 'none' : css`${scaleIn} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)`};

          &::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: ${theme.colors.success};
            animation: ${staticPrefersReducedMotion ? 'none' : css`${ripple} 1s ease-out`};
          }

          svg {
            color: ${theme.colors.success};
            position: relative;
            z-index: 1;
          }
        `;
      case 'error':
        return css`
          background: linear-gradient(135deg, ${theme.colors.errorLight} 0%, ${theme.colors.error}15 100%);
          animation: ${staticPrefersReducedMotion ? 'none' : css`${shake} 0.5s ease`};

          svg {
            color: ${theme.colors.error};
          }
        `;
    }
  }}

  @media (max-width: 480px) {
    width: 72px;
    height: 72px;
    margin-bottom: ${({ theme }) => theme.spacing.lg};

    svg {
      width: 32px;
      height: 32px;
    }
  }
`;

// Titles and descriptions
const Title = styled.h2<{ $step: SignOutStep }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  letter-spacing: -0.02em;

  ${({ $step, theme }) => $step === 'success' && css`
    background: linear-gradient(135deg, ${theme.colors.success} 0%, #34d399 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  `}

  ${({ $step, theme }) => $step === 'error' && css`
    color: ${theme.colors.error};
  `}

  @media (max-width: 480px) {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  }
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 ${({ theme }) => theme.spacing.xl};
  line-height: 1.6;
  max-width: 320px;

  @media (max-width: 480px) {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

// User card with premium design
const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.glass?.background || theme.colors.surfaceHover}50;
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme }) => theme.colors.border}40;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  width: 100%;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${({ theme }) => theme.colors.primary}30, transparent);
  }

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  }
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.gradients.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  box-shadow: ${({ theme }) => theme.shadows.primary};
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
  flex: 1;
  min-width: 0;
`;

const UserName = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;

  @media (max-width: 480px) {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
`;

const UserEmail = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;

  @media (max-width: 480px) {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
  }
`;

// Session info
const SessionInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surfaceHover}30;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  width: 100%;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
    padding: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

const SessionItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.textMuted};
  }

  @media (max-width: 480px) {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
  }
`;

// Security badge
const SecurityBadge = styled.div<{ $variant?: 'success' | 'error' | 'info' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${({ theme, $variant }) => {
    switch ($variant) {
      case 'error':
        return `${theme.colors.errorLight}50`;
      case 'info':
        return `${theme.colors.primaryLight}50`;
      default:
        return `${theme.colors.successLight || '#d1fae5'}50`;
    }
  }};
  color: ${({ theme, $variant }) => {
    switch ($variant) {
      case 'error':
        return theme.colors.error;
      case 'info':
        return theme.colors.primary;
      default:
        return theme.colors.success;
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  svg {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 480px) {
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

// Button group
const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

// Buttons with premium styling
const Button = styled.button<{ $variant?: 'secondary' | 'danger' | 'success' }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 14px ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'danger':
        return css`
          background: linear-gradient(135deg, ${theme.colors.error} 0%, #dc2626 100%);
          color: white;
          box-shadow: 0 4px 14px ${theme.colors.error}35;

          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s ease;
          }

          &:hover:not(:disabled) {
            transform: ${staticPrefersReducedMotion ? 'none' : 'translateY(-2px)'};
            box-shadow: 0 8px 25px ${theme.colors.error}40;

            &::before {
              left: 100%;
            }
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
      case 'success':
        return css`
          background: linear-gradient(135deg, ${theme.colors.success} 0%, #059669 100%);
          color: white;
          box-shadow: 0 4px 14px ${theme.colors.success}35;

          &:hover:not(:disabled) {
            transform: ${staticPrefersReducedMotion ? 'none' : 'translateY(-2px)'};
            box-shadow: 0 8px 25px ${theme.colors.success}40;
          }
        `;
      default:
        return css`
          background: ${theme.colors.surfaceHover};
          color: ${theme.colors.text};
          border: 1px solid ${theme.colors.border};

          &:hover:not(:disabled) {
            background: ${theme.colors.surface};
            border-color: ${theme.colors.primary}40;
            color: ${theme.colors.primary};
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  @media (max-width: 480px) {
    padding: 12px ${({ theme }) => theme.spacing.lg};
  }
`;

// Progress bar for signing out
const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.gradients.primary};
  background-size: 200% 100%;
  animation: ${staticPrefersReducedMotion ? 'none' : css`${shimmer} 1.5s ease-in-out infinite`};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  width: 100%;
  transform-origin: left;
`;

// Confetti particles
const ConfettiContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  pointer-events: none;
`;

const ConfettiParticle = styled.div<{ $delay: number; $color: string; $x: number }>`
  position: absolute;
  width: 8px;
  height: 8px;
  background: ${({ $color }) => $color};
  border-radius: 2px;
  animation: ${staticPrefersReducedMotion ? 'none' : css`${confetti} 1s ease-out forwards`};
  animation-delay: ${({ $delay }) => $delay}ms;
  transform: translateX(${({ $x }) => $x}px);
`;

// Farewell message with wave emoji
const FarewellEmoji = styled.span`
  display: inline-block;
  animation: ${staticPrefersReducedMotion ? 'none' : css`${wave} 2s ease-in-out infinite`};
  transform-origin: 70% 70%;
  font-size: 1.5em;
  margin-left: 8px;
`;

// Keyboard hint
const KeyboardHint = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border}40;

  @media (max-width: 768px) {
    display: none;
  }
`;

const KeyHint = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const KeyBadge = styled.kbd`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 22px;
  padding: 0 6px;
  background: ${({ theme }) => theme.colors.surfaceHover};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-size: 11px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// Focus trap helper - gets all focusable elements
const getFocusableElements = (container: HTMLElement) => {
  return container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
};

export function SignOutModal({ isOpen, onClose }: SignOutModalProps) {
  const { user, signOut } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState<SignOutStep>('confirm');
  const [isClosing, setIsClosing] = useState(false);
  const [sessionDuration, setSessionDuration] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [mounted, setMounted] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const isSigningOutRef = useRef(false);
  const originalOverflowRef = useRef<string>('');

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userInitial = userName.charAt(0).toUpperCase();
  const firstName = userName.split(' ')[0];

  // Mount state for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate session duration
  useEffect(() => {
    if (user?.last_sign_in_at) {
      const signInTime = new Date(user.last_sign_in_at).getTime();
      const now = Date.now();
      const diff = now - signInTime;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setSessionDuration(`${hours}h ${minutes}m`);
      } else {
        setSessionDuration(`${minutes} min`);
      }
    }
  }, [user]);

  // Handle close with animation
  const handleClose = useCallback(() => {
    if (step !== 'confirm' && step !== 'error') return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      // Return focus to the element that opened the modal
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }, 200);
  }, [step, onClose]);

  // Handle sign out with double-click prevention
  const handleSignOut = useCallback(async () => {
    // Prevent double-click
    if (isSigningOutRef.current) return;
    isSigningOutRef.current = true;

    setStep('signing-out');
    setAnnouncement('Signing out, please wait...');

    // Simulate minimum loading time for smooth UX
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      setStep('success');
      setAnnouncement(`Goodbye ${firstName}! You have been signed out successfully.`);

      // Show success state briefly before actual signout
      await new Promise(resolve => setTimeout(resolve, 1200));

      await signOut();
      toast.success(`Goodbye, ${firstName}! See you soon.`);
    } catch (error) {
      setStep('error');
      setAnnouncement('Failed to sign out. Please try again.');
      isSigningOutRef.current = false;
    }
  }, [signOut, toast, firstName]);

  // Reset state when modal opens and manage focus
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Reset signing out ref
      isSigningOutRef.current = false;

      setStep('confirm');
      setIsClosing(false);
      setAnnouncement('Sign out confirmation dialog opened');

      // Store original overflow and prevent body scroll
      originalOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Focus the modal after animation
      setTimeout(() => {
        if (firstFocusableRef.current) {
          firstFocusableRef.current.focus();
        }
      }, 100);
    } else {
      // Restore original body scroll value
      document.body.style.overflow = originalOverflowRef.current;
    }

    return () => {
      // Restore original body scroll value on unmount
      document.body.style.overflow = originalOverflowRef.current;
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = getFocusableElements(modalRef.current);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (step === 'confirm' || step === 'error')) {
        handleClose();
      }
      if (e.key === 'Enter' && step === 'confirm') {
        e.preventDefault();
        handleSignOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, step, handleClose, handleSignOut]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && (step === 'confirm' || step === 'error')) {
      handleClose();
    }
  };

  const handleRetry = () => {
    setStep('confirm');
    setAnnouncement('Returned to confirmation. You can try signing out again.');
  };

  if (!isOpen || !mounted) return null;

  const confettiColors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#059669'];

  const modalContent = (
    <Overlay $isClosing={isClosing} onClick={handleOverlayClick}>
      <ModalContainer
        ref={modalRef}
        $isClosing={isClosing}
        $step={step}
        role="dialog"
        aria-modal="true"
        aria-labelledby="signout-title"
        aria-describedby="signout-description"
        tabIndex={-1}
      >
        <TopAccent $step={step} />

        {/* Live region for screen reader announcements */}
        <LiveRegion role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </LiveRegion>

        {(step === 'confirm' || step === 'error') && (
          <CloseButton
            ref={firstFocusableRef}
            onClick={handleClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </CloseButton>
        )}

        <Content>
          <StepIndicator aria-hidden="true">
            <StepDot $active={step === 'confirm'} $completed={step !== 'confirm'} />
            <StepDot $active={step === 'signing-out'} $completed={step === 'success'} />
            <StepDot $active={step === 'success' || step === 'error'} $completed={false} />
          </StepIndicator>

          <SrOnly>
            Step {step === 'confirm' ? '1 of 3' : step === 'signing-out' ? '2 of 3' : '3 of 3'}
          </SrOnly>

          {step === 'confirm' && (
            <>
              <IconContainer $variant="danger" aria-hidden="true">
                <LogOut size={38} />
              </IconContainer>

              <Title id="signout-title" $step={step}>Sign Out?</Title>
              <Description id="signout-description">
                You&apos;re about to sign out of your account. Any unsaved changes will be lost.
              </Description>

              <UserCard>
                <UserAvatar aria-hidden="true">{userInitial}</UserAvatar>
                <UserDetails>
                  <UserName>{userName}</UserName>
                  <UserEmail>{user?.email || 'user@example.com'}</UserEmail>
                </UserDetails>
              </UserCard>

              <SessionInfo>
                <SessionItem>
                  <Clock aria-hidden="true" />
                  <span>Session: {sessionDuration || 'Just now'}</span>
                </SessionItem>
                <SessionItem>
                  <Shield aria-hidden="true" />
                  <span>Secure logout</span>
                </SessionItem>
              </SessionInfo>

              <ButtonGroup>
                <Button onClick={handleClose}>
                  Cancel
                </Button>
                <Button $variant="danger" onClick={handleSignOut}>
                  <LogOut size={18} aria-hidden="true" />
                  Sign Out
                </Button>
              </ButtonGroup>

              <KeyboardHint aria-hidden="true">
                <KeyHint>
                  <KeyBadge>Esc</KeyBadge> to cancel
                </KeyHint>
                <KeyHint>
                  <KeyBadge>Enter</KeyBadge> to confirm
                </KeyHint>
              </KeyboardHint>
            </>
          )}

          {step === 'signing-out' && (
            <>
              <IconContainer $variant="loading" aria-hidden="true">
                <LogOut size={38} />
              </IconContainer>

              <Title id="signout-title" $step={step}>Signing Out...</Title>
              <Description id="signout-description">
                Securely ending your session and clearing local data.
              </Description>

              <ProgressBar role="progressbar" aria-label="Sign out progress">
                <ProgressFill />
              </ProgressBar>

              <SecurityBadge $variant="info">
                <Shield aria-hidden="true" />
                Secure sign out in progress
              </SecurityBadge>
            </>
          )}

          {step === 'success' && (
            <>
              <ConfettiContainer aria-hidden="true">
                {confettiColors.map((color, i) => (
                  <ConfettiParticle
                    key={i}
                    $color={color}
                    $delay={i * 100}
                    $x={(i - 2) * 30}
                  />
                ))}
              </ConfettiContainer>

              <IconContainer $variant="success" aria-hidden="true">
                <CheckCircle2 size={42} />
              </IconContainer>

              <Title id="signout-title" $step={step}>
                Goodbye, {firstName}!
                <FarewellEmoji aria-hidden="true">👋</FarewellEmoji>
              </Title>
              <Description id="signout-description">
                You&apos;ve been signed out successfully. Thanks for using FinanceTracker!
              </Description>

              <SecurityBadge>
                <Sparkles aria-hidden="true" />
                Session ended securely
              </SecurityBadge>

              <Button $variant="success" style={{ maxWidth: '200px' }} disabled>
                <ArrowRight size={18} aria-hidden="true" />
                Redirecting...
              </Button>
            </>
          )}

          {step === 'error' && (
            <>
              <IconContainer $variant="error" aria-hidden="true">
                <AlertCircle size={38} />
              </IconContainer>

              <Title id="signout-title" $step={step}>Sign Out Failed</Title>
              <Description id="signout-description">
                We couldn&apos;t sign you out. Please check your connection and try again.
              </Description>

              <SecurityBadge $variant="error">
                <AlertCircle aria-hidden="true" />
                Something went wrong
              </SecurityBadge>

              <ButtonGroup>
                <Button onClick={handleClose}>
                  Cancel
                </Button>
                <Button $variant="danger" onClick={handleRetry}>
                  Try Again
                </Button>
              </ButtonGroup>
            </>
          )}
        </Content>
      </ModalContainer>
    </Overlay>
  );

  // Render in portal for proper z-index stacking
  return createPortal(modalContent, document.body);
}

export default SignOutModal;
