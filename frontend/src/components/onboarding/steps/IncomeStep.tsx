'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Info } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';

const Container = styled.div``;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 400px;
  margin: 0 auto;
  line-height: 1.6;
`;

const FormSection = styled.div`
  max-width: 400px;
  margin: 0 auto;
`;

const InputGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const InputWrapper = styled.div`
  position: relative;
`;

const CurrencyPrefix = styled.span`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  gap: 4px;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 16px 16px 48px;
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  }
`;

const CurrencySelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
  }
`;

const InfoBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.infoLight};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-top: ${({ theme }) => theme.spacing.lg};

  svg {
    color: ${({ theme }) => theme.colors.info};
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.info};
    margin: 0;
    line-height: 1.5;
  }
`;

const QuickAmounts = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const QuickAmount = styled.button<{ $selected: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ $selected, theme }) => ($selected ? theme.colors.textInverse : theme.colors.text)};
  background: ${({ $selected, theme }) =>
    $selected ? theme.gradients.primary : theme.colors.surfaceHover};
  border: 1px solid ${({ $selected, theme }) =>
    $selected ? 'transparent' : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

const quickAmounts = [2000, 3000, 4000, 5000, 7500, 10000];

export function IncomeStep() {
  const { data, updateData } = useOnboarding();
  const [incomeInput, setIncomeInput] = useState(
    data.monthlyIncome > 0 ? data.monthlyIncome.toString() : ''
  );

  const handleIncomeChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setIncomeInput(numericValue);
    updateData({ monthlyIncome: parseInt(numericValue) || 0 });
  };

  const handleQuickAmount = (amount: number) => {
    setIncomeInput(amount.toString());
    updateData({ monthlyIncome: amount });
  };

  const handleCurrencyChange = (currency: string) => {
    updateData({ currency });
  };

  const selectedCurrency = currencies.find((c) => c.code === data.currency) || currencies[0];

  return (
    <Container>
      <Header>
        <Title>What&apos;s your monthly income?</Title>
        <Description>
          This helps us create personalized budgets and savings recommendations for you.
        </Description>
      </Header>

      <FormSection>
        <InputGroup>
          <Label htmlFor="currency">Currency</Label>
          <CurrencySelect
            id="currency"
            value={data.currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.name} ({currency.code})
              </option>
            ))}
          </CurrencySelect>
        </InputGroup>

        <InputGroup>
          <Label htmlFor="income">Monthly Income (after taxes)</Label>
          <InputWrapper>
            <CurrencyPrefix>
              {selectedCurrency.symbol}
            </CurrencyPrefix>
            <Input
              id="income"
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={incomeInput}
              onChange={(e) => handleIncomeChange(e.target.value)}
            />
          </InputWrapper>
          <QuickAmounts>
            {quickAmounts.map((amount) => (
              <QuickAmount
                key={amount}
                $selected={data.monthlyIncome === amount}
                onClick={() => handleQuickAmount(amount)}
              >
                {selectedCurrency.symbol}{amount.toLocaleString()}
              </QuickAmount>
            ))}
          </QuickAmounts>
        </InputGroup>

        <InfoBox>
          <Info />
          <p>
            Your income is kept private and is only used to calculate budget percentages.
            You can update this anytime in settings.
          </p>
        </InfoBox>
      </FormSection>
    </Container>
  );
}
