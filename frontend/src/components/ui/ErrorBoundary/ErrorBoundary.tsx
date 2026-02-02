'use client';

import { Component, ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  showHomeButton?: boolean;
  showBackButton?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: ${({ theme }) => theme.spacing['2xl']};
  text-align: center;
  animation: ${fadeIn} 0.5s ease forwards;
`;

const IconWrapper = styled.div`
  width: 100px;
  height: 100px;
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  background: ${({ theme }) => theme.colors.errorLight};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  animation: ${float} 3s ease-in-out infinite;
  box-shadow: 0 8px 32px rgba(239, 68, 68, 0.2);

  svg {
    color: ${({ theme }) => theme.colors.error};
    width: 48px;
    height: 48px;
  }
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 400px;
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
  justify-content: center;
`;

const ErrorDetails = styled.details`
  margin-top: ${({ theme }) => theme.spacing.xl};
  text-align: left;
  max-width: 600px;
  width: 100%;
`;

const ErrorSummary = styled.summary`
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ErrorStack = styled.pre`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  color: ${({ theme }) => theme.colors.error};
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
`;

function ErrorFallback({
  error,
  errorInfo,
  onReset,
  showHomeButton = true,
  showBackButton = true,
}: {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onReset?: () => void;
  showHomeButton?: boolean;
  showBackButton?: boolean;
}) {
  const handleRefresh = () => {
    if (onReset) {
      onReset();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <Container>
      <IconWrapper>
        <AlertTriangle />
      </IconWrapper>
      <Title>Something went wrong</Title>
      <Description>
        We encountered an unexpected error. Don&apos;t worry, your data is safe.
        Try refreshing the page or go back to the dashboard.
      </Description>
      <ButtonGroup>
        <Button onClick={handleRefresh} leftIcon={<RefreshCw size={18} />}>
          Try Again
        </Button>
        {showBackButton && (
          <Button variant="outline" onClick={handleGoBack} leftIcon={<ArrowLeft size={18} />}>
            Go Back
          </Button>
        )}
        {showHomeButton && (
          <Button variant="ghost" onClick={handleGoHome} leftIcon={<Home size={18} />}>
            Dashboard
          </Button>
        )}
      </ButtonGroup>
      {(error || errorInfo) && process.env.NODE_ENV === 'development' && (
        <ErrorDetails>
          <ErrorSummary>View error details (Development only)</ErrorSummary>
          <ErrorStack>
            {error && `Error: ${error.message}\n\n`}
            {error?.stack && `Stack:\n${error.stack}\n\n`}
            {errorInfo?.componentStack && `Component Stack:${errorInfo.componentStack}`}
          </ErrorStack>
        </ErrorDetails>
      )}
    </Container>
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Here you could send to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          showHomeButton={this.props.showHomeButton}
          showBackButton={this.props.showBackButton}
        />
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use with hooks
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook to manually trigger error boundary (for async errors)
export function useErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}
