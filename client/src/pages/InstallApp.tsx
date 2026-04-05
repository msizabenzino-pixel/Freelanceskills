import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Smartphone, Monitor, Apple, Chrome, Globe, CheckCircle2,
  Zap, Wifi, Bell, Shield, Download, Star, ArrowRight,
  Laptop, Tablet, Share2, Plus, MoreVertical, Home
} from "lucide-react";

type Platform = "android" | "ios" | "desktop" | "other";

function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  if (/windows|macintosh|linux/.test(ua)) return "desktop";
  return "other";
}

const FEATURES = [
  { icon: <Zap className="w-5 h-5" />, title: "Lightning Fast", desc: "Native app feel — instant load even on 3G networks across SA" },
  { icon: <Wifi className="w-5 h-5" />, title: "Works Offline", desc: "Browse job listings and your profile without data. Perfect for load-shedding." },
  { icon: <Bell className="w-5 h-5" />, title: "Push Notifications", desc: "Instant alerts when clients message you or new job matches appear" },
  { icon: <Shield className="w-5 h-5" />, title: "Secure & Private", desc: "No app store required. Your data is end-to-end encrypted." },
  { icon: <Star className="w-5 h-5" />, title: "No Storage Needed", desc: "Uses < 1MB on your device. Works on any Android, iOS, or desktop browser." },
  { icon: <Globe className="w-5 h-5" />, title: "Always Up to Date", desc: "Automatically updates — no manual app store downloads ever." },
];

const STATS = [
  { value: "< 1MB", label: "Device storage used" },
  { value: "0.8s", label: "Average load time" },
  { value: "47K+", label: "Active app users" },
  { value: "4.9★", label: "User rating" },
];

function AndroidInstructions() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4 p-4 bg-slate-800/60 border border-slate-700/50 rounded-xl">
        <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0">1</div>
        <div>
          <div className="font-semibold text-white mb-1">Open in Chrome</div>
          <div className="text-slate-400 text-sm">Make sure you're using Chrome browser on your Android device</div>
        </div>
      </div>
      <div className="flex items-start gap-4 p-4 bg-slate-800/60 border border-slate-700/50 rounded-xl">
        <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0">2</div>
        <div>
          <div className="font-semibold text-white mb-1">Tap the 3-dot menu</div>
          <div className="text-slate-400 text-sm flex items-center gap-2">
            Tap <MoreVertical className="w-4 h-4 text-slate-300 inline" /> in the top-right corner of Chrome
          </div>
        </div>
      </div>
      <div className="flex items-start gap-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
        <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0">3</div>
        <div>
          <div className="font-semibold text-emerald-400 mb-1">Tap "Add to Home Screen"</div>
          <div className="text-slate-400 text-sm">Or tap "Install App" if you see it. FreelanceSkills will appear on your home screen instantly!</div>
        </div>
      </div>
    </div>
  );
}

function IOSInstructions() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4 p-4 bg-slate-800/60 border border-slate-700/50 rounded-xl">
        <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0">1</div>
        <div>
          <div className="font-semibold text-white mb-1">Open in Safari</div>
          <div className="text-slate-400 text-sm">The app install feature only works in Safari on iPhone and iPad</div>
        </div>
      </div>
      <div className="flex items-start gap-4 p-4 bg-slate-800/60 border border-slate-700/50 rounded-xl">
        <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0">2</div>
        <div>
          <div className="font-semibold text-white mb-1">Tap the Share button</div>
          <div className="text-slate-400 text-sm flex items-center gap-2">
            Tap <Share2 className="w-4 h-4 text-slate-300 inline" /> at the bottom of the screen (the box with an arrow)
          </div>
        </div>
      </div>
      <div className="flex items-start gap-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0">3</div>
        <div>
          <div className="font-semibold text-blue-400 mb-1">Tap "Add to Home Screen"</div>
          <div className="text-slate-400 text-sm flex items-center gap-2">
            Scroll down and tap <Plus className="w-4 h-4 text-slate-300 inline" /> Add to Home Screen. Done!
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopInstructions() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4 p-4 bg-slate-800/60 border border-slate-700/50 rounded-xl">
        <div className="w-8 h-8 bg-violet-500/20 text-violet-400 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0">1</div>
        <div>
          <div className="font-semibold text-white mb-1">Open in Chrome or Edge</div>
          <div className="text-slate-400 text-sm">Works on Windows, Mac, and Linux with Chrome, Edge, or Brave</div>
        </div>
      </div>
      <div className="flex items-start gap-4 p-4 bg-slate-800/60 border border-slate-700/50 rounded-xl">
        <div className="w-8 h-8 bg-violet-500/20 text-violet-400 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0">2</div>
        <div>
          <div className="font-semibold text-white mb-1">Look for the install icon</div>
          <div className="text-slate-400 text-sm">Click the <Plus className="w-4 h-4 text-slate-300 inline" /> or computer icon in the address bar (right side)</div>
        </div>
      </div>
      <div className="flex items-start gap-4 p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl">
        <div className="w-8 h-8 bg-violet-500/20 text-violet-400 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0">3</div>
        <div>
          <div className="font-semibold text-violet-400 mb-1">Click "Install FreelanceSkills"</div>
          <div className="text-slate-400 text-sm">The app opens in its own window — just like a native desktop app!</div>
        </div>
      </div>
    </div>
  );
}

export default function InstallApp() {
  const [platform, setPlatform] = useState<Platform>("other");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installState, setInstallState] = useState<"idle" | "available" | "installed">("idle");

  useEffect(() => {
    setPlatform(detectPlatform());

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallState("available");
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstallState("installed"));

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstallState("installed");
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstallState("installed");
      setDeferredPrompt(null);
    }
  };

  const platformColor = {
    android: "emerald",
    ios: "blue",
    desktop: "violet",
    other: "emerald",
  }[platform];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pt-16 pb-20 px-4 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/6 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/6 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto text-center relative">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold px-4 py-2 rounded-full mb-8">
              <Download className="w-4 h-4" />
              Install the Free App — No App Store Required
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Take FreelanceSkills{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Everywhere
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Install our Progressive Web App for a native app experience on Android, iPhone, and desktop — no Play Store or App Store needed.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-12">
              {STATS.map((s) => (
                <div key={s.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white mb-1">{s.value}</div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Smart Install Button — shows when browser supports native prompt */}
            {installState === "installed" ? (
              <div className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-bold">App Already Installed!</div>
                  <div className="text-sm text-emerald-400/70">Open FreelanceSkills from your home screen or taskbar</div>
                </div>
              </div>
            ) : installState === "available" ? (
              <button
                onClick={handleInstall}
                className="inline-flex items-center gap-3 px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg rounded-2xl shadow-2xl shadow-emerald-500/30 transition-all hover:scale-[1.03] active:scale-[0.97]"
                data-testid="button-install-app-native"
              >
                <Download className="w-6 h-6" />
                Install FreelanceSkills Now
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-3 px-6 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-slate-300 text-sm">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  Follow the instructions below to install →
                </div>
                <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                  <Home className="w-4 h-4" /> Go to Homepage
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Platform Tabs */}
        <section className="max-w-3xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-black text-white text-center mb-8">
            Step-by-Step Install Guide
          </h2>

          {/* Platform selector */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              { id: "android" as Platform, icon: <Smartphone className="w-4 h-4" />, label: "Android" },
              { id: "ios" as Platform, icon: <Apple className="w-4 h-4" />, label: "iPhone / iPad" },
              { id: "desktop" as Platform, icon: <Monitor className="w-4 h-4" />, label: "Desktop (PC / Mac)" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                data-testid={`button-platform-${p.id}`}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
                  platform === p.id
                    ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700"
                }`}
              >
                {p.icon} {p.label}
                {platform === p.id && detectPlatform() === p.id && (
                  <span className="text-[10px] bg-slate-950/30 px-1.5 py-0.5 rounded-full font-black">YOUR DEVICE</span>
                )}
              </button>
            ))}
          </div>

          {platform === "android" && <AndroidInstructions />}
          {platform === "ios" && <IOSInstructions />}
          {platform === "desktop" && <DesktopInstructions />}

          {platform === "other" && (
            <div className="text-center py-8 text-slate-400">
              <Globe className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <p>Select your device type above to see instructions</p>
            </div>
          )}
        </section>

        {/* Features Grid */}
        <section className="bg-slate-900/50 border-y border-slate-800 py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-black text-white text-center mb-12">
              Why Install the FreelanceSkills App?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => (
                <div key={i} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-emerald-500/30 transition-all group">
                  <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-4 group-hover:bg-emerald-500/20 transition-all">
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Compatible Browsers */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-black text-white text-center mb-8">
            Works On All Your Devices
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: <Smartphone className="w-8 h-8" />, name: "Android", note: "Chrome, Samsung" },
              { icon: <Apple className="w-8 h-8" />, name: "iPhone & iPad", note: "Safari" },
              { icon: <Laptop className="w-8 h-8" />, name: "Windows PC", note: "Chrome, Edge" },
              { icon: <Monitor className="w-8 h-8" />, name: "Mac", note: "Chrome, Safari" },
            ].map((d) => (
              <div key={d.name} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center group hover:border-emerald-500/30 transition-all">
                <div className="text-emerald-400 flex justify-center mb-3 group-hover:scale-110 transition-transform">{d.icon}</div>
                <div className="font-bold text-white text-sm mb-1">{d.name}</div>
                <div className="text-slate-500 text-xs">{d.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 py-16 px-4 mx-4 mb-16 rounded-3xl max-w-5xl lg:mx-auto">
          <div className="text-center">
            <Download className="w-12 h-12 text-white/80 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-white mb-4">Ready to Install?</h2>
            <p className="text-emerald-100 mb-8 max-w-md mx-auto">
              Scroll up and follow the steps for your device. The whole process takes less than 30 seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/" className="px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors text-lg inline-flex items-center gap-2" data-testid="button-install-go-home">
                <Home className="w-5 h-5" /> Go to Homepage
              </Link>
              <Link href="/jobs" className="px-8 py-4 bg-emerald-800/50 border border-white/20 text-white font-bold rounded-xl hover:bg-emerald-800/80 transition-colors text-lg inline-flex items-center gap-2">
                <ArrowRight className="w-5 h-5" /> Browse Jobs
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
