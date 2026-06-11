import { Link } from "wouter";
import { ShieldCheck, Landmark, Wallet, Scale } from "lucide-react";

const items = [
  { icon: ShieldCheck, label: "Identity Verified", href: null },
  { icon: Landmark, label: "Escrow Protected", href: null },
  { icon: Wallet, label: "ZAR Payments", href: null },
  { icon: Scale, label: "Dispute Resolution", href: "/payment-protection#disputes" },
] as const;

export function TrustBar() {
  return (
    <div className="bg-slate-950 border-b border-slate-800 py-1.5 px-4" data-testid="bar-trust">
      <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap text-[12px] text-emerald-400 font-medium">
        {items.map(({ icon: Icon, label, href }) => {
          const content = (
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Icon className="w-3.5 h-3.5 opacity-80" />
              {label}
            </span>
          );
          return href ? (
            <Link
              key={label}
              href={href}
              className="hover:text-emerald-300 transition-colors"
              data-testid="link-trust-disputes"
            >
              {content}
            </Link>
          ) : (
            <span key={label} data-testid={`text-trust-${label.toLowerCase().replace(/\s+/g, "-")}`}>
              {content}
            </span>
          );
        })}
      </div>
    </div>
  );
}
