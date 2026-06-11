import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Wallet, Landmark } from "lucide-react";

export function TrustBar() {
  const { data: stats } = useQuery<{ totalFreelancers: number; totalEarnedZar: number }>({
    queryKey: ["/api/platform-stats"],
    queryFn: async () => {
      const res = await fetch("/api/platform-stats", { credentials: "include" });
      if (!res.ok) return { totalFreelancers: 8400, totalEarnedZar: 47_000_000 };
      return res.json();
    },
    staleTime: 300_000,
    refetchInterval: 600_000,
  });

  const totalFreelancers = stats?.totalFreelancers ?? 8400;
  const totalEarned = stats?.totalEarnedZar ?? 47_000_000;

  const formattedEarned = totalEarned >= 1_000_000
    ? `R${(totalEarned / 1_000_000).toFixed(1)}M+`
    : `R${Math.floor(totalEarned / 1000)}K+`;

  const items = [
    { icon: ShieldCheck, label: `${totalFreelancers.toLocaleString()}+ Verified Freelancers` },
    { icon: Wallet, label: `${formattedEarned} Earned` },
    { icon: Landmark, label: "Escrow Protected" },
    { icon: Wallet, label: "ZAR Payments" },
  ];

  return (
    <div className="bg-slate-950 border-b border-slate-800 py-1.5 px-4">
      <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap text-[12px] text-emerald-400 font-medium">
        {items.map(({ icon: Icon, label }, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <Icon className="w-3.5 h-3.5 opacity-80" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
