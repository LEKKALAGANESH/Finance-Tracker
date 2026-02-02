'use client';

import { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Plus, Trash2, Edit, Target, CheckCircle, PiggyBank, Clock } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';
import { getSupabaseClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Loader } from '@/components/ui/Loader';
import { GOAL_ICONS } from '@/lib/constants';

// Animation keyframes
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const staggeredAnimation = (index: number) => css`
  opacity: 0;
  animation: ${fadeInUp} 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: ${index * 0.08}s;
`;

// Page wrapper with background effects
const PageWrapper = styled.div`
  position: relative;
  min-height: 100%;

  &::before {
    content: '';
    position: fixed;
    top: -15%;
    right: -8%;
    width: 500px;
    height: 500px;
    background: radial-gradient(
      circle,
      ${({ theme }) => theme.colors.success}08 0%,
      transparent 70%
    );
    pointer-events: none;
    z-index: 0;
  }

  &::after {
    content: '';
    position: fixed;
    bottom: -10%;
    left: -5%;
    width: 400px;
    height: 400px;
    background: radial-gradient(
      circle,
      ${({ theme }) => theme.colors.primary}06 0%,
      transparent 70%
    );
    pointer-events: none;
    z-index: 0;
  }
`;

const PageContent = styled.div`
  position: relative;
  z-index: 1;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  ${staggeredAnimation(0)}

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;

    button {
      width: 100%;
    }
  }
`;

const PageTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};

    @media (max-width: 480px) {
      font-size: ${({ theme }) => theme.typography.fontSize.xl};
    }
  }
`;

const PageTitleIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.success} 0%, ${({ theme }) => theme.colors.primary} 100%);
  color: white;
  flex-shrink: 0;
`;

const GoalsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 380px) {
    grid-template-columns: 1fr;
  }
`;

const GoalCard = styled(Card)<{ $isCompleted: boolean; $index?: number }>`
  position: relative;
  opacity: 0;
  animation: ${fadeInUp} 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: ${({ $index }) => 0.1 + ($index || 0) * 0.1}s;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);

  ${({ $isCompleted }) => $isCompleted && css`
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: ${({ theme }) => theme.colors.success}05;
      pointer-events: none;
      border-radius: inherit;
    }
  `}

  &:hover {
    transform: translateY(-4px);
  }
`;

const CompletedBadge = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${({ theme }) => theme.colors.successLight};
  color: ${({ theme }) => theme.colors.success};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const GoalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const GoalInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const GoalIcon = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  background: linear-gradient(
    135deg,
    ${({ $color }) => `${$color}20`} 0%,
    ${({ $color }) => `${$color}10`} 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  box-shadow: 0 4px 12px ${({ $color }) => `${$color}15`};
  transition: all 0.3s ease;

  ${GoalCard}:hover & {
    transform: scale(1.1) rotate(5deg);
  }
`;

const GoalDetails = styled.div`
  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 4px;
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const IconButton = styled.button`
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text};
  }

  &.danger:hover {
    background: ${({ theme }) => theme.colors.errorLight};
    color: ${({ theme }) => theme.colors.error};
  }
`;

const AmountSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const CurrentAmount = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const TargetAmount = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ProgressBar = styled.div`
  height: 10px;
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${({ $percentage }) => Math.min($percentage, 100)}%;
  background: ${({ $color }) => `linear-gradient(90deg, ${$color}, ${$color}dd)`};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const ContributeButton = styled(Button)`
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: ${({ theme }) => theme.spacing['2xl']};
  background: ${({ theme }) => theme.colors.surface};
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  color: ${({ theme }) => theme.colors.textSecondary};

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
    margin-top: ${({ theme }) => theme.spacing.md};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  p {
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const EmptyStateIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto;
  background: ${({ theme }) => `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.secondary}20)`};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
`;

const ProgressStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ProgressPercentage = styled.span<{ $color: string }>`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ $color }) => $color};
`;

const DaysRemaining = styled.div<{ $urgent?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  margin-top: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme, $urgent }) =>
    $urgent ? `${theme.colors.warning}15` : `${theme.colors.info}15`};
  color: ${({ theme, $urgent }) =>
    $urgent ? theme.colors.warning : theme.colors.info};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const RemainingAmount = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const ModalForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: 480px) {
    grid-template-columns: repeat(6, 1fr);
  }

  @media (max-width: 380px) {
    grid-template-columns: repeat(5, 1fr);
  }
`;

const IconOption = styled.button<{ $isSelected: boolean }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 2px solid ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.primary : 'transparent'};
  background: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.primaryLight : theme.colors.surfaceHover};
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const ColorGrid = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const ColorOption = styled.button<{ $color: string; $isSelected: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ $color }) => $color};
  border: 3px solid ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.text : 'transparent'};
  transition: transform 0.15s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4'];

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  icon: string;
  color: string;
  status: string;
}

export default function GoalsPage() {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');

  // Default deadline to 1 year from now
  const getDefaultDeadline = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    deadline: getDefaultDeadline(),
    icon: '🎯',
    color: '#6366f1',
  });

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;

    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setGoals(data || []);
    setIsLoading(false);
  };

  const openModal = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        name: goal.name,
        target_amount: goal.target_amount.toString(),
        deadline: goal.deadline,
        icon: goal.icon,
        color: goal.color,
      });
    } else {
      setEditingGoal(null);
      setFormData({
        name: '',
        target_amount: '',
        deadline: getDefaultDeadline(),
        icon: '🎯',
        color: '#6366f1',
      });
    }
    setModalOpen(true);
  };

  const openContributeModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setContributionAmount('');
    setContributeModalOpen(true);
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('You must be logged in to create a goal');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Please enter a goal name');
      return;
    }

    if (!formData.target_amount || parseFloat(formData.target_amount) <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }

    if (!formData.deadline) {
      toast.error('Please select a target date');
      return;
    }

    setIsSaving(true);
    const supabase = getSupabaseClient();

    const goalData = {
      user_id: user.id,
      name: formData.name.trim(),
      target_amount: parseFloat(formData.target_amount),
      deadline: formData.deadline,
      icon: formData.icon,
      color: formData.color,
    };

    if (editingGoal) {
      const { error } = await supabase
        .from('goals')
        .update(goalData)
        .eq('id', editingGoal.id);

      if (error) {
        console.error('Error updating goal:', error);
        toast.error(`Failed to update goal: ${error.message}`);
      } else {
        toast.success('Goal updated successfully');
        setModalOpen(false);
        fetchGoals();
      }
    } else {
      const { error } = await supabase.from('goals').insert({
        ...goalData,
        current_amount: 0,
        status: 'active',
      });

      if (error) {
        console.error('Error creating goal:', error);
        toast.error(`Failed to create goal: ${error.message}`);
      } else {
        toast.success('Goal created successfully');
        setModalOpen(false);
        fetchGoals();
      }
    }

    setIsSaving(false);
  };

  const handleContribute = async () => {
    if (!selectedGoal || !contributionAmount || !user) return;

    const amount = parseFloat(contributionAmount);
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSaving(true);
    const supabase = getSupabaseClient();

    const newAmount = selectedGoal.current_amount + amount;
    const isCompleted = newAmount >= selectedGoal.target_amount;

    // Insert contribution record first
    const { error: contributionError } = await supabase
      .from('goal_contributions')
      .insert({
        user_id: user.id,
        goal_id: selectedGoal.id,
        amount: amount,
        note: `Contribution to ${selectedGoal.name}`,
        date: new Date().toISOString().split('T')[0],
      });

    if (contributionError) {
      console.error('Error adding contribution:', contributionError);
      toast.error(`Failed to add contribution: ${contributionError.message}`);
      setIsSaving(false);
      return;
    }

    // Update goal's current amount
    const { error: updateError } = await supabase
      .from('goals')
      .update({
        current_amount: newAmount,
        status: isCompleted ? 'completed' : 'active',
      })
      .eq('id', selectedGoal.id);

    if (updateError) {
      console.error('Error updating goal:', updateError);
      toast.error(`Failed to update goal: ${updateError.message}`);
    } else {
      if (isCompleted) {
        toast.success('Congratulations! Goal completed! 🎉');
      } else {
        toast.success('Contribution added successfully');
      }
      setContributeModalOpen(false);
      fetchGoals();
    }

    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('goals').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete goal');
    } else {
      toast.success('Goal deleted successfully');
      fetchGoals();
    }
  };

  if (isLoading) {
    return <Loader fullScreen text="Loading goals..." />;
  }

  return (
    <PageWrapper>
      <PageContent>
      <PageHeader>
        <PageTitle>
          <PageTitleIcon><Target size={20} /></PageTitleIcon>
          <h1>Savings Goals</h1>
        </PageTitle>
        <Button leftIcon={<Plus size={18} />} onClick={() => openModal()}>
          Create Goal
        </Button>
      </PageHeader>

      <GoalsGrid>
        {goals.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>
              <Target size={40} strokeWidth={1.5} />
            </EmptyStateIcon>
            <h3>Start Your Savings Journey</h3>
            <p>Set your first savings goal and track your progress towards financial freedom.</p>
            <Button leftIcon={<Plus size={18} />} onClick={() => openModal()}>
              Create Your First Goal
            </Button>
          </EmptyState>
        ) : (
          goals.map((goal, index) => {
            const percentage = (goal.current_amount / goal.target_amount) * 100;
            const isCompleted = goal.status === 'completed';
            const remaining = goal.target_amount - goal.current_amount;
            const daysUntilDeadline = Math.ceil(
              (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            const isUrgent = daysUntilDeadline <= 30 && daysUntilDeadline > 0;

            return (
              <GoalCard key={goal.id} $isCompleted={isCompleted} $index={index}>
                {isCompleted && (
                  <CompletedBadge>
                    <CheckCircle size={12} /> Completed
                  </CompletedBadge>
                )}
                <CardBody>
                  <GoalHeader>
                    <GoalInfo>
                      <GoalIcon $color={goal.color}>{goal.icon}</GoalIcon>
                      <GoalDetails>
                        <h3>{goal.name}</h3>
                        <p>Due: {formatDate(goal.deadline)}</p>
                      </GoalDetails>
                    </GoalInfo>
                    <Actions>
                      <IconButton onClick={() => openModal(goal)} aria-label="Edit goal">
                        <Edit size={18} />
                      </IconButton>
                      <IconButton className="danger" onClick={() => handleDelete(goal.id)} aria-label="Delete goal">
                        <Trash2 size={18} />
                      </IconButton>
                    </Actions>
                  </GoalHeader>

                  <AmountSection>
                    <CurrentAmount>{formatCurrency(goal.current_amount)}</CurrentAmount>
                    <TargetAmount>of {formatCurrency(goal.target_amount)}</TargetAmount>
                  </AmountSection>

                  <ProgressStats>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Progress</span>
                    <ProgressPercentage $color={goal.color}>
                      {percentage.toFixed(0)}%
                    </ProgressPercentage>
                  </ProgressStats>

                  <ProgressBar>
                    <ProgressFill $percentage={percentage} $color={goal.color} />
                  </ProgressBar>

                  {!isCompleted && remaining > 0 && (
                    <RemainingAmount>
                      {formatCurrency(remaining)} left to save
                    </RemainingAmount>
                  )}

                  {!isCompleted && daysUntilDeadline > 0 && (
                    <DaysRemaining $urgent={isUrgent}>
                      <Clock size={12} />
                      {daysUntilDeadline} days remaining
                    </DaysRemaining>
                  )}

                  {!isCompleted && daysUntilDeadline <= 0 && (
                    <DaysRemaining $urgent>
                      <Clock size={12} />
                      Deadline passed
                    </DaysRemaining>
                  )}

                  {!isCompleted && (
                    <ContributeButton
                      variant="outline"
                      leftIcon={<PiggyBank size={18} />}
                      onClick={() => openContributeModal(goal)}
                    >
                      Add Contribution
                    </ContributeButton>
                  )}
                </CardBody>
              </GoalCard>
            );
          })
        )}
      </GoalsGrid>

      {/* Create/Edit Goal Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingGoal ? 'Edit Goal' : 'Create Goal'}
      >
        <ModalForm>
          <Input
            label="Goal Name"
            placeholder="e.g., Emergency Fund"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
          />
          <Input
            label="Target Amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.target_amount}
            onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
            fullWidth
          />
          <Input
            label="Target Date"
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            fullWidth
          />
          <div>
            <Label>Icon</Label>
            <IconGrid>
              {GOAL_ICONS.map((icon) => (
                <IconOption
                  key={icon}
                  $isSelected={formData.icon === icon}
                  onClick={() => setFormData({ ...formData, icon })}
                >
                  {icon}
                </IconOption>
              ))}
            </IconGrid>
          </div>
          <div>
            <Label>Color</Label>
            <ColorGrid>
              {COLORS.map((color) => (
                <ColorOption
                  key={color}
                  $color={color}
                  $isSelected={formData.color === color}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </ColorGrid>
          </div>
          <ModalActions>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={isSaving}>
              {editingGoal ? 'Save Changes' : 'Create Goal'}
            </Button>
          </ModalActions>
        </ModalForm>
      </Modal>

      {/* Contribute Modal */}
      <Modal
        isOpen={contributeModalOpen}
        onClose={() => setContributeModalOpen(false)}
        title="Add Contribution"
        size="sm"
      >
        <ModalForm>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            How much do you want to add to &quot;{selectedGoal?.name}&quot;?
          </p>
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={contributionAmount}
            onChange={(e) => setContributionAmount(e.target.value)}
            fullWidth
          />
          <ModalActions>
            <Button variant="ghost" onClick={() => setContributeModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleContribute} isLoading={isSaving}>
              Add Contribution
            </Button>
          </ModalActions>
        </ModalForm>
      </Modal>
      </PageContent>
    </PageWrapper>
  );
}
