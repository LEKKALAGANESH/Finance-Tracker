'use client';

import {
  DollarSign,
  Euro,
  PoundSterling,
  IndianRupee,
  JapaneseYen,
  type LucideIcon
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface CurrencyIconProps {
  size?: number;
  className?: string;
}

// Map currency codes to their icons
const currencyIcons: Record<string, LucideIcon> = {
  USD: DollarSign,
  EUR: Euro,
  GBP: PoundSterling,
  INR: IndianRupee,
  JPY: JapaneseYen,
  CAD: DollarSign,
  AUD: DollarSign,
};

export function CurrencyIcon({ size = 24, className }: CurrencyIconProps) {
  const { currency } = useCurrency();
  const Icon = currencyIcons[currency.code] || DollarSign;

  return <Icon size={size} className={className} />;
}

// Export a function to get the icon component for use in StatCard etc.
export function getCurrencyIcon(currencyCode: string): LucideIcon {
  return currencyIcons[currencyCode] || DollarSign;
}
