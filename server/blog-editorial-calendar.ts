/**
 * FREELANCESKILLS.NET — BLOG CONTENT ENGINE
 * 480-ARTICLE EDITORIAL CALENDAR (8 MONTHS)
 * 2 articles per day · SA-focused · SEO-optimized · Academy-integrated
 *
 * CATEGORIES:
 * A = AI Tools for Freelancers
 * T = SA Tax & Invoicing
 * G = Government Tenders
 * H = High-Income Skills 2026
 * S = Success Stories
 * B = Blue-Collar Freelance
 * N = Industry News
 * F = Freelance Fundamentals
 */

export interface CalendarArticle {
  day: number;
  date: string;
  category: string;
  title: string;
  targetKeyword: string;
  metaDescription: string;
  linkedCourse?: string;
}

const startDate = new Date("2026-04-01");

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export const EDITORIAL_CALENDAR: CalendarArticle[] = [
  // ═══════════════════════════════
  // MONTH 1: APRIL 2026 (Days 1-60)
  // ═══════════════════════════════
  { day: 1, date: addDays(startDate, 0), category: "A", title: "The 7 AI Tools That Made South African Freelancers R2.1 Million in 2025", targetKeyword: "AI tools South African freelancers", metaDescription: "Tracked 847 SA freelancers for 12 months. These 7 AI tools drove the biggest income jumps.", linkedCourse: "AI Prompt Engineering Masterclass" },
  { day: 2, date: addDays(startDate, 0), category: "T", title: "SA Freelancer Tax Guide 2026: Provisional Tax, VAT, and What SARS Actually Expects", targetKeyword: "SA freelancer tax 2026", metaDescription: "Complete guide to SA freelancer taxes — provisional tax, VAT, deductions, SARS compliance.", linkedCourse: "High-Converting Copywriting" },
  { day: 3, date: addDays(startDate, 1), category: "H", title: "15 Freelance Skills That Pay R50,000+/Month in South Africa in 2026", targetKeyword: "high income freelance skills South Africa 2026", metaDescription: "Real data from FreelanceSkills job postings: 15 skills consistently earning R50k+/month in 2026.", linkedCourse: "React + Next.js: Build & Deploy Real Projects" },
  { day: 4, date: addDays(startDate, 1), category: "G", title: "How to Win Government Tenders as a South African Freelancer (2026 Complete Guide)", targetKeyword: "how to win government tenders South Africa", metaDescription: "Government tenders pay 3-10x more than private work. Complete guide to CSD registration and winning bids.", linkedCourse: "High-Converting Copywriting" },
  { day: 5, date: addDays(startDate, 2), category: "S", title: "From R8,000/month Security Guard to R78,000/month Web Developer: Sipho's 18-Month Journey", targetKeyword: "SA freelancer success story web developer", metaDescription: "Sipho went from R8k/month security to R78k/month React developer in 18 months. His exact roadmap.", linkedCourse: "React + Next.js: Build & Deploy Real Projects" },
  { day: 6, date: addDays(startDate, 2), category: "B", title: "South African Plumbers: How to Earn R35,000+/Month Going Freelance in 2026", targetKeyword: "freelance plumber South Africa", metaDescription: "SA is critically short of plumbers. Freelancers with online presence earn R35k-R75k/month.", linkedCourse: "Plumbing Business: AI Tools & Digital Marketing" },
  { day: 7, date: addDays(startDate, 3), category: "F", title: "How to Write a Freelance Proposal That Wins: SA-Specific Template + Examples", targetKeyword: "freelance proposal template South Africa", metaDescription: "Complete SA proposal template with psychology-backed structure and real before-and-after examples.", linkedCourse: "High-Converting Copywriting" },
  { day: 8, date: addDays(startDate, 3), category: "A", title: "ChatGPT Prompts That SA Copywriters Use to Charge R5,000 Per Article", targetKeyword: "ChatGPT prompts copywriting South Africa", metaDescription: "The exact ChatGPT prompts Johannesburg copywriters use to produce R5,000 articles in 90 minutes.", linkedCourse: "AI Prompt Engineering Masterclass" },
  { day: 9, date: addDays(startDate, 4), category: "N", title: "SA Freelance Market Report Q1 2026: Which Skills Grew, Which Declined", targetKeyword: "SA freelance market 2026", metaDescription: "Q1 2026 SA freelance market data: top growing skills, declining categories, income trends, platform shifts.", linkedCourse: "" },
  { day: 10, date: addDays(startDate, 4), category: "T", title: "How to Invoice as a South African Freelancer: SARS-Compliant Template (Free Download)", targetKeyword: "freelance invoice template South Africa SARS", metaDescription: "SARS-compliant invoice template for SA freelancers + what must appear on every invoice to stay legal.", linkedCourse: "" },
  { day: 11, date: addDays(startDate, 5), category: "H", title: "Why Solidity Developers Earn R120,000+/Month in South Africa (And How to Become One)", targetKeyword: "Solidity developer South Africa salary", metaDescription: "Only 800 Solidity developers in SA. Demand is exploding. The exact 12-month path to your first blockchain job.", linkedCourse: "Blockchain Development: Solidity & Web3" },
  { day: 12, date: addDays(startDate, 5), category: "F", title: "How to Set Your Freelance Rate in South Africa (Without Undercharging)", targetKeyword: "freelance rates South Africa 2026", metaDescription: "Stop undercharging. The market-rate formula for SA freelancers across 20 categories with real data.", linkedCourse: "High-Ticket Sales: Closing R50k+ Projects" },
  { day: 13, date: addDays(startDate, 6), category: "G", title: "CSD Registration Step-by-Step: How SA Freelancers Get on the Government Supplier Database", targetKeyword: "CSD registration South Africa freelancer", metaDescription: "Exact step-by-step CSD registration guide for SA freelancers. With screenshots and common mistake list.", linkedCourse: "" },
  { day: 14, date: addDays(startDate, 6), category: "A", title: "Midjourney v6 for SA Graphic Designers: 20 Prompts That Win Clients", targetKeyword: "Midjourney prompts graphic designer South Africa", metaDescription: "20 SA-specific Midjourney prompts that generate client-ready visuals. Cut design time by 70%.", linkedCourse: "Figma for Freelancers" },
  { day: 15, date: addDays(startDate, 7), category: "S", title: "How Lerato Built a R85,000/Month Design Agency from Her Soweto Flat", targetKeyword: "design agency success story South Africa", metaDescription: "Lerato started with Canva and a R499 laptop. Now she runs a 4-person design agency from Soweto.", linkedCourse: "Figma for Freelancers" },
  { day: 16, date: addDays(startDate, 7), category: "B", title: "SA Electricians: The Digital Marketing Blueprint to Earn R45,000+/Month Freelancing", targetKeyword: "freelance electrician South Africa marketing", metaDescription: "Electricians who market online earn 2.5x more than those who don't. The complete digital blueprint.", linkedCourse: "Plumbing Business: AI Tools & Digital Marketing" },
  { day: 17, date: addDays(startDate, 8), category: "T", title: "SARS eFiling for Freelancers: A Complete 2026 Step-by-Step Guide", targetKeyword: "SARS eFiling freelancer guide South Africa", metaDescription: "How to complete your ITR12 on SARS eFiling as a freelancer. With screenshots for every step.", linkedCourse: "" },
  { day: 18, date: addDays(startDate, 8), category: "H", title: "Data Science in South Africa: Salary Data, Top Skills, and the Fastest Learning Path", targetKeyword: "data science South Africa salary 2026", metaDescription: "SA data scientists earn R45k-R95k/month. Exact skills, learning path, and top clients revealed.", linkedCourse: "Data Analytics with Python & SQL" },
  { day: 19, date: addDays(startDate, 9), category: "F", title: "How to Get Your First Freelance Client in South Africa (With No Portfolio)", targetKeyword: "first freelance client South Africa no portfolio", metaDescription: "7 proven methods SA freelancers use to land their first client — no portfolio, no experience needed.", linkedCourse: "High-Converting Copywriting" },
  { day: 20, date: addDays(startDate, 9), category: "A", title: "No-Code AI Automations That SA Virtual Assistants Use to Handle 3x More Clients", targetKeyword: "no-code AI automation virtual assistant South Africa", metaDescription: "Zapier + Make.com automations that SA VAs use to triple their client capacity without extra hours.", linkedCourse: "No-Code Automation: Zapier & Make.com" },
  { day: 21, date: addDays(startDate, 10), category: "G", title: "5 Government Tenders SA Freelancers Can Win Right Now (Under R500,000)", targetKeyword: "government tenders freelancers South Africa 2026", metaDescription: "5 active government tender categories perfect for SA freelancers — websites, training, photography, research.", linkedCourse: "" },
  { day: 22, date: addDays(startDate, 10), category: "N", title: "Fiverr vs Upwork vs FreelanceSkills: Which Platform Pays More for SA Freelancers in 2026", targetKeyword: "Fiverr vs Upwork South Africa freelancers", metaDescription: "Head-to-head comparison: fees, client quality, payment methods, and actual income data for SA freelancers.", linkedCourse: "" },
  { day: 23, date: addDays(startDate, 11), category: "S", title: "R0 to R60,000/Month: Thabo's 2-Year Copywriting Journey in Pretoria", targetKeyword: "copywriting success story South Africa Pretoria", metaDescription: "Thabo was unemployed in 2024. Today he earns R60k/month writing for SA and international clients.", linkedCourse: "High-Converting Copywriting" },
  { day: 24, date: addDays(startDate, 11), category: "B", title: "Freelance Tiling and Flooring: How to Charge R8,000/Day and Keep Your Diary Full", targetKeyword: "freelance tiler South Africa income", metaDescription: "SA tilers are in massive demand. The marketing system that keeps your diary 6 weeks ahead.", linkedCourse: "" },
  { day: 25, date: addDays(startDate, 12), category: "H", title: "Cybersecurity Consulting in SA: POPIA Compliance Made You Rich (If You Know How)", targetKeyword: "cybersecurity consulting South Africa POPIA", metaDescription: "Every SA business must comply with POPIA. Cybersecurity consultants billing R45k-R85k/month explain how.", linkedCourse: "" },
  { day: 26, date: addDays(startDate, 12), category: "T", title: "Can You Claim Your Home Office? The SARS Rules for SA Freelancers Explained", targetKeyword: "home office deduction South Africa SARS", metaDescription: "The exact SARS requirements to claim your home office as a deduction — and what NOT to do.", linkedCourse: "" },
  { day: 27, date: addDays(startDate, 13), category: "A", title: "How to Use Claude AI to Write R50,000 Consulting Reports in 4 Hours", targetKeyword: "Claude AI consulting reports South Africa", metaDescription: "SA management consultants using Claude 3.5 Sonnet are delivering R50k reports 4x faster. The exact workflow.", linkedCourse: "AI Prompt Engineering Masterclass" },
  { day: 28, date: addDays(startDate, 13), category: "F", title: "The SA Freelancer's Complete Guide to Contracts (With Free Templates)", targetKeyword: "freelance contract template South Africa", metaDescription: "Every SA freelancer needs a contract. Free templates for web dev, design, copywriting, and consulting.", linkedCourse: "" },
  { day: 29, date: addDays(startDate, 14), category: "G", title: "B-BBEE for Freelancers: How to Get Certified and Win More Government Work", targetKeyword: "B-BBEE certification freelancer South Africa", metaDescription: "B-BBEE certification adds 12-20 preference points in government tenders. Here's how to get it.", linkedCourse: "" },
  { day: 30, date: addDays(startDate, 14), category: "H", title: "UX Design in South Africa: How to Earn R55,000/Month Designing for Banks and Fintechs", targetKeyword: "UX designer salary South Africa", metaDescription: "SA fintech boom = massive UX designer demand. The skills, tools, and clients that pay R55k+/month.", linkedCourse: "Figma for Freelancers" },

  // ═══════════════════════════════
  // MONTH 2: MAY 2026 (Days 31-90)
  // ═══════════════════════════════
  { day: 31, date: addDays(startDate, 15), category: "A", title: "Perplexity AI for SA Researchers: Cut Research Time by 80% and Charge Premium", targetKeyword: "Perplexity AI research South Africa", metaDescription: "SA research consultants using Perplexity AI deliver projects 5x faster. The complete workflow.", linkedCourse: "AI Prompt Engineering Masterclass" },
  { day: 32, date: addDays(startDate, 15), category: "S", title: "The Cape Town Developer Who Earns £75/Hour From the UK (While Living on SA Costs)", targetKeyword: "Cape Town developer UK clients freelance", metaDescription: "Amanda works from Cape Town, bills UK clients at £75/hour, and lives on 30% of her income. Her story.", linkedCourse: "React + Next.js: Build & Deploy Real Projects" },
  { day: 33, date: addDays(startDate, 16), category: "B", title: "HVAC Technicians: The Online Marketing System That Books You 3 Months Ahead", targetKeyword: "freelance HVAC technician South Africa marketing", metaDescription: "SA HVAC technicians with Google My Business and WhatsApp funnels are booked 3 months out. Here's how.", linkedCourse: "" },
  { day: 34, date: addDays(startDate, 16), category: "N", title: "The SA Loadshedding Side Effect: 12 New Freelance Opportunities Created by Eskom", targetKeyword: "load shedding freelance opportunities South Africa", metaDescription: "Every energy crisis creates new business categories. 12 freelance income streams born from SA's energy crisis.", linkedCourse: "" },
  { day: 35, date: addDays(startDate, 17), category: "T", title: "VAT Registration for SA Freelancers: When to Register, How to File, and the Benefits", targetKeyword: "VAT registration freelancer South Africa", metaDescription: "Should you register for VAT voluntarily? The complete breakdown for SA freelancers at every income level.", linkedCourse: "" },
  { day: 36, date: addDays(startDate, 17), category: "H", title: "YouTube Content Strategy: How SA Creators Earn R45,000+/Month Without Going Viral", targetKeyword: "YouTube income South Africa creator", metaDescription: "Going viral is not the strategy. SA YouTubers earning R45k+/month use a very different approach.", linkedCourse: "Video Editing: DaVinci Resolve & Premiere" },
  { day: 37, date: addDays(startDate, 18), category: "F", title: "Freelance Rate Negotiation: Exact Scripts for Getting What You're Worth in SA", targetKeyword: "freelance rate negotiation South Africa", metaDescription: "Word-for-word negotiation scripts for SA freelancers. Double your rates without losing clients.", linkedCourse: "High-Ticket Sales: Closing R50k+ Projects" },
  { day: 38, date: addDays(startDate, 18), category: "A", title: "ElevenLabs AI Voiceover: The R25,000/Month Side Business for SA Freelancers", targetKeyword: "ElevenLabs AI voiceover freelance South Africa", metaDescription: "SA freelancers offering AI voiceover are earning R15k-R25k/month in a new market. Complete guide.", linkedCourse: "" },
  { day: 39, date: addDays(startDate, 19), category: "G", title: "Writing Government Tender Documents That Win: The Technical Proposal Framework", targetKeyword: "government tender proposal writing South Africa", metaDescription: "The exact framework that wins government tenders in SA — structure, language, common disqualifiers.", linkedCourse: "High-Converting Copywriting" },
  { day: 40, date: addDays(startDate, 19), category: "S", title: "From NSFAS to R95,000/Month: Precious's Cybersecurity Consulting Journey", targetKeyword: "cybersecurity consulting success story South Africa", metaDescription: "Precious dropped out of varsity in 2023. In 2026 she's a R95k/month cybersecurity consultant. The full story.", linkedCourse: "" },
  { day: 41, date: addDays(startDate, 20), category: "H", title: "SAP Consultant in South Africa: The R100,000+/Month Opportunity No One Talks About", targetKeyword: "SAP consultant South Africa salary", metaDescription: "SA SAP consultants are billing R100k-R150k/month for corporates. The exact certification path.", linkedCourse: "" },
  { day: 42, date: addDays(startDate, 20), category: "B", title: "Freelance Painter: How to Build a R30,000/Month Business with Just WhatsApp and Google", targetKeyword: "freelance painter South Africa income", metaDescription: "SA painters using WhatsApp marketing and Google My Business are booked solid at R2,500-R4,500/day.", linkedCourse: "" },
  { day: 43, date: addDays(startDate, 21), category: "A", title: "Notion AI for Freelance Project Management: Never Miss a Deadline Again", targetKeyword: "Notion AI freelancer project management", metaDescription: "How SA freelancers use Notion AI to manage multiple clients, track projects, and automate reporting.", linkedCourse: "No-Code Automation: Zapier & Make.com" },
  { day: 44, date: addDays(startDate, 21), category: "T", title: "Business vs Personal Bank Account: Why SA Freelancers Must Separate Them", targetKeyword: "business bank account freelancer South Africa", metaDescription: "Using your personal account for freelance income is a SARS audit risk. The legal and practical case for separation.", linkedCourse: "" },
  { day: 45, date: addDays(startDate, 22), category: "F", title: "The Freelance Emergency Fund: How Much SA Freelancers Need and How to Build It", targetKeyword: "freelance emergency fund South Africa", metaDescription: "Income variability is the #1 freelance stress. The formula for a financial buffer that gives you freedom.", linkedCourse: "" },
  { day: 46, date: addDays(startDate, 22), category: "N", title: "Africa's Tech Freelance Boom: Where SA Stands vs Nigeria, Kenya, and Egypt", targetKeyword: "Africa tech freelance market South Africa", metaDescription: "SA vs Nigeria vs Kenya: freelance market size, growth rates, dominant skills, and where the money flows.", linkedCourse: "" },
  { day: 47, date: addDays(startDate, 23), category: "H", title: "Power BI Consultant: How SA Data Analysts Earn R65,000/Month from Corporates", targetKeyword: "Power BI consultant South Africa", metaDescription: "SA corporates pay premium for Power BI expertise. The certification path and top client acquisition strategies.", linkedCourse: "Data Analytics with Python & SQL" },
  { day: 48, date: addDays(startDate, 23), category: "G", title: "5 Biggest Mistakes SA Freelancers Make on Government Tenders (And How to Fix Them)", targetKeyword: "government tender mistakes South Africa freelancers", metaDescription: "These 5 mistakes cause 80% of government tender disqualifications. Check your bids against this list.", linkedCourse: "" },
  { day: 49, date: addDays(startDate, 24), category: "S", title: "The Durban Accountant Who Built a R120,000/Month Remote Practice Serving UK Clients", targetKeyword: "South African accountant UK clients remote", metaDescription: "Nkosinathi serves UK small businesses as a remote accountant. His income: R120k/month. His story.", linkedCourse: "" },
  { day: 50, date: addDays(startDate, 24), category: "A", title: "AI Content Calendar: How to Plan 30 Days of Client Content in 2 Hours", targetKeyword: "AI content calendar freelancer", metaDescription: "The exact ChatGPT workflow SA social media managers use to plan 30 days of content for 5 clients simultaneously.", linkedCourse: "AI Prompt Engineering Masterclass" },
  { day: 51, date: addDays(startDate, 25), category: "B", title: "Landscape Gardener to Freelance Landscaping Business: R40,000/Month in 90 Days", targetKeyword: "freelance landscaping business South Africa", metaDescription: "Johan left his landscaping job in January. By April he'd replaced his income. The exact system.", linkedCourse: "" },
  { day: 52, date: addDays(startDate, 25), category: "T", title: "How to Handle a SARS Audit as a Freelancer: What to Keep, What to Show, What to Say", targetKeyword: "SARS audit freelancer South Africa", metaDescription: "A SARS audit is not the end. Here's what to have ready, how to respond, and how to avoid one.", linkedCourse: "" },
  { day: 53, date: addDays(startDate, 26), category: "H", title: "Technical SEO in 2026: The SA Agency Strategy That Earns R50,000/Month", targetKeyword: "technical SEO South Africa 2026", metaDescription: "Technical SEO pays 2x more than content SEO. The SA agency skill set that commands R50k/month.", linkedCourse: "Content Marketing: Build Authority" },
  { day: 54, date: addDays(startDate, 26), category: "F", title: "LinkedIn for SA Freelancers: The 30-Day Profile Optimization That Gets Inbound Clients", targetKeyword: "LinkedIn freelancer South Africa profile", metaDescription: "30-day LinkedIn optimization that generates inbound leads for SA freelancers. Day-by-day plan.", linkedCourse: "Personal Branding: Become Unforgettable" },
  { day: 55, date: addDays(startDate, 27), category: "A", title: "Zapier Automations for SA Freelancers: 10 Workflows That Save 20 Hours/Month", targetKeyword: "Zapier automation freelancer South Africa", metaDescription: "10 Zapier automations that eliminate 20 hours of admin for SA freelancers. With step-by-step setup.", linkedCourse: "No-Code Automation: Zapier & Make.com" },
  { day: 56, date: addDays(startDate, 27), category: "N", title: "Google's AI Overviews Are Killing SEO Traffic: How SA Freelancers Adapt", targetKeyword: "Google AI overviews SEO impact 2026", metaDescription: "Google's AI overviews cut organic clicks by 25-40%. How SA SEO freelancers are pivoting and growing revenue.", linkedCourse: "Content Marketing: Build Authority" },
  { day: 57, date: addDays(startDate, 28), category: "G", title: "Municipal Tender Opportunities: How to Win City Contracts as a Solo Freelancer", targetKeyword: "municipal tender opportunities South Africa freelancer", metaDescription: "Cities and municipalities procure millions in freelance-suitable services. How to access them.", linkedCourse: "" },
  { day: 58, date: addDays(startDate, 28), category: "S", title: "From Teacher to R55,000/Month E-Learning Developer: Zanele's Story", targetKeyword: "e-learning developer success story South Africa", metaDescription: "Zanele was a Limpopo teacher. Now she builds e-learning content for SA corporates at R55k/month.", linkedCourse: "Video Editing: DaVinci Resolve & Premiere" },
  { day: 59, date: addDays(startDate, 29), category: "H", title: "Motion Graphics and Animation: The R60,000/Month Freelance Niche in SA", targetKeyword: "motion graphics freelance South Africa", metaDescription: "Motion design for corporate video is exploding in SA. Rates, clients, tools, and the learning path.", linkedCourse: "Video Editing: DaVinci Resolve & Premiere" },
  { day: 60, date: addDays(startDate, 29), category: "F", title: "How to Fire a Bad Client Professionally: SA Freelancer's Complete Guide", targetKeyword: "fire freelance client South Africa", metaDescription: "Bad clients cost more than they pay. How to end engagements professionally and protect your reputation.", linkedCourse: "" },

  // Months 3-8: Days 61-480 (abbreviated — full content generated per AI system prompt)
  { day: 61, date: addDays(startDate, 30), category: "A", title: "Custom GPTs for SA Freelancers: Build Your Own AI Assistant in 1 Hour", targetKeyword: "custom GPT freelancer South Africa", metaDescription: "Build a custom ChatGPT that knows your clients, rates, and niche. No coding required.", linkedCourse: "AI Prompt Engineering Masterclass" },
  { day: 62, date: addDays(startDate, 30), category: "T", title: "Retirement Annuity for SA Freelancers: Save Tax While Building Wealth", targetKeyword: "retirement annuity freelancer South Africa", metaDescription: "RA contributions reduce your taxable income. The SA freelancer's guide to tax-efficient retirement.", linkedCourse: "" },
  { day: 63, date: addDays(startDate, 31), category: "H", title: "Fractional CTO: How SA Tech Leaders Earn R150,000+/Month as Part-Time Executives", targetKeyword: "fractional CTO South Africa", metaDescription: "Fractional CTOs serve 3-5 companies simultaneously, billing R50k/month each. How to position yourself.", linkedCourse: "" },
  { day: 64, date: addDays(startDate, 31), category: "G", title: "SITA Tenders: How SA IT Freelancers Access State IT Procurement", targetKeyword: "SITA tenders IT freelancer South Africa", metaDescription: "The State IT Agency manages billions in IT procurement. How freelance developers access SITA contracts.", linkedCourse: "React + Next.js: Build & Deploy Real Projects" },
  { day: 65, date: addDays(startDate, 32), category: "S", title: "The Bloemfontein Bookkeeper Who Serves 40 Clients Remotely at R85,000/Month", targetKeyword: "remote bookkeeper South Africa success story", metaDescription: "Martie serves 40 clients remotely from Bloemfontein using Xero and WhatsApp. Monthly income: R85k.", linkedCourse: "" },
  { day: 66, date: addDays(startDate, 32), category: "B", title: "Pool Service Business: How SA Freelancers Build R30,000/Month Maintenance Contracts", targetKeyword: "pool service freelance South Africa", metaDescription: "Pool maintenance subscriptions — R2,500/month per pool, 12 pools = R30k/month. The complete setup.", linkedCourse: "" },
  { day: 67, date: addDays(startDate, 33), category: "A", title: "AI Translation: How SA Freelancers Earn R25,000/Month Translating to/from African Languages", targetKeyword: "AI translation African languages freelance", metaDescription: "Combining AI tools with human expertise in Zulu, Xhosa, Sotho — the growing high-value translation market.", linkedCourse: "AI Prompt Engineering Masterclass" },
  { day: 68, date: addDays(startDate, 33), category: "F", title: "The Perfect Freelance Portfolio: What to Include for SA Clients vs International Clients", targetKeyword: "freelance portfolio South Africa 2026", metaDescription: "SA clients and international clients have different expectations. Build one portfolio that wins both.", linkedCourse: "Personal Branding: Become Unforgettable" },
  { day: 69, date: addDays(startDate, 34), category: "N", title: "Meta AI vs Google Gemini vs ChatGPT: Which is Best for SA Freelancers in 2026?", targetKeyword: "Meta AI vs ChatGPT vs Gemini South Africa", metaDescription: "Head-to-head test for SA freelance use cases — content, coding, research, design briefs, and admin.", linkedCourse: "AI Prompt Engineering Masterclass" },
  { day: 70, date: addDays(startDate, 34), category: "T", title: "Medical Aid as a Tax Deduction: What SA Freelancers Can and Can't Claim", targetKeyword: "medical aid tax deduction freelancer South Africa", metaDescription: "Medical aid credits for SA freelancers — how much you can claim and how to optimize the benefit.", linkedCourse: "" },
  // Continue the pattern for 70-480...
  { day: 71, date: addDays(startDate, 35), category: "H", title: "Shopify Development in SA: The R75,000/Month E-Commerce Freelance Path", targetKeyword: "Shopify developer South Africa", metaDescription: "SA e-commerce is growing 35% annually. Shopify developers are overwhelmed with demand at R75k/month.", linkedCourse: "React + Next.js: Build & Deploy Real Projects" },
  { day: 72, date: addDays(startDate, 35), category: "G", title: "Writing RFP Responses That Win: The Government Tender Language Guide for SA Freelancers", targetKeyword: "RFP response writing South Africa government", metaDescription: "Government tender language is specific. The exact phrasing, structure, and tone that wins SA government RFPs.", linkedCourse: "High-Converting Copywriting" },
  { day: 73, date: addDays(startDate, 36), category: "S", title: "How Mpho Scaled His Security Company Using WhatsApp and Google Ads to R600,000/Month", targetKeyword: "security company digital marketing South Africa", metaDescription: "Mpho went from 3 guards to 80 staff using basic digital marketing. The exact system, step by step.", linkedCourse: "Google Ads Mastery" },
  { day: 74, date: addDays(startDate, 36), category: "A", title: "Bing Image Creator and Adobe Firefly: The Free AI Design Stack for SA Freelancers", targetKeyword: "free AI design tools South Africa", metaDescription: "Professional AI design without monthly subscriptions. The complete free stack for SA graphic designers.", linkedCourse: "Figma for Freelancers" },
  { day: 75, date: addDays(startDate, 37), category: "B", title: "Freelance Pest Control: R28,000/Month with Google My Business and WhatsApp Funnels", targetKeyword: "freelance pest control South Africa", metaDescription: "The pest control freelancer system: online booking, WhatsApp automation, recurring contracts.", linkedCourse: "" },
  { day: 76, date: addDays(startDate, 37), category: "F", title: "Productivity Systems for SA Freelancers: Work 6 Hours and Earn R50,000+", targetKeyword: "freelancer productivity system South Africa", metaDescription: "Top-earning SA freelancers don't work more hours. They use systems. The exact daily framework.", linkedCourse: "Time Management & Productivity" },
  { day: 77, date: addDays(startDate, 38), category: "T", title: "SARS Disputes: How to Object to an Assessment as a South African Freelancer", targetKeyword: "SARS dispute objection South Africa freelancer", metaDescription: "If SARS assesses you incorrectly, you have 30 days to object. The exact process and what to include.", linkedCourse: "" },
  { day: 78, date: addDays(startDate, 38), category: "N", title: "What NHI Means for SA Healthcare Freelancers: Opportunities and Risks in 2026", targetKeyword: "NHI healthcare freelancer South Africa", metaDescription: "National Health Insurance creates new demand for healthcare IT, consulting, and administration freelancers.", linkedCourse: "" },
  { day: 79, date: addDays(startDate, 39), category: "H", title: "AWS Certification in SA: The R90,000/Month Cloud Architect Opportunity", targetKeyword: "AWS certification South Africa", metaDescription: "AWS Solutions Architect certification + 2 years experience = R90k/month freelance income. The path.", linkedCourse: "" },
  { day: 80, date: addDays(startDate, 39), category: "G", title: "Tender Calendar 2026: Every Government Procurement Cycle SA Freelancers Must Know", targetKeyword: "government tender calendar 2026 South Africa", metaDescription: "Government tenders follow predictable annual cycles. Plan your proposals 3 months ahead using this calendar.", linkedCourse: "" },
];

// ═══════════════════════════════════════════════════════════════
// EDITORIAL CALENDAR SUMMARY STATS
// ═══════════════════════════════════════════════════════════════

export const CALENDAR_STATS = {
  totalArticles: 480,
  durationMonths: 8,
  articlesPerDay: 2,
  categories: {
    "AI Tools": 80,
    "SA Tax & Invoicing": 60,
    "Government Tenders": 55,
    "High-Income Skills": 85,
    "Success Stories": 55,
    "Blue-Collar Freelance": 50,
    "Industry News": 45,
    "Freelance Fundamentals": 50,
  },
  publishedInSystem: 7,
  plannedNotYetWritten: 473,
};

// ═══════════════════════════════════════════════════════════════
// AI CONTENT GENERATION SYSTEM PROMPT
// Use this prompt with ChatGPT-4o or Claude 3.5 Sonnet to
// auto-generate the remaining 473 articles on the calendar
// ═══════════════════════════════════════════════════════════════

export const AI_CONTENT_SYSTEM_PROMPT = `
# FreelanceSkills.net Content Generation System Prompt
# Version 2.0 — April 2026
# Generates 1,500-2,000 word articles for FreelanceSkills.net

You are the senior content editor for FreelanceSkills.net — the #1 freelance platform in South Africa, owned by Bernet Labuschagne (CIPC 2026/070509/09). Your job is to write world-class blog articles that make FreelanceSkills the most authoritative freelance knowledge hub on Earth.

## BRAND VOICE

- **Elon Musk-level direct**: No fluff. No generic advice. Only concrete, data-backed, actionable insights.
- **SA-specific**: Always ground content in the South African context — rand amounts, SARS, specific SA cities, SA companies, SA-specific challenges.
- **Earnings-obsessed**: Every article must include real earnings data, hourly rates, or monthly income projections in rand.
- **Empowering**: Our mission is to end youth unemployment in Africa. Tone = possibility + urgency.
- **No corporate speak**: Write like a trusted mentor, not a marketing department.

## ARTICLE STRUCTURE (1,500-2,000 words)

1. **Hook headline** — Specific number or bold claim in the title
2. **Lede** — 2-3 sentences. Big claim + why the reader should care right now.
3. **SA context** — Why this topic matters specifically in South Africa
4. **Main content** — Use subheadings every 200-300 words. Include tables, bullet points, numbered lists.
5. **Real earnings data** — Minimum 3 specific income figures in rand with source or methodology
6. **Step-by-step section** — At least one actionable "how to" section the reader can execute this week
7. **Academy CTA** — Link to relevant FreelanceSkills Academy course naturally within content
8. **Jobs CTA** — End with: "Ready to apply these skills? [Browse live jobs →](/jobs)"

## MANDATORY ELEMENTS IN EVERY ARTICLE

- ✅ At least 3 specific rand amounts (R12,000/month, R850/hour, etc.)
- ✅ At least 1 SA city mentioned (Johannesburg, Cape Town, Durban, Pretoria, etc.)
- ✅ At least 1 internal link to /academy/catalog or a specific course
- ✅ At least 1 internal link to /jobs
- ✅ A markdown table with comparison data (income, tools, skills, rates, etc.)
- ✅ A practical "Start today" action the reader can do immediately
- ✅ SEO-optimized H2 and H3 headings with target keyword included

## FORMAT REQUIREMENTS

- Output in Markdown
- Use ## for H2, ### for H3
- Bold key numbers and action words with **bold**
- Use > blockquote for key stats or quotes
- Use --- for section breaks
- Use | tables | with | pipes | for data

## SEO REQUIREMENTS

- Target keyword appears in first paragraph
- Target keyword in at least 2 subheadings
- Meta description: 140-160 characters, includes keyword and value proposition
- Internal links: minimum 2 per article (Academy + Jobs)

## CATEGORIES AND TONE ADJUSTMENTS

**AI Tools**: Technical but accessible. Include exact prompts, workflows, tool names, costs.
**SA Tax & Invoicing**: Accurate, clear, not scary. Always include "consult a tax practitioner" disclaimer for complex situations.
**Government Tenders**: Process-focused, step-by-step. Include forms, deadlines, portals.
**High-Income Skills**: Aspirational but data-grounded. Specific skills, certifications, learning paths.
**Success Stories**: First-person narrative style. Specific income milestones, timeline, turning points.
**Blue-Collar Freelance**: Practical, working-class respectful. Digital marketing + traditional trade skills.
**Industry News**: Analytical, factual, forward-looking. What does this mean for SA freelancers?
**Fundamentals**: Empowering, practical, beginner-inclusive. Templates and frameworks included.

## EXAMPLE USAGE

User prompt: "Write an article for FreelanceSkills.net with title: 'How SA Virtual Assistants Use AI to Handle 5 Clients at Once' targeting keyword 'virtual assistant South Africa AI' in the High-Income Skills category"

Generate the full 1,500-2,000 word article following all the above requirements.
`;
