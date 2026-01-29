'use client';

import { useEffect, useRef, ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.lg};
  animation: ${fadeIn} 0.25s ease;

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.sm};
    align-items: flex-end;
  }
`;

const sizeMap = {
  sm: '420px',
  md: '520px',
  lg: '640px',
  xl: '840px',
};

const ModalContainer = styled.div<{ $size: 'sm' | 'md' | 'lg' | 'xl' }>`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow:
    0 0 0 1px ${({ theme }) => theme.colors.border}40,
    ${({ theme }) => theme.shadows.xl},
    0 0 60px rgba(99, 102, 241, 0.1);
  width: 100%;
  max-width: ${({ $size }) => sizeMap[$size]};
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: ${scaleIn} 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  /* Top gradient accent */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ theme }) => theme.gradients.primary};
    opacity: 0.9;
  }

  /* Subtle inner glow */
  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(
      180deg,
      ${({ theme }) => theme.colors.primary}08 0%,
      transparent 100%
    );
    pointer-events: none;
  }

  @media (max-width: 480px) {
    max-width: 100%;
    max-height: 85vh;
    border-radius: ${({ theme }) => theme.borderRadius.xl} ${({ theme }) => theme.borderRadius.xl} 0 0;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border}60;
  position: relative;
  z-index: 1;

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  }
`;

const ModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  letter-spacing: -0.02em;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.textMuted};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${({ theme }) => theme.colors.error};
    opacity: 0;
    transition: opacity 0.2s ease;
    border-radius: inherit;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.textInverse};
    transform: rotate(90deg);

    &::before {
      opacity: 1;
    }
  }

  svg {
    position: relative;
    z-index: 1;
  }
`;

const ModalBody = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  overflow-y: auto;
  flex: 1;
  position: relative;
  z-index: 1;

  /* Custom scrollbar for modal */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.full};

    &:hover {
      background: ${({ theme }) => theme.colors.borderDark};
    }
  }

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <ModalContainer $size={size} ref={modalRef} role="dialog" aria-modal="true">
        {(title || showCloseButton) && (
          <ModalHeader>
            {title && <ModalTitle>{title}</ModalTitle>}
            {showCloseButton && (
              <CloseButton onClick={onClose} aria-label="Close modal">
                <X size={20} />
              </CloseButton>
            )}
          </ModalHeader>
        )}
        <ModalBody>{children}</ModalBody>
      </ModalContainer>
    </Overlay>
  );
}
