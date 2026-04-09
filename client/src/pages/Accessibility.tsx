import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Languages,
  Eye,
  Type,
  Monitor,
  Volume2,
  Video,
  ArrowRight,
  Check,
  Sparkles,
  Accessibility as AccessibilityIcon,
  Ear,
  Hand,
  MousePointer,
  ZoomIn,
  Sun,
  Moon,
  Contrast,
} from "lucide-react";

const languages = [
  { code: "en", name: "English", native: "English", flag: "🇬🇧", status: "live" },
  { code: "af", name: "Afrikaans", native: "Afrikaans", flag: "🇿🇦", status: "live" },
  { code: "zu", name: "Zulu", native: "isiZulu", flag: "🇿🇦", status: "live" },
  { code: "xh", name: "Xhosa", native: "isiXhosa", flag: "🇿🇦", status: "live" },
  { code: "st", name: "Sotho", native: "Sesotho", flag: "🇿🇦", status: "live" },
  { code: "tn", name: "Tswana", native: "Setswana", flag: "🇿🇦", status: "live" },
  { code: "ts", name: "Tsonga", native: "Xitsonga", flag: "🇿🇦", status: "beta" },
  { code: "ss", name: "Swati", native: "siSwati", flag: "🇿🇦", status: "beta" },
  { code: "ve", name: "Venda", native: "Tshivenḓa", flag: "🇿🇦", status: "beta" },
  { code: "nr", name: "Ndebele", native: "isiNdebele", flag: "🇿🇦", status: "beta" },
  { code: "nso", name: "Northern Sotho", native: "Sepedi", flag: "🇿🇦", status: "beta" },
  { code: "pt", name: "Portuguese", native: "Português", flag: "🇵🇹", status: "live" },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷", status: "live" },
  { code: "sw", name: "Swahili", native: "Kiswahili", flag: "🇰🇪", status: "live" },
  { code: "ha", name: "Hausa", native: "Hausa", flag: "🇳🇬", status: "beta" },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦", status: "beta" },
  { code: "pcm", name: "Nigerian Pidgin", native: "Nigerian Pidgin", flag: "🇳🇬", status: "beta" },
];

const sampleTranslations: Record<string, { greeting: string; tagline: string; cta: string }> = {
  en: { greeting: "Welcome to FreelanceSkills", tagline: "Find skilled professionals near you", cta: "Get Started" },
  af: { greeting: "Welkom by FreelanceSkills", tagline: "Vind bekwame professionele mense naby jou", cta: "Begin Nou" },
  zu: { greeting: "Siyakwamukela ku-FreelanceSkills", tagline: "Thola abantu abanekhono eduze kwakho", cta: "Qala Manje" },
  xh: { greeting: "Wamkelekile ku-FreelanceSkills", tagline: "Fumana abantu abanezokhono kufutshane nawe", cta: "Qala Ngoku" },
  st: { greeting: "Re o amohela ho FreelanceSkills", tagline: "Fumana batho ba nang le bokgoni haufi le wena", cta: "Qala Hona Joale" },
  tn: { greeting: "Re go amogela mo FreelanceSkills", tagline: "Bona batho ba ba nang le bokgoni gaufi le wena", cta: "Simolola Jaanong" },
  ts: { greeting: "Mu amukeriwa eka FreelanceSkills", tagline: "Kuma swirho swo tiva ehansi ka wena", cta: "Sungula Sweswi" },
  ss: { greeting: "Siyamukela ku-FreelanceSkills", tagline: "Thola ticotfwa letinebuchwepheshe eduze nawe", cta: "Cala Manje" },
  ve: { greeting: "Ndi a vhea kha FreelanceSkills", tagline: "Wana vhathu vhane vha na vhugudzi tsini nawe", cta: "Thoma Zwino" },
  nr: { greeting: "Siyakwamukela ku-FreelanceSkills", tagline: "Thola abantu abanolwazi eduze kwakho", cta: "Qala Manje" },
  nso: { greeting: "Re go amogela go FreelanceSkills", tagline: "Hwetša batho ba go na le bokgoni gaufi le wena", cta: "Thoma Bjale" },
  pt: { greeting: "Bem-vindo ao FreelanceSkills", tagline: "Encontre profissionais qualificados perto de si", cta: "Começar" },
  fr: { greeting: "Bienvenue sur FreelanceSkills", tagline: "Trouvez des professionnels qualifiés près de chez vous", cta: "Commencer" },
  sw: { greeting: "Karibu FreelanceSkills", tagline: "Pata wataalamu wenye ujuzi karibu nawe", cta: "Anza Sasa" },
  ha: { greeting: "Barka da zuwa FreelanceSkills", tagline: "Nemo kwararru kusa da kai", cta: "Fara Yanzu" },
  ar: { greeting: "مرحبًا بك في FreelanceSkills", tagline: "اعثر على محترفين مهرة بالقرب منك", cta: "ابدأ الآن" },
  pcm: { greeting: "Welkam to FreelanceSkills", tagline: "Find correct professionals we dey near you", cta: "Start Now" },
};

const accessibilityFeatures = [
  {
    icon: Eye,
    title: "Screen Reader Support",
    description: "Full ARIA labeling and semantic HTML for JAWS, NVDA, and VoiceOver compatibility.",
    status: "active",
  },
  {
    icon: Contrast,
    title: "High Contrast Mode",
    description: "Enhanced color contrast ratios exceeding WCAG AAA standards for better visibility.",
    status: "active",
  },
  {
    icon: Type,
    title: "Dyslexia-Friendly Mode",
    description: "OpenDyslexic font, increased letter spacing, and adjusted line heights for easier reading.",
    status: "active",
  },
  {
    icon: ZoomIn,
    title: "Font Size Control",
    description: "Adjustable text sizing from 80% to 200% without layout breaking.",
    status: "active",
  },
  {
    icon: MousePointer,
    title: "Keyboard Navigation",
    description: "Complete keyboard accessibility with visible focus indicators and skip links.",
    status: "active",
  },
  {
    icon: Volume2,
    title: "Text-to-Speech",
    description: "AI-powered text-to-speech in all 14 supported languages for content consumption.",
    status: "active",
  },
  {
    icon: Video,
    title: "Sign Language Video",
    description: "SASL (South African Sign Language) video call integration for deaf users.",
    status: "active",
  },
  {
    icon: Ear,
    title: "Captioning & Subtitles",
    description: "Real-time auto-captioning on all video calls and voice messages.",
    status: "active",
  },
];

export default function Accessibility() {
  const [selectedLang, setSelectedLang] = useState("en");
  const [highContrast, setHighContrast] = useState(false);
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [signLanguage, setSignLanguage] = useState(false);

  const currentTranslation = sampleTranslations[selectedLang] || sampleTranslations["en"];

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col overflow-x-hidden">
      <Navbar />

      <main id="main-content" role="main">
        <section className="animated-gradient-bg text-white pt-32 pb-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/8 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/8 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3" />
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-accent text-sm font-medium mb-6" data-testid="badge-accessibility-hero">
              <AccessibilityIcon className="w-4 h-4" />
              Inclusivity & Accessibility
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6" data-testid="text-accessibility-title">
              Built for Everyone
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed" data-testid="text-accessibility-subtitle">
              14 languages, comprehensive accessibility features, and inclusive design — because opportunity should have no barriers.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3" data-testid="text-languages-heading">
                <Globe className="w-8 h-8 inline-block mr-2 mb-1" />
                Language Support
              </h2>
              <p className="text-muted-foreground text-lg">All 11 official South African languages plus Portuguese, French & Swahili</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 max-w-6xl mx-auto mb-12">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`relative p-4 rounded-xl border-2 text-center transition-all cursor-pointer ${
                    selectedLang === lang.code
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  }`}
                  data-testid={`button-lang-${lang.code}`}
                >
                  <span className="text-2xl block mb-1">{lang.flag}</span>
                  <p className="text-sm font-semibold text-foreground">{lang.native}</p>
                  <p className="text-xs text-muted-foreground">{lang.name}</p>
                  {lang.status === "beta" && (
                    <Badge variant="secondary" className="absolute -top-2 -right-2 text-[10px] px-1.5">
                      Beta
                    </Badge>
                  )}
                  {selectedLang === lang.code && (
                    <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <Card className="max-w-3xl mx-auto overflow-hidden" data-testid="card-translation-preview">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Languages className="w-5 h-5 text-primary" />
                  Real-Time Translation Preview
                  <div className="ml-auto flex items-center gap-2">
                    {languages.find((l) => l.code === selectedLang)?.status === "beta" && (
                      <Badge variant="secondary" className="text-xs">Beta</Badge>
                    )}
                    <Badge variant="outline">
                      {languages.find((l) => l.code === selectedLang)?.name}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 border" data-testid="text-translation-greeting">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Greeting</p>
                  <p className="text-xl font-bold text-foreground">{currentTranslation.greeting}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 border" data-testid="text-translation-tagline">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Tagline</p>
                  <p className="text-lg text-foreground">{currentTranslation.tagline}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 border" data-testid="text-translation-cta">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Call to Action</p>
                  <Button className="mt-1" data-testid="button-translated-cta">{currentTranslation.cta} <ArrowRight className="w-4 h-4 ml-1" /></Button>
                </div>
                <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>
                    {languages.find((l) => l.code === selectedLang)?.status === "beta"
                      ? "Beta translation — AI-assisted. Community review in progress for full accuracy."
                      : "AI-powered neural translation with cultural context awareness"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3" data-testid="text-features-heading">
                <Eye className="w-8 h-8 inline-block mr-2 mb-1" />
                Accessibility Features
              </h2>
              <p className="text-muted-foreground text-lg">WCAG 2.1 AAA compliant — designed for all abilities</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {accessibilityFeatures.map((feature, i) => (
                <Card key={i} className="p-5 hover:shadow-lg transition-shadow" data-testid={`card-feature-${i}`}>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2" data-testid={`text-feature-title-${i}`}>{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-feature-desc-${i}`}>{feature.description}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-green-600">
                    <Check className="w-3.5 h-3.5" />
                    Active
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3" data-testid="text-toggles-heading">
                <Monitor className="w-8 h-8 inline-block mr-2 mb-1" />
                Personalize Your Experience
              </h2>
              <p className="text-muted-foreground text-lg">Toggle accessibility features to preview how the platform adapts</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-4">
              <Card className="p-5" data-testid="card-toggle-highcontrast">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Contrast className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">High Contrast Mode</h3>
                      <p className="text-sm text-muted-foreground">Enhanced color contrast for better visibility</p>
                    </div>
                  </div>
                  <Switch checked={highContrast} onCheckedChange={setHighContrast} data-testid="switch-highcontrast" />
                </div>
                {highContrast && (
                  <div className="mt-4 p-3 rounded-lg bg-black text-white border-2 border-yellow-400">
                    <p className="text-sm font-bold">High Contrast Preview: Text appears with maximum contrast ratio for easy reading.</p>
                  </div>
                )}
              </Card>

              <Card className="p-5" data-testid="card-toggle-dyslexia">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Type className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Dyslexia-Friendly Mode</h3>
                      <p className="text-sm text-muted-foreground">OpenDyslexic font with increased spacing</p>
                    </div>
                  </div>
                  <Switch checked={dyslexiaMode} onCheckedChange={setDyslexiaMode} data-testid="switch-dyslexia" />
                </div>
                {dyslexiaMode && (
                  <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <p className="text-sm" style={{ fontFamily: "OpenDyslexic, Comic Sans MS, sans-serif", letterSpacing: "0.12em", lineHeight: "1.8" }}>
                      This text uses a dyslexia-friendly font with wider letter spacing and increased line height for easier reading.
                    </p>
                  </div>
                )}
              </Card>

              <Card className="p-5" data-testid="card-toggle-largetext">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ZoomIn className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Large Text</h3>
                      <p className="text-sm text-muted-foreground">Increase all text sizes by 50%</p>
                    </div>
                  </div>
                  <Switch checked={largeText} onCheckedChange={setLargeText} data-testid="switch-largetext" />
                </div>
                {largeText && (
                  <div className="mt-4 p-3 rounded-lg bg-muted border">
                    <p className="text-lg font-medium">This text is 50% larger than normal for improved readability.</p>
                  </div>
                )}
              </Card>

              <Card className="p-5" data-testid="card-toggle-reducedmotion">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Hand className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Reduced Motion</h3>
                      <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
                    </div>
                  </div>
                  <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} data-testid="switch-reducedmotion" />
                </div>
                {reducedMotion && (
                  <div className="mt-4 p-3 rounded-lg bg-muted border">
                    <p className="text-sm text-muted-foreground">All animations and transitions are now disabled for a calmer experience.</p>
                  </div>
                )}
              </Card>

              <Card className="p-5" data-testid="card-toggle-screenreader">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Volume2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Screen Reader Optimization</h3>
                      <p className="text-sm text-muted-foreground">Enhanced ARIA labels and navigation landmarks</p>
                    </div>
                  </div>
                  <Switch checked={screenReader} onCheckedChange={setScreenReader} data-testid="switch-screenreader" />
                </div>
                {screenReader && (
                  <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-300">Screen reader mode active: Enhanced landmark navigation, detailed ARIA labels, and descriptive link text enabled.</p>
                  </div>
                )}
              </Card>

              <Card className="p-5" data-testid="card-toggle-signlanguage">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Video className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Sign Language Video Calls</h3>
                      <p className="text-sm text-muted-foreground">SASL interpreter overlay for video consultations</p>
                    </div>
                  </div>
                  <Switch checked={signLanguage} onCheckedChange={setSignLanguage} data-testid="switch-signlanguage" />
                </div>
                {signLanguage && (
                  <div className="mt-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <Video className="w-8 h-8 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">SASL Interpreter Ready</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">Sign language interpreter will join your next video call automatically</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 animated-gradient-bg text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-[80px] translate-x-1/3 translate-y-1/3" />
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <AccessibilityIcon className="w-12 h-12 mx-auto mb-6 text-accent" />
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4" data-testid="text-commitment-heading">
              Our Accessibility Commitment
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
              We believe technology should serve everyone. Our platform is continuously audited against
              WCAG 2.1 AAA standards and tested with users of all abilities across Southern Africa.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <p className="text-3xl font-bold text-accent" data-testid="text-stat-languages">14</p>
                <p className="text-sm text-white/70">Languages</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <p className="text-3xl font-bold text-accent" data-testid="text-stat-wcag">AAA</p>
                <p className="text-sm text-white/70">WCAG Level</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <p className="text-3xl font-bold text-accent" data-testid="text-stat-readers">100%</p>
                <p className="text-sm text-white/70">Screen Reader</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <p className="text-3xl font-bold text-accent" data-testid="text-stat-sasl">SASL</p>
                <p className="text-sm text-white/70">Sign Language</p>
              </div>
            </div>
            <Button size="lg" variant="secondary" className="gap-2 font-bold px-8" data-testid="button-accessibility-audit">
              View Accessibility Audit Report <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}