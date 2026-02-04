import { useCountry } from "@/components/CountrySelector";

export function useCurrency() {
  const { country } = useCountry();
  
  const formatAmount = (zarAmount: number): string => {
    const converted = zarAmount * country.currency.rate;
    return `${country.currency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatRange = (minZar: number, maxZar: number): string => {
    const minConverted = minZar * country.currency.rate;
    const maxConverted = maxZar * country.currency.rate;
    return `${country.currency.symbol}${minConverted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} - ${country.currency.symbol}${maxConverted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatRate = (zarAmount: number, period: string = "hr"): string => {
    const converted = zarAmount * country.currency.rate;
    return `${country.currency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/${period}`;
  };

  const formatRateRange = (minZar: number, maxZar: number, period: string = "hr"): string => {
    const minConverted = minZar * country.currency.rate;
    const maxConverted = maxZar * country.currency.rate;
    return `${country.currency.symbol}${minConverted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} - ${country.currency.symbol}${maxConverted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/${period}`;
  };

  return { formatAmount, formatRange, formatRate, formatRateRange, currency: country.currency };
}
