import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export const currencies = [
  { code: "ZAR", symbol: "R", name: "South African Rand", rate: 1 },
  { code: "USD", symbol: "$", name: "US Dollar", rate: 0.053 },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.049 },
  { code: "GBP", symbol: "£", name: "British Pound", rate: 0.042 },
  { code: "BWP", symbol: "P", name: "Botswana Pula", rate: 0.72 },
  { code: "NAD", symbol: "N$", name: "Namibian Dollar", rate: 1 },
];

export type Currency = typeof currencies[number];

export function useCurrency() {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("preferredCurrency");
      if (saved) {
        const found = currencies.find(c => c.code === saved);
        if (found) return found;
      }
    }
    return currencies[0];
  });

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem("preferredCurrency", curr.code);
  };

  const formatPrice = (amountInCents: number) => {
    const zarAmount = amountInCents / 100;
    const converted = zarAmount * currency.rate;
    return `${currency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return { currency, setCurrency, formatPrice, currencies };
}

export function CurrencySelector({ 
  variant = "default" 
}: { 
  variant?: "default" | "minimal" 
}) {
  const { currency, setCurrency, currencies } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 text-sm font-medium"
          data-testid="button-currency-selector"
        >
          {currency.symbol} {currency.code}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {currencies.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onClick={() => setCurrency(curr)}
            className={currency.code === curr.code ? "bg-accent/10" : ""}
            data-testid={`option-currency-${curr.code}`}
          >
            <span className="w-8 font-medium">{curr.symbol}</span>
            <span>{curr.code}</span>
            <span className="ml-auto text-xs text-muted-foreground">{curr.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
