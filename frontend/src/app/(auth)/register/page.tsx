"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { RegisterFormData, registerSchema } from "@/lib/validations";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h2`
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const PasswordToggle = styled.button`
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  align-items: center;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Terms = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
  line-height: 1.5;

  a {
    color: ${({ theme }) => theme.colors.primary};

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Footer = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.lg};

  a {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.md} 0;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }

  span {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const GoogleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  padding: 0.875rem 1.5rem;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.borderDark};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  svg {
    flex-shrink: 0;
  }
`;

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password, data.fullName);

      if (error) {
        toast.error(error.message || "Failed to create account");
        return;
      }

      toast.success("Account created! Please check your email to verify.");
      router.push("/login");
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message || "Failed to sign up with Google");
        setIsGoogleLoading(false);
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <Title>Create Account</Title>
      <Subtitle>Start your journey to financial freedom</Subtitle>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          leftIcon={<User size={18} />}
          error={errors.fullName?.message}
          fullWidth
          {...register("fullName")}
        />

        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          leftIcon={<Mail size={18} />}
          error={errors.email?.message}
          fullWidth
          {...register("email")}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Create a password"
          leftIcon={<Lock size={18} />}
          rightIcon={
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </PasswordToggle>
          }
          error={errors.password?.message}
          hint="Must be at least 6 characters"
          fullWidth
          {...register("password")}
        />

        <Input
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm your password"
          leftIcon={<Lock size={18} />}
          rightIcon={
            <PasswordToggle
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </PasswordToggle>
          }
          error={errors.confirmPassword?.message}
          fullWidth
          {...register("confirmPassword")}
        />

        <Button type="submit" fullWidth isLoading={isLoading}>
          Create Account
        </Button>

        <Terms>
          By creating an account, you agree to our{" "}
          <Link href="/terms">Terms of Service</Link> and{" "}
          <Link href="/privacy">Privacy Policy</Link>
        </Terms>
      </Form>

      <Divider>
        <span>or</span>
      </Divider>

      <GoogleButton
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isLoading}
      >
        <GoogleIcon />
        {isGoogleLoading ? "Connecting..." : "Continue with Google"}
      </GoogleButton>

      <Footer>
        Already have an account? <Link href="/login">Sign in</Link>
      </Footer>
    </>
  );
}
