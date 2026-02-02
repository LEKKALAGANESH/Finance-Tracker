"use client";

import styled, { keyframes, css } from "styled-components";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import {
  TrendingUp,
  PieChart,
  Target,
  Sparkles,
  BarChart3,
  Shield,
  ArrowRight,
  Check,
  Star,
  Zap,
  LucideIcon,
} from "lucide-react";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

interface Feature {
  icon: LucideIcon;
  color: string;
  title: string;
  description: string;
}

interface Benefit {
  title: string;
  text: string;
}

interface FloatingElementProps {
  $top: string;
  $left: string;
  $delay: number;
  $reverse?: boolean;
}

interface GlowOrbProps {
  $top: string;
  $left: string;
  $color: string;
  $size: string;
}

interface FeatureIconWrapperProps {
  $color: string;
}

interface FeatureCardProps {
  $index: number;
}

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

const floatReverse = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(20px) rotate(-5deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const staggeredAnimation = (index: number, baseDelay: number = 0) => css`
  opacity: 0;
  animation: ${fadeInUp} 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: ${baseDelay + index * 0.1}s;
`;

// Layout
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background};
  overflow-x: hidden;
`;

// Header
const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.glass.background};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border}40;
  animation: ${fadeIn} 0.5s ease;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  background: ${({ theme }) => theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-decoration: none;

  svg {
    width: 32px;
    height: 32px;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: 480px) {
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

// Hero Section
const Hero = styled.section`
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 120px ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing["2xl"]};
  overflow: hidden;

  /* Animated gradient background */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme.colors.primaryLight}60 0%,
      ${({ theme }) => theme.colors.background} 40%,
      ${({ theme }) => theme.colors.background} 60%,
      ${({ theme }) => theme.colors.secondaryLight || theme.colors.primaryLight}40 100%
    );
    background-size: 200% 200%;
    animation: ${gradientMove} 15s ease infinite;
  }

  @media (max-width: 768px) {
    padding: 100px ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
    min-height: auto;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  max-width: 900px;
`;

const HeroBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.glass.background};
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  ${staggeredAnimation(0)}

  svg {
    width: 16px;
    height: 16px;
  }
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  line-height: 1.1;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: -0.03em;
  ${staggeredAnimation(1)}

  span {
    background: ${({ theme }) => theme.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const HeroSubtitle = styled.p`
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 600px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl};
  line-height: 1.7;
  ${staggeredAnimation(2)}
`;

const HeroButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing["2xl"]};
  ${staggeredAnimation(3)}

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;

    a,
    button {
      width: 100%;
    }
  }
`;

const HeroStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing["2xl"]};
  ${staggeredAnimation(4)}

  @media (max-width: 768px) {
    gap: ${({ theme }) => theme.spacing.lg};
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize["2xl"]};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
  }
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

// Floating decorative elements
const FloatingElement = styled.div<{
  $top: string;
  $left: string;
  $delay: number;
  $reverse?: boolean;
}>`
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  width: 60px;
  height: 60px;
  background: ${({ theme }) => theme.gradients.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  opacity: 0.1;
  animation: ${({ $reverse }) => ($reverse ? floatReverse : float)} 6s ease-in-out
    infinite;
  animation-delay: ${({ $delay }) => $delay}s;
  z-index: 1;

  @media (max-width: 768px) {
    display: none;
  }
`;

const GlowOrb = styled.div<{
  $top: string;
  $left: string;
  $color: string;
  $size: string;
}>`
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  background: ${({ $color }) => $color};
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: ${pulse} 8s ease-in-out infinite;
  z-index: 0;
  pointer-events: none;
`;

// Features Section
const Features = styled.section`
  position: relative;
  padding: ${({ theme }) => theme.spacing["2xl"]} ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  max-width: 700px;
  margin: 0 auto ${({ theme }) => theme.spacing["2xl"]};
`;

const SectionLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.primary};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  letter-spacing: -0.02em;
`;

const SectionDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.7;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div<{ $index: number }>`
  position: relative;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  /* Gradient accent on top */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ theme }) => theme.gradients.primary};
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: ${({ theme }) => theme.shadows.xl};
    border-color: ${({ theme }) => theme.colors.primary}30;

    &::before {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover {
      transform: none;
    }
  }
`;

const FeatureIconWrapper = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ $color }) => $color}15;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  transition: all 0.3s ease;

  svg {
    width: 28px;
    height: 28px;
    color: ${({ $color }) => $color};
  }

  ${FeatureCard}:hover & {
    transform: scale(1.1) rotate(-5deg);
    background: ${({ $color }) => $color}25;
  }
`;

const FeatureTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const FeatureDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  line-height: 1.6;
`;

// Benefits Section
const Benefits = styled.section`
  padding: ${({ theme }) => theme.spacing["2xl"]} ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.background};

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  }
`;

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.xl};
  max-width: 1000px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.success}40;
    box-shadow: 0 4px 20px ${({ theme }) => theme.colors.success}10;
  }
`;

const BenefitIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => theme.colors.success}15;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.colors.success};
  }
`;

const BenefitContent = styled.div``;

const BenefitTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const BenefitText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

// CTA Section
const CTA = styled.section`
  position: relative;
  padding: ${({ theme }) => theme.spacing["2xl"]} ${({ theme }) => theme.spacing.xl};
  text-align: center;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: ${({ theme }) => theme.gradients.primary};
    opacity: 0.05;
  }

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  }
`;

const CTAContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 600px;
  margin: 0 auto;
`;

const CTATitle = styled.h2`
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CTADescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

// Footer
const Footer = styled.footer`
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
    text-align: center;
  }
`;

const FooterLogo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const FooterLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FooterLink = styled(Link)`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const FooterCopyright = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

// Features data
const features: Feature[] = [
  {
    icon: TrendingUp,
    color: "#6366f1",
    title: "Expense Tracking",
    description:
      "Log and categorize expenses instantly. Get detailed breakdowns of where your money goes each month.",
  },
  {
    icon: PieChart,
    color: "#8b5cf6",
    title: "Budget Management",
    description:
      "Set smart budgets for categories. Get real-time alerts when approaching limits.",
  },
  {
    icon: Target,
    color: "#10b981",
    title: "Savings Goals",
    description:
      "Create and track savings goals with visual progress. Celebrate milestones along the way.",
  },
  {
    icon: Sparkles,
    color: "#f59e0b",
    title: "AI Insights",
    description:
      "Get personalized spending analysis and smart recommendations powered by AI.",
  },
  {
    icon: BarChart3,
    color: "#3b82f6",
    title: "Reports & Analytics",
    description:
      "Beautiful visualizations and exportable reports to understand your financial health.",
  },
  {
    icon: Shield,
    color: "#ef4444",
    title: "Secure & Private",
    description:
      "Bank-level encryption keeps your data safe. We never share your information.",
  },
];

const benefits: Benefit[] = [
  {
    title: "Free Forever",
    text: "Core features are free. No hidden fees or surprise charges.",
  },
  {
    title: "Works Offline",
    text: "Track expenses anytime, even without internet connection.",
  },
  {
    title: "Multi-Currency",
    text: "Support for 150+ currencies with real-time conversion.",
  },
  {
    title: "Data Export",
    text: "Export your data anytime in CSV, PDF, or JSON format.",
  },
];

export default function HomePage() {
  const { user, isLoading } = useAuth();

  return (
    <Container>
      <Header>
        <Logo href="/">
          <TrendingUp />
          FinanceTracker
        </Logo>
        <Nav>
          {!isLoading && (
            <>
              {user ? (
                <Link href="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </>
              )}
            </>
          )}
        </Nav>
      </Header>

      <Hero>
        {/* Decorative elements */}
        <GlowOrb $top="10%" $left="10%" $color="#6366f1" $size="400px" />
        <GlowOrb $top="60%" $left="70%" $color="#8b5cf6" $size="300px" />
        <FloatingElement $top="15%" $left="5%" $delay={0} />
        <FloatingElement $top="70%" $left="10%" $delay={1} $reverse />
        <FloatingElement $top="20%" $left="85%" $delay={0.5} />
        <FloatingElement $top="65%" $left="90%" $delay={1.5} $reverse />

        <HeroContent>
          <HeroBadge>
            <Zap /> New: AI-Powered Insights Now Available
          </HeroBadge>

          <HeroTitle>
            Take Control of Your <span>Financial Future</span>
          </HeroTitle>

          <HeroSubtitle>
            Track expenses, set budgets, achieve goals, and get AI-powered
            insights to make smarter financial decisions. Join thousands who&apos;ve
            transformed their finances.
          </HeroSubtitle>

          <HeroButtons>
            <Link href={user ? "/dashboard" : "/register"}>
              <Button size="lg" rightIcon={<ArrowRight size={20} />}>
                {user ? "Go to Dashboard" : "Start Free Today"}
              </Button>
            </Link>
            {!user && (
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            )}
          </HeroButtons>

          <HeroStats>
            <StatItem>
              <StatValue>50K+</StatValue>
              <StatLabel>Active Users</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>$2M+</StatValue>
              <StatLabel>Money Tracked</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>4.9</StatValue>
              <StatLabel>App Rating</StatLabel>
            </StatItem>
          </HeroStats>
        </HeroContent>
      </Hero>

      <Features>
        <SectionHeader>
          <SectionLabel>
            <Star size={16} /> Features
          </SectionLabel>
          <SectionTitle>Everything you need to manage your money</SectionTitle>
          <SectionDescription>
            Powerful tools designed to help you understand, track, and optimize
            your spending habits.
          </SectionDescription>
        </SectionHeader>

        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} $index={index}>
              <FeatureIconWrapper $color={feature.color}>
                <feature.icon />
              </FeatureIconWrapper>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </Features>

      <Benefits>
        <SectionHeader>
          <SectionLabel>
            <Check size={16} /> Benefits
          </SectionLabel>
          <SectionTitle>Why choose FinanceTracker?</SectionTitle>
          <SectionDescription>
            Built with your privacy and convenience in mind.
          </SectionDescription>
        </SectionHeader>

        <BenefitsGrid>
          {benefits.map((benefit) => (
            <BenefitItem key={benefit.title}>
              <BenefitIcon>
                <Check />
              </BenefitIcon>
              <BenefitContent>
                <BenefitTitle>{benefit.title}</BenefitTitle>
                <BenefitText>{benefit.text}</BenefitText>
              </BenefitContent>
            </BenefitItem>
          ))}
        </BenefitsGrid>
      </Benefits>

      <CTA>
        <CTAContent>
          <CTATitle>Ready to transform your finances?</CTATitle>
          <CTADescription>
            Join thousands of users who have taken control of their financial
            future with FinanceTracker.
          </CTADescription>
          <Link href={user ? "/dashboard" : "/register"}>
            <Button size="lg" rightIcon={<ArrowRight size={20} />}>
              {user ? "Go to Dashboard" : "Get Started for Free"}
            </Button>
          </Link>
        </CTAContent>
      </CTA>

      <Footer>
        <FooterContent>
          <FooterLogo>
            <TrendingUp size={24} />
            FinanceTracker
          </FooterLogo>
          <FooterLinks>
            <FooterLink href="/login">Login</FooterLink>
            <FooterLink href="/register">Sign Up</FooterLink>
          </FooterLinks>
          <FooterCopyright>
            &copy; {new Date().getFullYear()} FinanceTracker. All rights
            reserved.
          </FooterCopyright>
        </FooterContent>
      </Footer>
    </Container>
  );
}
