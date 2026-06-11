import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "wouter";
import { ChevronRight, Search } from "lucide-react";
import { useState } from "react";

const CATEGORIES = [
  { name: "Graphics & Design", icon: "🎨", subtext: "Brand Identity, Logo Design" },
  { name: "Programming & Tech", icon: "💻", subtext: "Website Building, Online Stores" },
  { name: "Skilled Trades", icon: "🔧", subtext: "Electrical, Plumbing, Construction" },
  { name: "Digital Marketing", icon: "📡", subtext: "SEO, Social Media, Paid Ads" },
  { name: "Writing & Translation", icon: "✍️", subtext: "Articles, Copywriting, CV Writing" },
  { name: "Finance & Accounting", icon: "💹", subtext: "Bookkeeping, Tax, SARS Compliance" },
  { name: "Home & Lifestyle", icon: "🏠", subtext: "Cleaning, Landscaping, Moving" },
  { name: "Healthcare & Wellness", icon: "🩺", subtext: "Nursing, Physiotherapy, Nutrition" },
  { name: "Business & Consulting", icon: "🎯", subtext: "Strategy, Operations, BD" },
  { name: "Photography & Video", icon: "🎥", subtext: "Product, Events, Drone" },
  { name: "AI Services", icon: "🤖", subtext: "AI Development, Automation, Data" },
  { name: "Legal", icon: "⚖️", subtext: "Contracts, CIPC, Compliance" },
];

export default function Categories() {
  const [search, setSearch] = useState("");
  const filtered = CATEGORIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.subtext.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        {/* Header */}
        <div className="sticky top-0 bg-slate-950 z-10 border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white flex-1">Categories</h1>
            <button className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="px-4 py-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        {/* Category List */}
        <div className="px-4 pb-8">
          {filtered.map((cat, i) => (
            <Link
              key={i}
              href={`/categories/${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="flex items-center gap-4 py-4 border-b border-slate-800 hover:bg-slate-900/50 transition-colors px-2 -mx-2 rounded-lg"
              data-testid={`category-row-${i}`}
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold text-white">{cat.name}</div>
                <div className="text-sm text-slate-500 truncate">{cat.subtext}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
