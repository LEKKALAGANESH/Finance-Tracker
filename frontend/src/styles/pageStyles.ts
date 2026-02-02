import styled, { keyframes, css } from 'styled-components';

// ============================================
// ANIMATION KEYFRAMES
// ============================================

export const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

export const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

export const progressFill = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`;

// ============================================
// STAGGERED ANIMATION HELPER
// ============================================

export const staggeredAnimation = (index: number, baseDelay: number = 0) => css`
  opacity: 0;
  animation: ${fadeInUp} 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: ${baseDelay + index * 0.08}s;
`;

// ============================================
// PAGE WRAPPER WITH BACKGROUND EFFECTS
// ============================================

export const PageWrapper = styled.div`
  position: relative;
  min-height: 100%;

  /* Gradient orbs for visual depth */
  &::before {
    content: '';
    position: fixed;
    top: -15%;
    right: -8%;
    width: 500px;
    height: 500px;
    background: radial-gradient(
      circle,
      ${({ theme }) => theme.colors.primary}08 0%,
      transparent 70%
    );
    pointer-events: none;
    z-index: 0;

    @media (max-width: 768px) {
      width: 300px;
      height: 300px;
      top: -10%;
      right: -15%;
    }
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
      ${({ theme }) => theme.colors.secondary}06 0%,
      transparent 70%
    );
    pointer-events: none;
    z-index: 0;

    @media (max-width: 768px) {
      width: 250px;
      height: 250px;
    }
  }
`;

export const PageContent = styled.div`
  position: relative;
  z-index: 1;
`;

// ============================================
// PAGE HEADER
// ============================================

export const PageHeader = styled.div<{ $animated?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  ${({ $animated }) => $animated && staggeredAnimation(0)}

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;

    a, button {
      width: 100%;
    }
  }
`;

export const PageTitle = styled.div`
  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};

    @media (max-width: 480px) {
      font-size: ${({ theme }) => theme.typography.fontSize.xl};
    }
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-top: ${({ theme }) => theme.spacing.xs};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
`;

export const PageTitleIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.gradients.primary};
  color: white;
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
  }
`;

// ============================================
// FILTER BAR
// ============================================

export const FilterBar = styled.div<{ $animated?: boolean; $delay?: number }>`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
  flex-wrap: wrap;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.glass.background};
  backdrop-filter: ${({ theme }) => theme.glass.blur};
  -webkit-backdrop-filter: ${({ theme }) => theme.glass.blur};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  ${({ $animated, $delay }) => $animated && staggeredAnimation($delay || 1)}

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
    border-color: ${({ theme }) => theme.colors.borderDark};
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

export const FilterLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius.md};

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 640px) {
    justify-content: center;
  }
`;

// ============================================
// CONTENT CARDS WITH CONSISTENT STYLING
// ============================================

export const ContentCard = styled.div<{ $animated?: boolean; $delay?: number }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
  position: relative;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  ${({ $animated, $delay }) => $animated && staggeredAnimation($delay || 0)}

  /* Gradient accent at top */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ theme }) => theme.gradients.primary};
    opacity: 0.7;
  }

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.lg};
    transform: translateY(-2px);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover {
      transform: none;
    }
  }
`;

export const ContentCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.glass.background};

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};

    svg {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

export const ContentCardBody = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

// ============================================
// STATS GRID
// ============================================

export const StatsGrid = styled.div<{ $animated?: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  /* Staggered animation for children */
  ${({ $animated }) => $animated && css`
    & > *:nth-child(1) { ${staggeredAnimation(2)} }
    & > *:nth-child(2) { ${staggeredAnimation(3)} }
    & > *:nth-child(3) { ${staggeredAnimation(4)} }
    & > *:nth-child(4) { ${staggeredAnimation(5)} }
    & > *:nth-child(5) { ${staggeredAnimation(6)} }
    & > *:nth-child(6) { ${staggeredAnimation(7)} }
  `}

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

// ============================================
// STAT CARD (Mini version for reports/etc)
// ============================================

export const MiniStatCard = styled.div<{ $color?: string }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);

  /* Gradient accent at top */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ $color, theme }) => $color || theme.colors.primary};
    opacity: 0.8;
  }

  /* Subtle background accent */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: radial-gradient(
      circle,
      ${({ $color, theme }) => ($color || theme.colors.primary)}10 0%,
      transparent 70%
    );
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
    border-color: ${({ $color, theme }) => ($color || theme.colors.primary)}30;
  }

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    position: relative;
    z-index: 1;
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};
    position: relative;
    z-index: 1;
  }

  span {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    position: relative;
    z-index: 1;
  }

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.md};

    p {
      font-size: ${({ theme }) => theme.typography.fontSize.xl};
    }
  }
`;

// ============================================
// DATA TABLE STYLING
// ============================================

export const DataTable = styled.div<{ $animated?: boolean; $delay?: number }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
  position: relative;
  ${({ $animated, $delay }) => $animated && staggeredAnimation($delay || 0)}

  /* Gradient accent at top */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ theme }) => theme.gradients.primary};
    opacity: 0.5;
  }
`;

export const DataTableHeader = styled.div`
  display: grid;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.glass.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.03em;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const DataTableRow = styled.div<{ $index?: number }>`
  display: grid;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  align-items: center;
  transition: all 0.2s ease;
  position: relative;
  opacity: 0;
  animation: ${fadeInUp} 0.4s ease forwards;
  animation-delay: ${({ $index }) => ($index || 0) * 0.05}s;

  &:last-child {
    border-bottom: none;
  }

  /* Hover highlight */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: ${({ theme }) => theme.colors.primary};
    transform: scaleY(0);
    transition: transform 0.2s ease;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};

    &::before {
      transform: scaleY(1);
    }
  }
`;

// ============================================
// EMPTY STATE
// ============================================

export const EmptyState = styled.div<{ $animated?: boolean; $delay?: number }>`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['2xl']};
  background: ${({ theme }) => theme.colors.surface};
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
  ${({ $animated, $delay }) => $animated && staggeredAnimation($delay || 0)}

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  p {
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
  }
`;

export const EmptyStateIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.gradients.primary};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  svg {
    width: 40px;
    height: 40px;
  }
`;

// ============================================
// GRID LAYOUTS
// ============================================

export const TwoColumnGrid = styled.div<{ $animated?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};

  ${({ $animated }) => $animated && css`
    & > *:nth-child(1) { ${staggeredAnimation(6)} }
    & > *:nth-child(2) { ${staggeredAnimation(7)} }
  `}

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const CardsGrid = styled.div<{ $animated?: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 380px) {
    grid-template-columns: 1fr;
  }
`;

// ============================================
// ACTION BUTTON GROUPS
// ============================================

export const QuickActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: 480px) {
    width: 100%;
    flex-direction: column;

    a, button {
      width: 100%;
    }
  }
`;

// ============================================
// ICON BUTTON
// ============================================

export const IconButton = styled.button<{ $danger?: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ theme, $danger }) =>
      $danger ? theme.colors.errorLight : theme.colors.surfaceHover};
    color: ${({ theme, $danger }) =>
      $danger ? theme.colors.error : theme.colors.text};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

// ============================================
// CATEGORY/ITEM ICON
// ============================================

export const ItemIcon = styled.div<{ $color: string; $size?: 'sm' | 'md' | 'lg' }>`
  width: ${({ $size }) => $size === 'lg' ? '56px' : $size === 'sm' ? '36px' : '44px'};
  height: ${({ $size }) => $size === 'lg' ? '56px' : $size === 'sm' ? '36px' : '44px'};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: linear-gradient(
    135deg,
    ${({ $color }) => `${$color}20`} 0%,
    ${({ $color }) => `${$color}10`} 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $size }) => $size === 'lg' ? '1.75rem' : $size === 'sm' ? '1rem' : '1.25rem'};
  flex-shrink: 0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px ${({ $color }) => `${$color}15`};
`;

// ============================================
// PROGRESS BAR
// ============================================

export const ProgressBar = styled.div`
  height: 10px;
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.inset};
`;

export const ProgressFill = styled.div<{ $percentage: number; $color: string; $animate?: boolean }>`
  height: 100%;
  width: ${({ $percentage }) => Math.min($percentage, 100)}%;
  background: linear-gradient(
    90deg,
    ${({ $color }) => $color} 0%,
    ${({ $color }) => $color}dd 100%
  );
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transform-origin: left;
  ${({ $animate }) => $animate && css`
    animation: ${progressFill} 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  `}
  transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  overflow: hidden;

  /* Shimmer effect */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
    animation: ${shimmer} 2s infinite;
  }
`;

// ============================================
// SUMMARY BAR
// ============================================

export const SummaryBar = styled.div<{ $animated?: boolean; $delay?: number }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.glass.background};
  backdrop-filter: ${({ theme }) => theme.glass.blur};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  ${({ $animated, $delay }) => $animated && staggeredAnimation($delay || 0)}

  @media (max-width: 480px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
    text-align: center;
  }
`;

export const SummaryLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const SummaryValue = styled.span<{ $variant?: 'success' | 'error' | 'warning' | 'default' }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme, $variant }) => {
    switch ($variant) {
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.error;
      case 'warning': return theme.colors.warning;
      default: return theme.colors.text;
    }
  }};
`;
