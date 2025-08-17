import { useLocale, useTranslations } from 'next-intl';

export interface CurrencyFormatterOptions {
  currency?: 'USD' | 'PEN';
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function useCurrencyFormatter() {
  const locale = useLocale();
  const t = useTranslations('Currency');

  const formatCurrency = (
    amount: number, 
    options: CurrencyFormatterOptions = {}
  ): string => {
    const {
      currency = 'USD',
      minimumFractionDigits = 2,
      maximumFractionDigits = 2
    } = options;

    // Latin American number formatting
    const localeMap = {
      en: 'en-US',
      es: 'es-PE' // Peruvian Spanish for better PEN formatting
    };

    const numberLocale = localeMap[locale as keyof typeof localeMap] || 'en-US';

    return new Intl.NumberFormat(numberLocale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);
  };

  const formatNumber = (
    value: number,
    options: Intl.NumberFormatOptions = {}
  ): string => {
    const localeMap = {
      en: 'en-US',
      es: 'es-PE'
    };

    const numberLocale = localeMap[locale as keyof typeof localeMap] || 'en-US';

    return new Intl.NumberFormat(numberLocale, options).format(value);
  };

  const getCurrencySymbol = (currency: 'USD' | 'PEN' = 'USD'): string => {
    return t(`symbol.${currency.toLowerCase()}`);
  };

  return {
    formatCurrency,
    formatNumber,
    getCurrencySymbol
  };
}
