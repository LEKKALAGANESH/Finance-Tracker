'use client';

import styled, { keyframes } from 'styled-components';
import { useNavigation } from '@/context/NavigationContext';

// Smooth indeterminate flow - never repeats abruptly
const indeterminateFlow = keyframes`
  0% {
    left: -40%;
    width: 40%;
  }
  50% {
    left: 20%;
    width: 60%;
  }
  100% {
    left: 100%;
    width: 40%;
  }
`;

// Secondary bar for premium layered effect
const indeterminateFlowSecondary = keyframes`
  0% {
    left: -60%;
    width: 60%;
  }
  50% {
    left: 30%;
    width: 40%;
  }
  100% {
    left: 100%;
    width: 60%;
  }
`;

// Subtle glow pulse
const glowPulse = keyframes`
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
`;

// Gradient color shift for premium feel
const colorShift = keyframes`
  0% {
    filter: hue-rotate(0deg);
  }
  50% {
    filter: hue-rotate(20deg);
  }
  100% {
    filter: hue-rotate(0deg);
  }
`;

const LoaderContainer = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 9999;
  pointer-events: none;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  visibility: ${({ $isVisible }) => ($isVisible ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  background: ${({ theme }) => theme.colors.border}30;
  overflow: hidden;
`;

// Primary flowing bar
const FlowingBar = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    ${({ theme }) => theme.colors.primary} 20%,
    ${({ theme }) => theme.colors.secondary} 50%,
    ${({ theme }) => theme.colors.primary} 80%,
    transparent 100%
  );
  border-radius: 2px;
  animation:
    ${indeterminateFlow} 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite,
    ${colorShift} 4s ease-in-out infinite;
  box-shadow:
    0 0 10px ${({ theme }) => theme.colors.primary}60,
    0 0 20px ${({ theme }) => theme.colors.primary}30;
`;

// Secondary flowing bar for layered premium effect
const FlowingBarSecondary = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    ${({ theme }) => theme.colors.secondary}80 30%,
    ${({ theme }) => theme.colors.primary}80 70%,
    transparent 100%
  );
  border-radius: 2px;
  animation: ${indeterminateFlowSecondary} 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  animation-delay: 0.6s;
  opacity: 0.7;
`;

// Glow effect layer
const GlowLayer = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.primary}12 0%,
    ${({ theme }) => theme.colors.primary}05 30%,
    transparent 100%
  );
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transition: opacity 0.4s ease;
  pointer-events: none;
  z-index: 9998;
  animation: ${({ $isVisible }) => ($isVisible ? glowPulse : 'none')} 2s ease-in-out infinite;
`;

// Premium content overlay with blur effect
const ContentOverlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.colors.background}40;
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(1px);
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  visibility: ${({ $isVisible }) => ($isVisible ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  pointer-events: none;
  z-index: 9997;
`;

// Loading status indicator
const LoadingIndicator = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: ${({ theme }) => theme.glass.backgroundStrong};
  backdrop-filter: ${({ theme }) => theme.glass.blurStrong};
  -webkit-backdrop-filter: ${({ theme }) => theme.glass.blurStrong};
  border: 1px solid ${({ theme }) => theme.colors.border}60;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  visibility: ${({ $isVisible }) => ($isVisible ? 'visible' : 'hidden')};
  transform: ${({ $isVisible }) => ($isVisible ? 'translateY(0)' : 'translateY(-10px)')};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10000;

  @media (max-width: 768px) {
    top: auto;
    bottom: 80px;
    right: 50%;
    transform: ${({ $isVisible }) => ($isVisible ? 'translateX(50%)' : 'translateX(50%) translateY(10px)')};
  }
`;

const spinAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spinAnimation} 0.8s linear infinite;
`;

const LoadingText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
`;

export function PageTransitionLoader() {
  const { isNavigating } = useNavigation();

  return (
    <>
      <LoaderContainer $isVisible={isNavigating}>
        <FlowingBarSecondary />
        <FlowingBar />
      </LoaderContainer>
      <GlowLayer $isVisible={isNavigating} />
      <ContentOverlay $isVisible={isNavigating} />
      <LoadingIndicator $isVisible={isNavigating}>
        <Spinner />
        <LoadingText>Loading...</LoadingText>
      </LoadingIndicator>
    </>
  );
}
