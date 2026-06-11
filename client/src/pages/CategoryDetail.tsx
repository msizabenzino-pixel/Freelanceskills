import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { trackCategory } from "@/lib/track";

const SUBCATEGORIES: Record<string, { groups: Record<string, string[]> }> = {
  "skilled-trades": {
    groups: {
      "TRADE TYPE": ["Electrical", "Plumbing", "Building & Construction", "AC & Refrigeration", "Solar & Energy"],
      "CERTIFICATION LEVEL": ["COC Certified", "CIDB Registered", "NHBRC Registered", "Pro Verified"],
      "SUPPORTING SERVICES": ["Project Management", "Compliance Docs", "Material Supply", "Site Safety"],
    },
  },
  "graphics-design": {
    groups: {
      "DESIGN": ["Logo Design", "Brand Identity", "Social Media Graphics", "Packaging Design"],
      "CREATIVE": ["Illustration", "3D Modelling", "Animation", "UI/UX Design"],
      "PRINT": ["Business Cards", "Flyers", "Brochures", "Poster Design"],
    },
  },
  "programming-tech": {
    groups: {
      "WEB": ["Website Building", "Online Stores", "WordPress", "Shopify"],
      "APPS": ["Mobile Apps", "Web Apps", "API Development", "SaaS"],
      "DATA": ["Database Design", "Data Analysis", "API Integration", "DevOps"],
    },
  },
  "digital-marketing": {
    groups: {
      "SEO": ["On-Page SEO", "Off-Page SEO", "Technical SEO", "Local SEO"],
      "SOCIAL": ["Social Media Management", "Content Creation", "Influencer Marketing", "Community Management"],
      "PAID": ["Google Ads", "Facebook Ads", "LinkedIn Ads", "TikTok Ads"],
    },
  },
  "writing-translation": {
    groups: {
      "WRITING": ["Articles", "Blog Posts", "Copywriting", "Technical Writing"],
      "EDITING": ["Proofreading", "Editing", "Ghostwriting", "Script Writing"],
      "SPECIALISED": ["CV Writing", "Grant Writing", "Legal Writing", "Translation"],
    },
  },
  "finance-accounting": {
    groups: {
      "BOOKKEEPING": ["Monthly Bookkeeping", "Payroll", "Invoicing", "Reconciliation"],
      "TAX": ["SARS Tax Returns", "VAT Filing", "PAYE", "Tax Planning"],
      "COMPLIANCE": ["Annual Returns", "CIPC Compliance", "Audit Prep", "Financial Statements"],
    },
  },
  "home-lifestyle": {
    groups: {
      "CLEANING": ["Home Cleaning", "Office Cleaning", "Deep Cleaning", "End of Tenancy"],
      "GARDEN": ["Landscaping", "Lawn Care", "Garden Design", "Tree Removal"],
      "MOVING": ["House Moving", "Office Moving", "Packing", "Storage"],
    },
  },
  "healthcare-wellness": {
    groups: {
      "CARE": ["Nursing", "Home Care", "Childcare", "Elderly Care"],
      "THERAPY": ["Physiotherapy", "Occupational Therapy", "Speech Therapy", "Massage"],
      "WELLNESS": ["Nutrition", "Personal Training", "Yoga", "Mental Health"],
    },
  },
  "business-consulting": {
    groups: {
      "STRATEGY": ["Business Strategy", "Market Research", "Feasibility Studies", "Business Plans"],
      "OPERATIONS": ["Process Improvement", "Supply Chain", "Quality Management", "Project Management"],
      "GROWTH": ["Lead Generation", "Sales Strategy", "Partnerships", "BD"],
    },
  },
  "photography-video": {
    groups: {
      "PHOTO": ["Product Photography", "Event Photography", "Portrait", "Real Estate"],
      "VIDEO": ["Corporate Video", "Social Media Video", "Documentary", "Music Video"],
      "DRONE": ["Aerial Photography", "Drone Video", "Survey", "Inspection"],
    },
  },
  "ai-services": {
    groups: {
      "DEVELOPMENT": ["AI Model Development", "Chatbots", "NLP", "Computer Vision"],
      "AUTOMATION": ["Workflow Automation", "RPA", "API Integration", "Data Pipelines"],
      "CONSULTING": ["AI Strategy", "Feasibility", "AI Readiness", "Use Case Identification"],
    },
  },
  "legal": {
    groups: {
      "CONTRACTS": ["Contract Drafting", "Contract Review", "NDA", "Terms of Service"],
      "CIPC": ["Company Registration", "Annual Returns", "Name Reservation", "Share Certificates"],
      "COMPLIANCE": ["POPIA Compliance", "GDPR", "Employment Law", "Consumer Protection"],
    },
  },
};

export default function CategoryDetail() {
  const [location] = useLocation();
  const slug = location.split("/categories/")[1]?.split("/")[0] || "";
  useEffect(() => {
    // Log the human-readable category name, not the URL slug, so it has a
    // chance of matching real gig categories in the Recommended feed.
    if (slug) trackCategory(slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
  }, [slug]);
  const categoryData = SUBCATEGORIES[slug];
  const categoryName = slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  const icon = {
    "skilled-trades": "🔧",
    "graphics-design": "🎨",
    "programming-tech": "💻",
    "digital-marketing": "📡",
    "writing-translation": "✍️",
    "finance-accounting": "💹",
    "home-lifestyle": "🏠",
    "healthcare-wellness": "🩺",
    "business-consulting": "🎯",
    "photography-video": "🎥",
    "ai-services": "🤖",
    "legal": "⚖️",
  }[slug] || "📁";

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        {/* Header */}
        <div className="sticky top-0 bg-slate-950 z-10 border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/categories" className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold text-white flex-1">{categoryName}</h1>
          </div>
        </div>

        {/* Hero */}
        <div className="px-4 py-6 text-center">
          <div className="text-6xl mb-3">{icon}</div>
          <h2 className="text-2xl font-bold text-white mb-1">{categoryName}</h2>
          <p className="text-sm text-slate-500">Find verified professionals in {categoryName}</p>
        </div>

        {/* Sub-category Groups */}
        <div className="px-4 pb-8">
          {categoryData ? (
            Object.entries(categoryData.groups).map(([groupName, items]) => (
              <div key={groupName} className="mb-6">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
                  {groupName}
                </div>
                {items.map((item, i) => (
                  <Link
                    key={i}
                    href={`/categories/${slug}/${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className="flex items-center gap-3 py-3 border-b border-slate-800 hover:bg-slate-900/50 transition-colors px-2 -mx-2 rounded-lg"
                    data-testid={`subcategory-row-${i}`}
                  >
                    <span className="text-sm text-white flex-1">{item}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </Link>
                ))}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p className="mb-2">Category not found</p>
              <Link href="/categories" className="text-emerald-400 text-sm underline">Browse all categories</Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
