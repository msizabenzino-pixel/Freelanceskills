import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MapPin, Globe } from "lucide-react";

export const countries = [
  { 
    code: "ZA", 
    name: "South Africa", 
    currency: { code: "ZAR", symbol: "R", rate: 1 },
    cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein"],
    mapCenter: { lat: -30.5595, lng: 22.9375 },
    flag: "🇿🇦"
  },
  { 
    code: "BW", 
    name: "Botswana", 
    currency: { code: "BWP", symbol: "P", rate: 0.72 },
    cities: ["Gaborone", "Francistown", "Maun"],
    mapCenter: { lat: -22.3285, lng: 24.6849 },
    flag: "🇧🇼"
  },
  { 
    code: "NA", 
    name: "Namibia", 
    currency: { code: "NAD", symbol: "N$", rate: 1 },
    cities: ["Windhoek", "Walvis Bay", "Swakopmund"],
    mapCenter: { lat: -22.9576, lng: 18.4904 },
    flag: "🇳🇦"
  },
  { 
    code: "ZW", 
    name: "Zimbabwe", 
    currency: { code: "USD", symbol: "$", rate: 0.053 },
    cities: ["Harare", "Bulawayo", "Victoria Falls"],
    mapCenter: { lat: -19.0154, lng: 29.1549 },
    flag: "🇿🇼"
  },
  { 
    code: "MZ", 
    name: "Mozambique", 
    currency: { code: "USD", symbol: "$", rate: 0.053 },
    cities: ["Maputo", "Beira", "Nampula"],
    mapCenter: { lat: -18.6657, lng: 35.5296 },
    flag: "🇲🇿"
  },
  { 
    code: "LS", 
    name: "Lesotho", 
    currency: { code: "ZAR", symbol: "R", rate: 1 },
    cities: ["Maseru"],
    mapCenter: { lat: -29.61, lng: 28.2336 },
    flag: "🇱🇸"
  },
  { 
    code: "SZ", 
    name: "Eswatini", 
    currency: { code: "ZAR", symbol: "R", rate: 1 },
    cities: ["Mbabane", "Manzini"],
    mapCenter: { lat: -26.5225, lng: 31.4659 },
    flag: "🇸🇿"
  },
  { 
    code: "INTL", 
    name: "International (Remote)", 
    currency: { code: "USD", symbol: "$", rate: 0.053 },
    cities: [],
    mapCenter: { lat: 0, lng: 0 },
    flag: "🌍"
  },
];

export type Country = typeof countries[number];

interface CountryContextType {
  country: Country;
  setCountry: (country: Country) => void;
  formatPrice: (amountInCents: number) => string;
  showSelector: boolean;
  setShowSelector: (show: boolean) => void;
}

const CountryContext = createContext<CountryContextType | null>(null);

export function CountryProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<Country>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("preferredCountry");
      if (saved) {
        const found = countries.find(c => c.code === saved);
        if (found) return found;
      }
    }
    return countries[0];
  });
  
  const [showSelector, setShowSelector] = useState(false);

  const setCountry = (c: Country) => {
    setCountryState(c);
    localStorage.setItem("preferredCountry", c.code);
    localStorage.setItem("preferredCurrency", c.currency.code);
  };

  const formatPrice = (amountInCents: number) => {
    const zarAmount = amountInCents / 100;
    const converted = zarAmount * country.currency.rate;
    return `${country.currency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <CountryContext.Provider value={{ country, setCountry, formatPrice, showSelector, setShowSelector }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error("useCountry must be used within CountryProvider");
  }
  return context;
}

export function CountrySelector() {
  const { country, setCountry, setShowSelector } = useCountry();

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="gap-2 text-sm font-medium"
      onClick={() => setShowSelector(true)}
      data-testid="button-country-selector"
    >
      <span>{country.flag}</span>
      <span className="hidden sm:inline">{country.currency.symbol} {country.currency.code}</span>
    </Button>
  );
}

export function CountrySelectorDialog() {
  const { country, setCountry, showSelector, setShowSelector } = useCountry();

  return (
    <Dialog open={showSelector} onOpenChange={setShowSelector}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Select Your Location
          </DialogTitle>
          <DialogDescription>
            Choose your country to see local services, pricing, and professionals in your area.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {countries.map((c) => (
            <button
              key={c.code}
              onClick={() => {
                setCountry(c);
                setShowSelector(false);
              }}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all hover:border-primary hover:bg-primary/5 text-left ${
                country.code === c.code ? "border-primary bg-primary/10" : "border-border"
              }`}
              data-testid={`option-country-${c.code}`}
            >
              <span className="text-2xl">{c.flag}</span>
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">
                  {c.currency.symbol} {c.currency.code}
                </div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
