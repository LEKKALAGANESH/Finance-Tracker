"use client";

import { forwardRef, InputHTMLAttributes, ReactNode, useState } from "react";
import styled, { css, keyframes } from "styled-components";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const InputWrapper = styled.div<{ $fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      width: 100%;
    `}
`;

const Label = styled.label<{ $focused: boolean; $hasError: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme, $focused, $hasError }) =>
    $hasError
      ? theme.colors.error
      : $focused
        ? theme.colors.primary
        : theme.colors.textSecondary};
  transition: color 0.2s ease;
  letter-spacing: 0.01em;
`;

const InputContainer = styled.div<{
  $hasError: boolean;
  $disabled: boolean;
  $focused: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  border: 1.5px solid
    ${({ theme, $hasError, $focused }) =>
      $hasError
        ? theme.colors.error
        : $focused
          ? theme.colors.primary
          : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  /* Focus glow effect */
  box-shadow: ${({ theme, $focused, $hasError }) =>
    $focused
      ? $hasError
        ? `0 0 0 3px ${theme.colors.errorLight}`
        : `0 0 0 3px ${theme.colors.primaryLight}`
      : "none"};

  /* Animated underline */
  &::after {
    content: "";
    position: absolute;
    bottom: -1.5px;
    left: 50%;
    width: ${({ $focused }) => ($focused ? "100%" : "0%")};
    height: 2px;
    background: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error : theme.gradients.primary};
    transform: translateX(-50%);
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 0 0 ${({ theme }) => theme.borderRadius.lg}
      ${({ theme }) => theme.borderRadius.lg};
  }

  ${({ $disabled, theme }) =>
    $disabled &&
    css`
      background: ${theme.colors.surfaceHover};
      cursor: not-allowed;
      opacity: 0.7;
    `}

  ${({ $hasError }) =>
    $hasError &&
    css`
      animation: ${shake} 0.4s ease;
    `}

  &:hover:not(:focus-within) {
    border-color: ${({ theme, $hasError, $disabled }) =>
      $disabled
        ? theme.colors.border
        : $hasError
          ? theme.colors.error
          : theme.colors.borderDark};
  }
`;

const StyledInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text};
  min-width: 0;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
    transition: color 0.2s ease;
  }

  &:focus::placeholder {
    color: ${({ theme }) => theme.colors.textMuted}80;
  }

  &:disabled {
    cursor: not-allowed;
  }

  /* Remove autofill background */
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px ${({ theme }) => theme.colors.surface}
      inset;
    -webkit-text-fill-color: ${({ theme }) => theme.colors.text};
    transition: background-color 5000s ease-in-out 0s;
  }
`;

const IconWrapper = styled.span<{
  $focused?: boolean;
  $position?: "left" | "right";
}>`
  display: flex;
  align-items: center;
  color: ${({ theme, $focused }) =>
    $focused ? theme.colors.primary : theme.colors.textMuted};
  transition:
    color 0.2s ease,
    transform 0.2s ease;

  svg {
    width: 18px;
    height: 18px;
  }

  ${({ $focused, $position }) =>
    $focused &&
    $position === "left" &&
    css`
      transform: scale(1.1);
    `}
`;

const HelperText = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.375rem;
  animation: ${fadeInUp} 0.2s ease;
`;

const ErrorText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.error};
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &::before {
    content: "";
    display: inline-block;
    width: 4px;
    height: 4px;
    background: ${({ theme }) => theme.colors.error};
    border-radius: 50%;
  }
`;

const HintText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled = false,
      id,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      onBlur?.(e);
    };

    return (
      <InputWrapper $fullWidth={fullWidth}>
        {label && (
          <Label htmlFor={inputId} $focused={focused} $hasError={!!error}>
            {label}
          </Label>
        )}
        <InputContainer
          $hasError={!!error}
          $disabled={disabled}
          $focused={focused}
        >
          {leftIcon && (
            <IconWrapper $focused={focused} $position="left">
              {leftIcon}
            </IconWrapper>
          )}
          <StyledInput
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {rightIcon && (
            <IconWrapper $focused={focused} $position="right">
              {rightIcon}
            </IconWrapper>
          )}
        </InputContainer>
        {error && (
          <HelperText>
            <ErrorText id={`${inputId}-error`}>{error}</ErrorText>
          </HelperText>
        )}
        {hint && !error && (
          <HelperText>
            <HintText>{hint}</HintText>
          </HelperText>
        )}
      </InputWrapper>
    );
  },
);

Input.displayName = "Input";
