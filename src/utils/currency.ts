import type { Currency } from '@/types';

export const CURRENCIES: Currency[] = ['USD', 'ILS', 'EUR'];

const SYMBOLS: Record<Currency, string> = {
  USD: '$',
  ILS: '₪',
  EUR: '€',
};

export function getCurrencySymbol(currency: Currency = 'ILS'): string {
  return SYMBOLS[currency] ?? '₪';
}

export function formatPrice(price: number, currency: Currency = 'ILS'): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${price.toFixed(2)}`;
}
