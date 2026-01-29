'use client';

import { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { Check, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { categorySchema, CategoryFormData } from '@/lib/validations';
import { Category } from '@/types/expense';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => Promise<void>;
  category?: Category | null;
  type?: 'expense' | 'income';
}

// Organized icons by category for better UX
const ICON_CATEGORIES = {
  'Food & Drinks': ['🍔', '🍕', '🍟', '🌮', '🍜', '🍣', '🥗', '🍰', '☕', '🍺', '🧋', '🍷', '🥤', '🍳', '🥐'],
  'Transport': ['🚗', '🚕', '🚌', '🚇', '✈️', '🚂', '🚲', '⛽', '🛵', '🚁', '⛵', '🚀'],
  'Shopping': ['🛒', '🛍️', '👕', '👗', '👟', '💄', '👜', '🎁', '💍', '⌚', '🕶️', '👔'],
  'Home': ['🏠', '🛋️', '🛏️', '🚿', '💡', '🔧', '🧹', '🪴', '🏡', '🔑', '🪑', '🖼️'],
  'Entertainment': ['🎬', '🎮', '🎵', '🎭', '🎪', '🎨', '📺', '🎤', '🎧', '🎯', '🎲', '🃏'],
  'Health': ['💊', '🏥', '💪', '🏃', '🧘', '🩺', '🦷', '💉', '🩹', '🧬', '🏋️', '🥗'],
  'Education': ['📚', '🎓', '✏️', '📝', '💻', '🔬', '🔭', '🧮', '📖', '🗂️', '📓', '🖊️'],
  'Finance': ['💰', '💳', '💵', '🏦', '📈', '📉', '💹', '🪙', '💎', '📊', '🧾', '💲'],
  'Travel': ['🌴', '🏖️', '🗺️', '🧳', '🏨', '⛰️', '🏕️', '🎢', '🗼', '🌍', '🏰', '🗿'],
  'Pets': ['🐕', '🐈', '🐟', '🐦', '🐹', '🐰', '🦜', '🐢', '🐴', '🦮'],
  'Tech': ['📱', '💻', '🖥️', '⌨️', '🖱️', '🎧', '📷', '🎮', '🔌', '💾', '📡', '🤖'],
  'Other': ['📦', '⭐', '❤️', '🔥', '✨', '🎉', '🔔', '📌', '🏷️', '✅', '💡', '🎯'],
};

const ALL_ICONS = Object.values(ICON_CATEGORIES).flat();

const CATEGORY_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6b7280', '#78716c', '#1e293b',
];

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SectionLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const IconSearchWrapper = styled.div`
  position: relative;
  width: 180px;

  input {
    padding-left: 32px;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    height: 32px;
  }

  svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.textMuted};
    pointer-events: none;
  }
`;

const IconScrollContainer = styled.div`
  max-height: 200px;
  overflow-y: auto;
  padding-right: ${({ theme }) => theme.spacing.xs};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }
`;

const IconCategorySection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &:last-child {
    margin-bottom: 0;
  }
`;

const IconCategoryLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(6, 1fr);
  }
`;

const IconButton = styled.button<{ $isSelected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme, $isSelected }) =>
    $isSelected ? theme.colors.primaryLight : theme.colors.surfaceHover};
  border: 2px solid ${({ theme, $isSelected }) =>
    $isSelected ? theme.colors.primary : 'transparent'};
  transition: all 0.15s ease;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryLight};
    transform: scale(1.1);
  }
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: 480px) {
    grid-template-columns: repeat(7, 1fr);
  }
`;

const ColorButton = styled.button<{ $color: string; $isSelected: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ $color }) => $color};
  border: 3px solid ${({ theme, $isSelected }) =>
    $isSelected ? theme.colors.text : 'transparent'};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  &:hover {
    transform: scale(1.15);
    box-shadow: 0 4px 12px ${({ $color }) => $color}60;
  }

  ${({ $isSelected }) =>
    $isSelected &&
    `
    transform: scale(1.1);
  `}
`;

const TypeToggle = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surfaceHover};
  padding: 4px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

const TypeButton = styled.button<{ $isActive: boolean }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  background: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.surface : 'transparent'};
  color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.text : theme.colors.textMuted};
  box-shadow: ${({ theme, $isActive }) =>
    $isActive ? theme.shadows.sm : 'none'};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Preview = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surfaceHover}50;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px dashed ${({ theme }) => theme.colors.border};
`;

const PreviewIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ $color }) => $color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const PreviewInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const PreviewName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const PreviewType = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: capitalize;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const ErrorText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.error};
`;

const NoResults = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

export function CategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
  type = 'expense',
}: CategoryModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(category?.icon || '📦');
  const [selectedColor, setSelectedColor] = useState(category?.color || '#6366f1');
  const [selectedType, setSelectedType] = useState<'expense' | 'income'>(
    category?.type || type
  );
  const [iconSearch, setIconSearch] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      icon: category?.icon || '📦',
      color: category?.color || '#6366f1',
      type: category?.type || type,
    },
  });

  const watchName = watch('name');

  // Filter icons based on search
  const filteredIconCategories = useMemo(() => {
    if (!iconSearch.trim()) return ICON_CATEGORIES;

    const searchLower = iconSearch.toLowerCase();
    const filtered: Record<string, string[]> = {};

    Object.entries(ICON_CATEGORIES).forEach(([categoryName, icons]) => {
      if (categoryName.toLowerCase().includes(searchLower)) {
        filtered[categoryName] = icons;
      } else {
        // For emoji search, we can't really search by name, so we just show all if category matches
        // In a real app, you'd have a mapping of emoji to keywords
      }
    });

    // If search matches a category name, show those icons
    // Otherwise show all icons (can't search emoji by text content)
    if (Object.keys(filtered).length === 0) {
      return ICON_CATEGORIES;
    }

    return filtered;
  }, [iconSearch]);

  useEffect(() => {
    if (isOpen) {
      setIconSearch('');
      if (category) {
        reset({
          name: category.name,
          icon: category.icon,
          color: category.color,
          type: category.type,
        });
        setSelectedIcon(category.icon);
        setSelectedColor(category.color);
        setSelectedType(category.type);
      } else {
        reset({
          name: '',
          icon: '📦',
          color: '#6366f1',
          type: type,
        });
        setSelectedIcon('📦');
        setSelectedColor('#6366f1');
        setSelectedType(type);
      }
    }
  }, [isOpen, category, type, reset]);

  const handleIconSelect = (icon: string) => {
    setSelectedIcon(icon);
    setValue('icon', icon);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setValue('color', color);
  };

  const handleTypeSelect = (newType: 'expense' | 'income') => {
    setSelectedType(newType);
    setValue('type', newType);
  };

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true);
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Failed to save category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Edit Category' : 'Create Category'}
      size="md"
    >
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Category Name"
          placeholder="e.g., Coffee, Subscriptions"
          error={errors.name?.message}
          fullWidth
          {...register('name')}
        />

        <Section>
          <SectionLabel>Type</SectionLabel>
          <TypeToggle>
            <TypeButton
              type="button"
              $isActive={selectedType === 'expense'}
              onClick={() => handleTypeSelect('expense')}
            >
              Expense
            </TypeButton>
            <TypeButton
              type="button"
              $isActive={selectedType === 'income'}
              onClick={() => handleTypeSelect('income')}
            >
              Income
            </TypeButton>
          </TypeToggle>
        </Section>

        <Section>
          <SectionHeader>
            <SectionLabel>Icon</SectionLabel>
            <IconSearchWrapper>
              <Search size={14} />
              <input
                type="text"
                placeholder="Search category..."
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
              />
            </IconSearchWrapper>
          </SectionHeader>
          <IconScrollContainer>
            {Object.entries(filteredIconCategories).map(([categoryName, icons]) => (
              <IconCategorySection key={categoryName}>
                <IconCategoryLabel>{categoryName}</IconCategoryLabel>
                <IconGrid>
                  {icons.map((icon) => (
                    <IconButton
                      key={icon}
                      type="button"
                      $isSelected={selectedIcon === icon}
                      onClick={() => handleIconSelect(icon)}
                    >
                      {icon}
                    </IconButton>
                  ))}
                </IconGrid>
              </IconCategorySection>
            ))}
            {Object.keys(filteredIconCategories).length === 0 && (
              <NoResults>No icons found. Try a different search.</NoResults>
            )}
          </IconScrollContainer>
          {errors.icon && <ErrorText>{errors.icon.message}</ErrorText>}
        </Section>

        <Section>
          <SectionLabel>Color</SectionLabel>
          <ColorGrid>
            {CATEGORY_COLORS.map((color) => (
              <ColorButton
                key={color}
                type="button"
                $color={color}
                $isSelected={selectedColor === color}
                onClick={() => handleColorSelect(color)}
              >
                {selectedColor === color && <Check size={16} />}
              </ColorButton>
            ))}
          </ColorGrid>
          {errors.color && <ErrorText>{errors.color.message}</ErrorText>}
        </Section>

        <Section>
          <SectionLabel>Preview</SectionLabel>
          <Preview>
            <PreviewIcon $color={selectedColor}>{selectedIcon}</PreviewIcon>
            <PreviewInfo>
              <PreviewName>{watchName || 'Category Name'}</PreviewName>
              <PreviewType>{selectedType}</PreviewType>
            </PreviewInfo>
          </Preview>
        </Section>

        <ButtonGroup>
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" fullWidth isLoading={isLoading}>
            {category ? 'Save Changes' : 'Create Category'}
          </Button>
        </ButtonGroup>
      </Form>
    </Modal>
  );
}
