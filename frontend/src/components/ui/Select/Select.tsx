'use client';

import { forwardRef, SelectHTMLAttributes, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
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

const SelectWrapper = styled.div<{ $fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  ${({ $fullWidth }) => $fullWidth && css`width: 100%;`}
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

const SelectContainer = styled.div<{
  $hasError: boolean;
  $disabled: boolean;
  $focused: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;

  ${({ $disabled }) =>
    $disabled &&
    css`
      opacity: 0.7;
      cursor: not-allowed;
    `}

  ${({ $hasError }) =>
    $hasError &&
    css`
      animation: ${shake} 0.4s ease;
    `}
`;

const StyledSelect = styled.select<{ $hasError: boolean; $focused: boolean }>`
  width: 100%;
  padding: 0.75rem 2.75rem 0.75rem 1rem;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  border: 1.5px solid ${({ theme, $hasError, $focused }) =>
    $hasError
      ? theme.colors.error
      : $focused
      ? theme.colors.primary
      : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  appearance: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  /* Focus glow effect */
  box-shadow: ${({ theme, $focused, $hasError }) =>
    $focused
      ? $hasError
        ? `0 0 0 3px ${theme.colors.errorLight}`
        : `0 0 0 3px ${theme.colors.primaryLight}`
      : 'none'};

  &:hover:not(:disabled) {
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.borderDark};
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  /* Style options */
  option {
    padding: 0.5rem;
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const IconWrapper = styled.span<{ $focused: boolean }>`
  position: absolute;
  right: 1rem;
  pointer-events: none;
  color: ${({ theme, $focused }) =>
    $focused ? theme.colors.primary : theme.colors.textMuted};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    transition: transform 0.2s ease;
    transform: ${({ $focused }) => ($focused ? 'rotate(180deg)' : 'rotate(0)')};
  }
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
    content: '';
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

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      placeholder,
      fullWidth = false,
      disabled = false,
      id,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      setFocused(false);
      onBlur?.(e);
    };

    return (
      <SelectWrapper $fullWidth={fullWidth}>
        {label && (
          <Label htmlFor={selectId} $focused={focused} $hasError={!!error}>
            {label}
          </Label>
        )}
        <SelectContainer $hasError={!!error} $disabled={disabled} $focused={focused}>
          <StyledSelect
            ref={ref}
            id={selectId}
            disabled={disabled}
            $hasError={!!error}
            $focused={focused}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : undefined}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </StyledSelect>
          <IconWrapper $focused={focused}>
            <ChevronDown size={18} />
          </IconWrapper>
        </SelectContainer>
        {error && (
          <HelperText>
            <ErrorText id={`${selectId}-error`}>{error}</ErrorText>
          </HelperText>
        )}
        {hint && !error && (
          <HelperText>
            <HintText>{hint}</HintText>
          </HelperText>
        )}
      </SelectWrapper>
    );
  }
);

Select.displayName = 'Select';
