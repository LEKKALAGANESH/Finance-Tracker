'use client';

import styled from 'styled-components';
import { Check, Zap, BarChart3, Layers, Settings2 } from 'lucide-react';
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
  max-width: 450px;
  margin: 0 auto;
  line-height: 1.6;
`;

const TemplateGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  max-width: 500px;
  margin: 0 auto;
`;

const TemplateCard = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ $selected, theme }) =>
    $selected ? theme.colors.primaryLight + '30' : theme.colors.surface};
  border: 2px solid ${({ $selected, theme }) =>
    $selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    border-color: ${({ $selected, theme }) =>
      $selected ? theme.colors.primary : theme.colors.primaryLight};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const IconWrapper = styled.div<{ $selected: boolean; $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ $selected, $color, theme }) =>
    $selected ? theme.gradients.primary : $color + '15'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;

  svg {
    color: ${({ $selected, $color, theme }) =>
      $selected ? theme.colors.textInverse : $color};
    width: 24px;
    height: 24px;
  }
`;

const TemplateContent = styled.div`
  flex: 1;
`;

const TemplateHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const TemplateName = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const SelectedBadge = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ theme }) => theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    color: ${({ theme }) => theme.colors.textInverse};
    width: 12px;
    height: 12px;
  }
`;

const TemplateDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  line-height: 1.5;
`;

const CategoryList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const CategoryTag = styled.span`
  padding: 4px 8px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius.full};
`;

const RecommendedBadge = styled.span`
  padding: 2px 8px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.success};
  background: ${({ theme }) => theme.colors.successLight};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  margin-left: ${({ theme }) => theme.spacing.sm};
`;

type TemplateType = 'minimal' | 'standard' | 'detailed' | 'custom';

interface Template {
  id: TemplateType;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number | string }>;
  color: string;
  categories: string[];
  recommended?: boolean;
}

const templates: Template[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Essential categories for basic tracking. Perfect if you want to keep things simple.',
    icon: Zap,
    color: '#f59e0b',
    categories: ['Food', 'Transport', 'Bills'],
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'Balanced budget with common spending categories. Great for most users.',
    icon: BarChart3,
    color: '#10b981',
    categories: ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health'],
    recommended: true,
  },
  {
    id: 'detailed',
    name: 'Detailed',
    description: 'Comprehensive tracking across all spending areas for maximum insight.',
    icon: Layers,
    color: '#6366f1',
    categories: ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Education', 'Travel'],
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Start from scratch and create your own budget categories later.',
    icon: Settings2,
    color: '#8b5cf6',
    categories: [],
  },
];

export function BudgetTemplateStep() {
  const { data, updateData } = useOnboarding();

  const handleSelect = (templateId: TemplateType) => {
    updateData({ budgetTemplate: templateId });
  };

  return (
    <Container>
      <Header>
        <Title>Choose a budget template</Title>
        <Description>
          We&apos;ll create starter budgets based on your income. You can always customize these later.
        </Description>
      </Header>

      <TemplateGrid>
        {templates.map((template) => {
          const isSelected = data.budgetTemplate === template.id;
          return (
            <TemplateCard
              key={template.id}
              $selected={isSelected}
              onClick={() => handleSelect(template.id)}
              type="button"
            >
              <IconWrapper $selected={isSelected} $color={template.color}>
                <template.icon />
              </IconWrapper>
              <TemplateContent>
                <TemplateHeader>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TemplateName>{template.name}</TemplateName>
                    {template.recommended && <RecommendedBadge>Recommended</RecommendedBadge>}
                  </div>
                  {isSelected && (
                    <SelectedBadge>
                      <Check />
                    </SelectedBadge>
                  )}
                </TemplateHeader>
                <TemplateDescription>{template.description}</TemplateDescription>
                {template.categories.length > 0 && (
                  <CategoryList>
                    {template.categories.map((cat) => (
                      <CategoryTag key={cat}>{cat}</CategoryTag>
                    ))}
                  </CategoryList>
                )}
              </TemplateContent>
            </TemplateCard>
          );
        })}
      </TemplateGrid>
    </Container>
  );
}
