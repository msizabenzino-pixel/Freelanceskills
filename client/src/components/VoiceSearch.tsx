import { useState, useEffect, useCallback, useRef } from "react";
import { Mic, MicOff, Search, Globe, Sparkles, ArrowRight, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface ParsedFilter {
  label: string;
  value: string;
  color: string;
}

interface VoiceSearchProps {
  variant?: "hero" | "navbar";
  onClose?: () => void;
}

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "af", name: "Afrikaans", flag: "🇿🇦" },
  { code: "zu", name: "Zulu", flag: "🇿🇦" },
  { code: "xh", name: "Xhosa", flag: "🇿🇦" },
  { code: "st", name: "Sotho", flag: "🇿🇦" },
];

const AI_SUGGESTIONS = [
  "I need a plumber in Cape Town under R500",
  "Find me a React developer for 3 months",
  "Safety officer near Pretoria, urgent",
  "Graphic designer who speaks Afrikaans",
  "Electrician available this weekend in Durban",
];

const SIMULATED_PARSES: Record<string, ParsedFilter[]> = {
  "I need a plumber in Cape Town under R500": [
    { label: "Service", value: "Plumber", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
    { label: "Location", value: "Cape Town", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
    { label: "Budget", value: "Under R500", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  ],
  "Find me a React developer for 3 months": [
    { label: "Skill", value: "React Developer", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
    { label: "Duration", value: "3 months", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300" },
  ],
  "Safety officer near Pretoria, urgent": [
    { label: "Service", value: "Safety Officer", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
    { label: "Location", value: "Pretoria", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
    { label: "Priority", value: "Urgent", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  ],
  "Graphic designer who speaks Afrikaans": [
    { label: "Skill", value: "Graphic Designer", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
    { label: "Language", value: "Afrikaans", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
  ],
  "Electrician available this weekend in Durban": [
    { label: "Service", value: "Electrician", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
    { label: "Availability", value: "This Weekend", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300" },
    { label: "Location", value: "Durban", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  ],
};

export function VoiceSearch({ variant = "hero", onClose }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsedFilters, setParsedFilters] = useState<ParsedFilter[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showLanguages, setShowLanguages] = useState(false);
  const [waveHeights, setWaveHeights] = useState<number[]>([16, 24, 12, 28, 18, 22, 14]);
  const [, navigate] = useLocation();
  const languageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isListening) return;
    const interval = setInterval(() => {
      setWaveHeights(prev => prev.map(() => 8 + Math.random() * 28));
    }, 180);
    return () => clearInterval(interval);
  }, [isListening]);

  useEffect(() => {
    if (!isListening) return;
    const randomQuery = AI_SUGGESTIONS[Math.floor(Math.random() * AI_SUGGESTIONS.length)];
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex <= randomQuery.length) {
        setTranscript(randomQuery.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsListening(false);
        simulateParse(randomQuery);
      }
    }, 60);
    return () => clearInterval(typeInterval);
  }, [isListening]);

  useEffect(() => {
    if (!showLanguages) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(e.target as Node)) {
        setShowLanguages(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => document.removeEventListener("click", handleClickOutside, true);
  }, [showLanguages]);

  const simulateParse = useCallback((query: string) => {
    setIsParsing(true);
    setTimeout(() => {
      const filters = SIMULATED_PARSES[query] || [
        { label: "Query", value: query, color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
      ];
      setParsedFilters(filters);
      setIsParsing(false);
    }, 800);
  }, []);

  const startListening = () => {
    setTranscript("");
    setParsedFilters([]);
    setIsListening(true);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setTranscript(suggestion);
    simulateParse(suggestion);
  };

  const handleSearch = () => {
    if (transcript.trim()) {
      navigate(`/services?q=${encodeURIComponent(transcript.trim())}`);
      onClose?.();
    }
  };

  if (variant === "navbar") {
    return (
      <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md animate-in fade-in duration-200" data-testid="voice-search-overlay">
        <div className="container mx-auto px-4 pt-20 max-w-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Voice & AI Search</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors" data-testid="button-close-voice-search">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  value={transcript}
                  onChange={(e) => {
                    setTranscript(e.target.value);
                    setParsedFilters([]);
                  }}
                  placeholder="Try: 'I need a plumber in Cape Town under R500'"
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  data-testid="input-voice-search-navbar"
                />
              </div>
              <button
                onClick={isListening ? stopListening : startListening}
                className={cn(
                  "relative w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                  isListening
                    ? "bg-red-500 text-white"
                    : "bg-primary text-white hover:bg-primary/90"
                )}
                data-testid="button-voice-mic-navbar"
              >
                {isListening && (
                  <>
                    <span className="absolute inset-0 rounded-xl bg-red-500 animate-ping opacity-20" />
                    <span className="absolute inset-[-4px] rounded-xl border-2 border-red-400 animate-pulse opacity-40" />
                  </>
                )}
                {isListening ? <MicOff className="h-5 w-5 relative z-10" /> : <Mic className="h-5 w-5" />}
              </button>
            </div>

            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onSelect={setSelectedLanguage}
              showLanguages={showLanguages}
              onToggle={() => setShowLanguages(!showLanguages)}
            />

            {isListening && (
              <div className="text-center py-6" data-testid="voice-listening-state">
                <div className="flex items-center justify-center gap-1 mb-3">
                  {waveHeights.slice(0, 5).map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary rounded-full"
                      style={{
                        height: `${h}px`,
                        transition: "height 0.15s ease",
                      }}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">Listening... speak naturally</p>
              </div>
            )}

            {isParsing && (
              <div className="flex items-center justify-center gap-2 py-4" data-testid="voice-parsing-state">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">AI is parsing your query...</span>
              </div>
            )}

            <ParsedFiltersDisplay filters={parsedFilters} onSearch={handleSearch} />

            {!isListening && !transcript && (
              <SuggestionsList suggestions={AI_SUGGESTIONS} onSelect={handleSuggestionClick} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" data-testid="voice-search-hero">
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={isListening ? stopListening : startListening}
          className={cn(
            "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
            isListening
              ? "bg-red-500/20 text-red-300 border border-red-400/30"
              : "bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:text-white"
          )}
          data-testid="button-voice-mic-hero"
        >
          <span className="relative">
            {isListening && (
              <span className="absolute inset-[-6px] rounded-full bg-red-500 animate-ping opacity-30" />
            )}
            {isListening ? (
              <MicOff className="h-4 w-4 relative z-10" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </span>
          {isListening ? "Listening..." : "Voice Search"}
        </button>

        <div ref={languageRef} className="relative">
          <button
            onClick={() => setShowLanguages(!showLanguages)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 transition-all"
            data-testid="button-language-selector-hero"
          >
            <Globe className="h-4 w-4" />
            <span>{SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.flag}</span>
          </button>
          {showLanguages && (
            <div className="absolute top-full left-0 mt-1 z-50 flex flex-wrap gap-2 p-2 rounded-xl bg-primary/90 backdrop-blur-md border border-white/20 shadow-lg animate-in slide-in-from-top-2 duration-200 min-w-[200px]" data-testid="language-list-hero">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLanguage(lang.code);
                    setShowLanguages(false);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    selectedLanguage === lang.code
                      ? "bg-accent text-primary"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  )}
                  data-testid={`button-lang-${lang.code}`}
                >
                  <span>{lang.flag}</span>
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isListening && (
        <div className="mt-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 animate-in fade-in duration-300" data-testid="voice-listening-hero">
          <div className="flex items-center justify-center gap-1 mb-3">
            {waveHeights.map((h, i) => (
              <div
                key={i}
                className="w-1 bg-accent rounded-full"
                style={{
                  height: `${h}px`,
                  transition: "height 0.15s ease",
                }}
              />
            ))}
          </div>
          {transcript && (
            <p className="text-white text-center text-sm mt-2">
              "{transcript}<span className="animate-pulse">|</span>"
            </p>
          )}
        </div>
      )}

      {isParsing && (
        <div className="mt-3 flex items-center justify-center gap-2" data-testid="voice-parsing-hero">
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
          <span className="text-sm text-white/70">AI is parsing your query...</span>
        </div>
      )}

      {parsedFilters.length > 0 && (
        <div className="mt-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 animate-in fade-in duration-300" data-testid="parsed-filters-hero">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium text-white/70 uppercase tracking-wider">AI Parsed Query</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {parsedFilters.map((filter, i) => (
              <span
                key={i}
                className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold", filter.color)}
                data-testid={`parsed-filter-${filter.label.toLowerCase()}`}
              >
                <span className="opacity-70">{filter.label}:</span>
                {filter.value}
              </span>
            ))}
          </div>
          <Button
            size="sm"
            className="w-full bg-accent text-primary hover:bg-accent/90 font-bold gap-2"
            onClick={handleSearch}
            data-testid="button-search-parsed"
          >
            Search with These Filters <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function LanguageSelector({
  selectedLanguage,
  onSelect,
  showLanguages,
  onToggle,
}: {
  selectedLanguage: string;
  onSelect: (code: string) => void;
  showLanguages: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
        data-testid="button-language-toggle"
      >
        <Globe className="h-4 w-4" />
        <span>
          {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.flag}{" "}
          {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}
        </span>
        <span className="text-xs text-muted-foreground/60">• Multilingual voice supported</span>
      </button>
      {showLanguages && (
        <div className="mt-2 flex flex-wrap gap-2 animate-in slide-in-from-top-2" data-testid="language-list-navbar">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                selectedLanguage === lang.code
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              data-testid={`button-lang-navbar-${lang.code}`}
            >
              <span>{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ParsedFiltersDisplay({ filters, onSearch }: { filters: ParsedFilter[]; onSearch: () => void }) {
  if (filters.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-muted/50 border border-border animate-in fade-in duration-300" data-testid="parsed-filters-navbar">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Parsed Query</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map((filter, i) => (
          <span
            key={i}
            className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold", filter.color)}
            data-testid={`parsed-filter-navbar-${filter.label.toLowerCase()}`}
          >
            <span className="opacity-70">{filter.label}:</span>
            {filter.value}
          </span>
        ))}
      </div>
      <Button className="w-full gap-2" onClick={onSearch} data-testid="button-search-parsed-navbar">
        Search with These Filters <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function SuggestionsList({ suggestions, onSelect }: { suggestions: string[]; onSelect: (s: string) => void }) {
  return (
    <div data-testid="voice-search-suggestions">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Try saying...</p>
      <div className="space-y-2">
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => onSelect(suggestion)}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-muted/50 transition-colors group"
            data-testid={`suggestion-${i}`}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Mic className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm text-foreground group-hover:text-primary transition-colors">"{suggestion}"</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}
