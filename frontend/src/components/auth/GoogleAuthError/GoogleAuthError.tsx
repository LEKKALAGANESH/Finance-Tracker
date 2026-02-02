'use client';

import { AlertCircle, RefreshCw, Mail, X } from 'lucide-react';
import { useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

import { AuthErrorInfo } from '@/lib/auth-errors';

interface GoogleAuthErrorProps {
  errorInfo: AuthErrorInfo;
  onRetry?: () => void;
  onDismiss?: () => void;
  onUseEmail?: () => void;
  isRetrying?: boolean;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  animation: ${fadeIn} 0.3s ease-out;
  background: ${({ theme }) => theme.colors.errorLight};
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  position: relative;
`;

const DismissButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  background: none;
  border: none;
  padding: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const IconWrapper = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.error || '#ef4444'};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: white;
`;

const Content = styled.div`
  flex: 1;
  padding-right: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`;

const Message = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
  line-height: 1.5;
`;

const Suggestion = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
  font-style: italic;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ $variant, theme }) =>
    $variant === 'primary'
      ? `
    background: ${theme.colors.primary};
    color: white;
    border: none;

    &:hover:not(:disabled) {
      background: ${theme.colors.primaryHover || theme.colors.primary};
      transform: translateY(-1px);
    }
  `
      : `
    background: transparent;
    color: ${theme.colors.text};
    border: 1px solid ${theme.colors.border};

    &:hover:not(:disabled) {
      background: ${theme.colors.surfaceHover};
      border-color: ${theme.colors.borderDark};
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  svg {
    flex-shrink: 0;
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SpinningIcon = styled(RefreshCw)`
  animation: ${spin} 1s linear infinite;
`;

export function GoogleAuthError({
  errorInfo,
  onRetry,
  onDismiss,
  onUseEmail,
  isRetrying = false,
}: GoogleAuthErrorProps) {
  const handleRetry = useCallback(() => {
    if (onRetry && !isRetrying) {
      onRetry();
    }
  }, [onRetry, isRetrying]);

  return (
    <Container role="alert" aria-live="polite">
      {onDismiss && (
        <DismissButton
          onClick={onDismiss}
          aria-label="Dismiss error message"
          type="button"
        >
          <X size={16} />
        </DismissButton>
      )}

      <Header>
        <IconWrapper aria-hidden="true">
          <AlertCircle size={20} />
        </IconWrapper>
        <Content>
          <Title>{errorInfo.title}</Title>
          <Message>{errorInfo.message}</Message>
          {errorInfo.suggestion && <Suggestion>{errorInfo.suggestion}</Suggestion>}
        </Content>
      </Header>

      <Actions>
        {errorInfo.canRetry && onRetry && (
          <ActionButton
            $variant="primary"
            onClick={handleRetry}
            disabled={isRetrying}
            type="button"
          >
            {isRetrying ? (
              <>
                <SpinningIcon size={14} />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                Try Again
              </>
            )}
          </ActionButton>
        )}

        {errorInfo.showEmailFallback && onUseEmail && (
          <ActionButton $variant="secondary" onClick={onUseEmail} type="button">
            <Mail size={14} />
            Use Email Instead
          </ActionButton>
        )}
      </Actions>
    </Container>
  );
}

export default GoogleAuthError;
