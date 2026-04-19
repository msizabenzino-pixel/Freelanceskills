/**
 * ProfileStrengthMeter — animated 0-100 % ring + tips
 * Used on Dashboard Overview and CV Upload wizard.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { calcStrength, barColor, type StrengthInput } from "@/lib/profileStrength";
import { ChevronDown, ChevronUp, Zap } from "lucide-react";

interface Props {
  data: StrengthInput;
  /** Compact mode: just the bar + score, no tips drawer */
  compact?: boolean;
  className?: string;
}

export function ProfileStrengthMeter({ data, compact = false, className }: Props) {
  const [open, setOpen] = useState(false);
  const { score, label, color, tips, motivational } = calcStrength(data);
  const bar = barColor(score);
  const pct = Math.min(100, Math.max(0, score));

  // SVG ring math
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className={cn("rounded-xl border border-slate-800 bg-slate-900/60 p-4", className)}>
      <div className="flex items-center gap-4">
        {/* SVG Ring */}
        <div className="shrink-0">
          <svg width="80" height="80" viewBox="0 0 88 88" aria-label={`Profile strength ${pct}%`}>
            <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <circle
              cx="44" cy="44" r={r} fill="none"
              stroke="currentColor"
              className={bar.replace("bg-", "text-")}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              transform="rotate(-90 44 44)"
              style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }}
            />
            <text x="44" y="40" textAnchor="middle" fill="white" fontSize="18" fontWeight="700">{pct}</text>
            <text x="44" y="54" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="9">/ 100</text>
          </svg>
        </div>

        {/* Score + label */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className={cn("text-lg font-bold", color)}>{label}</span>
            <span className="text-xs text-muted-foreground">profile</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1 line-clamp-2">{motivational}</p>

          {/* Bar */}
          <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", bar)}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tips drawer — only in non-compact mode */}
      {!compact && tips.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            data-testid="btn-toggle-strength-tips"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            {tips.length} improvement{tips.length !== 1 ? "s" : ""} available
            {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {open && (
            <ul className="mt-2 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              {tips.slice(0, 6).map((tip) => (
                <li
                  key={tip}
                  className="flex items-center gap-2 text-xs text-amber-200/80 bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-2"
                >
                  <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
