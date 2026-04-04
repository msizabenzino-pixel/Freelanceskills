// FreelanceSkills Academy — Full Curriculum for 15 Courses
// Modelled after Coursera / LinkedIn Learning structure

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number; // 0-indexed
}

export interface Lesson {
  id: string;
  title: string;
  type: "text" | "video" | "quiz";
  duration: string;
  content: string;
  quiz?: QuizQuestion[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  milestone: string; // badge label
  milestoneEmoji: string;
  lessons: Lesson[];
}

export interface Course {
  id: number;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  earningsLift: string;
  skills: string[];
  isFree: boolean;
  rating: number;
  enrolled: number;
  color: string; // tailwind gradient class
  emoji: string;
  modules: Module[];
}

export const COURSES: Course[] = [
  {
    id: 1,
    slug: "ai-prompt-engineering",
    title: "AI Prompt Engineering Masterclass",
    tagline: "Master ChatGPT, Claude & Grok to 10× your freelance output.",
    description: "Learn how to craft prompts that produce professional-quality work in seconds. This course transforms how you use AI tools for proposals, content, code, and client work.",
    category: "AI & Machine Learning",
    difficulty: "Beginner",
    duration: "4 hours",
    earningsLift: "+45%",
    skills: ["AI Prompting", "ChatGPT", "Claude", "Productivity"],
    isFree: true,
    rating: 4.9,
    enrolled: 12400,
    color: "from-violet-600 to-purple-700",
    emoji: "🤖",
    modules: [
      {
        id: "m1",
        title: "Module 1: Foundations of AI Prompting",
        description: "Understand how large language models think and respond.",
        milestone: "Prompt Initiate",
        milestoneEmoji: "🌱",
        lessons: [
          { id: "l1-1", title: "How LLMs Actually Work", type: "text", duration: "15 min", content: "Large language models (LLMs) predict the next word based on patterns in billions of texts. Understanding this changes how you prompt.\n\n**The Prediction Engine**\nEvery AI response is a sequence of word predictions. The more specific and contextual your prompt, the more accurate those predictions.\n\n**Key concepts:**\n- Temperature: Controls creativity vs. precision\n- Tokens: The unit of language AI processes (~0.75 words)\n- Context window: How much text the AI can 'remember'\n\n**Why this matters for freelancers:**\nWhen you write 'write a proposal', the AI has no context. When you write 'Write a 300-word proposal for a React developer with 5 years experience, targeting a fintech startup in Cape Town, for a 6-week dashboard project at R25,000', it has everything it needs.\n\n**Action:** Before your next AI interaction, write out exactly what you need, who it's for, and what format it should take." },
          { id: "l1-2", title: "The CRAFT Framework", type: "text", duration: "20 min", content: "CRAFT is your blueprint for every prompt you'll ever write.\n\n**C — Context**\nSet the scene. Who are you? Who is the audience? What is the situation?\n\nExample: 'You are a senior copywriter with 10 years of B2B SaaS experience. I am a freelance developer targeting mid-sized Cape Town businesses.'\n\n**R — Role**\nAssign the AI a specific expert role. This activates the relevant training patterns.\n\nExample: 'Act as a senior UX designer who specialises in mobile-first financial apps.'\n\n**A — Action**\nBe explicit about what you want. Use strong verbs: Write, Analyse, Summarise, Create, Generate, Rewrite, List, Compare.\n\n**F — Format**\nSpecify output structure. Bullet list? Numbered steps? HTML table? JSON? 3 paragraphs?\n\n**T — Tone**\nProfessional? Casual? Persuasive? Technical? Friendly?\n\n**Exercise:** Rewrite this weak prompt using CRAFT:\n'Help me with my LinkedIn profile' →" },
          { id: "l1-3", title: "Quiz: Foundations", type: "quiz", duration: "10 min", content: "Test your knowledge of AI fundamentals.", quiz: [
            { q: "What does 'temperature' control in AI outputs?", options: ["The response speed", "Creativity vs. precision", "The number of words", "The language used"], answer: 1 },
            { q: "Which CRAFT element tells the AI what expert role to play?", options: ["Context", "Role", "Action", "Format"], answer: 1 },
            { q: "Why is a specific prompt better than a vague one?", options: ["It's shorter", "It gives more prediction context", "AI prefers short prompts", "It uses fewer tokens"], answer: 1 },
          ]},
        ],
      },
      {
        id: "m2",
        title: "Module 2: Prompts for Freelance Work",
        description: "Practical prompt templates for proposals, contracts, and client communication.",
        milestone: "Prompt Practitioner",
        milestoneEmoji: "⚡",
        lessons: [
          { id: "l2-1", title: "Winning Proposals in 90 Seconds", type: "text", duration: "20 min", content: "**The Proposal Prompt Template:**\n\n```\nAct as an expert freelance [YOUR SKILL] consultant. Write a professional proposal for the following job:\n\nJob title: [JOB TITLE]\nClient industry: [INDUSTRY]\nProject scope: [DESCRIPTION]\nBudget: [BUDGET]\nTimeline: [TIMELINE]\n\nThe proposal should:\n- Open with a specific hook referencing their pain point\n- Demonstrate 2-3 relevant case studies (invent plausible ones)\n- Include a clear 3-phase delivery plan\n- End with a confident close and single CTA\n- Tone: professional but approachable\n- Length: 250-300 words\n```\n\n**Pro tip:** After generating, ask: 'What are the 3 weakest parts of this proposal? Rewrite them to be 30% more compelling.'\n\n**Your results:** Most freelancers see a 40-60% improvement in proposal response rate within 2 weeks of using this approach." },
          { id: "l2-2", title: "Client Email & Communication Templates", type: "text", duration: "15 min", content: "**Master Prompts for Every Client Situation:**\n\n**1. Scope Creep Response:**\n'Draft a professional email declining scope creep for a web development project. The client wants to add a mobile app to a website-only contract. Be firm but maintain the relationship. Include a quote offer for the additional work.'\n\n**2. Late Payment Follow-up:**\n'Write a 3-email sequence for a freelancer chasing an overdue R15,000 invoice. Email 1: friendly reminder (Day 7). Email 2: firm request (Day 14). Email 3: final notice with legal implications (Day 21).'\n\n**3. Project Update:**\n'Write a weekly project update email that covers: milestone achieved, work in progress, blockers (if any), next milestone ETA, and a confidence-building closing. Tone: professional and proactive.'\n\n**Practice task:** Use one of these templates for a real situation in your freelance work this week." },
          { id: "l2-3", title: "AI-Powered Research & Discovery", type: "text", duration: "15 min", content: "**Research Prompts That Save Hours:**\n\n**Client Research:**\n'Analyse this company description and identify their top 3 pain points that a [YOUR SERVICE] could solve. Then suggest 3 specific ways I could position my services to directly address those pain points: [PASTE COMPANY ABOUT PAGE]'\n\n**Competitor Analysis:**\n'Compare these 3 Cape Town web design agencies based on their website copy. Identify positioning gaps I could exploit as a freelancer. Agencies: [paste URLs or descriptions]'\n\n**Pricing Research:**\n'What is the typical market rate range for a [SKILL] freelancer with [YEARS] experience in South Africa? Break it down by: hourly rate, project rate (small/medium/large), and monthly retainer. Include ZAR figures.'\n\n**The key insight:** AI is your research intern that never sleeps. Every decision should be informed by data — let AI gather it." },
          { id: "l2-4", title: "Quiz: Freelance Prompts", type: "quiz", duration: "10 min", content: "Test your proposal and communication prompt skills.", quiz: [
            { q: "What should a winning proposal always open with?", options: ["Your rates", "A hook referencing their pain point", "Your qualifications", "A greeting"], answer: 1 },
            { q: "What does the Scope Creep Response prompt help you do?", options: ["Increase your scope", "Firmly decline extra work while maintaining the relationship", "Accept all client requests", "Cancel the project"], answer: 1 },
            { q: "Which AI capability saves the most time for freelancers?", options: ["Graphic design", "Research and discovery", "Time tracking", "Invoicing"], answer: 1 },
          ]},
        ],
      },
      {
        id: "m3",
        title: "Module 3: Advanced AI Workflows",
        description: "Chain prompts, use personas, and build automated content systems.",
        milestone: "Prompt Architect",
        milestoneEmoji: "🏗️",
        lessons: [
          { id: "l3-1", title: "Prompt Chaining: Building AI Pipelines", type: "text", duration: "25 min", content: "**Prompt chaining** means the output of one prompt becomes the input of the next. This creates powerful multi-step workflows.\n\n**Example: Content Creation Pipeline**\n\nStep 1 — Research: 'List the top 10 pain points for South African small business owners trying to hire freelancers online.'\n\nStep 2 — Hook: 'Using pain point #3 from above, write 5 different LinkedIn post opening hooks that would stop a scrolling business owner.'\n\nStep 3 — Full post: 'Using hook #2, write a complete 300-word LinkedIn post that positions me as the solution to this problem. I am a freelance React developer.'\n\nStep 4 — CTA: 'Add a call-to-action at the end of this post that drives comments rather than link clicks.'\n\n**Result:** 4 prompts = a fully researched, hooked, written, and optimised LinkedIn post in 5 minutes.\n\n**Your assignment:** Build a 4-step content chain for your specific freelance niche." },
          { id: "l3-2", title: "Building Your Personal AI Assistant", type: "text", duration: "20 min", content: "**The System Prompt: Your AI's DNA**\n\nIn tools like ChatGPT (Custom GPTs) or Claude Projects, you can set a permanent system prompt that shapes every response:\n\n```\nYou are my personal business assistant for my freelance [SKILL] business.\n\nAbout me:\n- Name: [NAME]\n- Specialisation: [WHAT YOU DO]\n- Target clients: [YOUR NICHE]\n- Location: [CITY], South Africa\n- Rate: R[X]/hour or R[Y]/project\n- Unique value proposition: [YOUR USP]\n\nYour job is to help me:\n1. Write compelling proposals\n2. Draft client communications\n3. Research potential clients\n4. Create content that showcases my expertise\n5. Solve technical problems in my work\n\nAlways use South African context, ZAR currency, and professional but approachable tone.\n```\n\n**Pro tip:** Update this system prompt every 3 months as your business evolves." },
        ],
      },
      {
        id: "m4",
        title: "Module 4: Tools & Integration",
        description: "Integrate AI into your daily freelance workflow for maximum impact.",
        milestone: "AI Power User",
        milestoneEmoji: "🚀",
        lessons: [
          { id: "l4-1", title: "The AI Toolkit for Freelancers", type: "text", duration: "20 min", content: "**Your Core AI Stack (mostly free):**\n\n**Writing & Content:**\n- ChatGPT 4o (proposals, emails, content)\n- Claude 3.5 Sonnet (analysis, long-form, coding)\n- Grammarly (polish and proofread)\n\n**Design:**\n- Midjourney / DALL-E (concept images, mockups)\n- Canva AI (quick graphics, presentations)\n\n**Code:**\n- GitHub Copilot (code completion)\n- Cursor (AI-first IDE)\n- v0 by Vercel (UI components from description)\n\n**Research:**\n- Perplexity AI (real-time web research)\n- NotebookLM (document analysis)\n\n**Automation:**\n- Zapier AI (connect tools)\n- Make.com (complex workflows)\n\n**The 80/20 rule:** Master ChatGPT and Claude first. They cover 80% of freelancer AI needs. Add others as your business grows.\n\n**ROI calculation:** If AI saves you 2 hours/day at R500/hour, that's R1,000/day = R22,000/month in recovered time." },
          { id: "l4-2", title: "Final Project: Build Your AI Workflow", type: "text", duration: "30 min", content: "**Congratulations on reaching the final lesson!**\n\nYour final project is to build a personal AI workflow document that covers:\n\n**1. Morning Routine (15 min):**\n- Check messages → AI drafts responses\n- Review job board → AI scores & prioritises\n\n**2. Proposal Writing:**\nDocument your 3-step prompt chain for winning proposals\n\n**3. Content Creation:**\nDocument your weekly content prompt pipeline (LinkedIn/Twitter)\n\n**4. Client Communication:**\nYour saved prompts for the 5 most common client scenarios\n\n**5. Research:**\nYour client research prompt template\n\n**Submit this document** to the FreelanceSkills community for feedback.\n\n**What's next:** You've completed the AI Prompt Engineering Masterclass. You now have the tools to be dramatically more productive than any competitor who isn't using AI. Use them every single day.\n\n*Certificate awaits you — claim it now!*" },
          { id: "l4-3", title: "Quiz: Tools & Integration", type: "quiz", duration: "10 min", content: "Final assessment for the AI Prompt Engineering course.", quiz: [
            { q: "What is the primary benefit of prompt chaining?", options: ["Shorter prompts", "Multi-step automated workflows", "Faster internet", "Fewer tokens"], answer: 1 },
            { q: "Which tool is best for real-time web research?", options: ["ChatGPT", "Midjourney", "Perplexity AI", "GitHub Copilot"], answer: 2 },
            { q: "If AI saves 2 hours/day at R500/hour, what is the monthly value?", options: ["R10,000", "R15,000", "R22,000", "R5,000"], answer: 2 },
          ]},
        ],
      },
    ],
  },
  {
    id: 2,
    slug: "no-code-automation",
    title: "No-Code Automation: Zapier & Make.com",
    tagline: "Automate your freelance business without writing a single line of code.",
    description: "Build powerful automated workflows that handle repetitive tasks, nurture leads, send invoices, and manage clients — all on autopilot.",
    category: "AI & Machine Learning",
    difficulty: "Beginner",
    duration: "3 hours",
    earningsLift: "+35%",
    skills: ["Zapier", "Make.com", "Automation", "Workflow"],
    isFree: true,
    rating: 4.8,
    enrolled: 8300,
    color: "from-orange-500 to-amber-600",
    emoji: "⚡",
    modules: [
      {
        id: "m1",
        title: "Module 1: Automation Fundamentals",
        description: "What automation is, why it matters, and the tools of the trade.",
        milestone: "Automation Initiate",
        milestoneEmoji: "🔌",
        lessons: [
          { id: "l1-1", title: "The Freelancer's Automation Manifesto", type: "text", duration: "15 min", content: "**Every hour you spend on admin is an hour you don't spend on billable work.**\n\nThe average freelancer spends 30% of their time on non-billable admin:\n- Following up on invoices: 2 hours/week\n- Scheduling meetings: 1.5 hours/week\n- Onboarding clients: 2 hours/week\n- Social media posting: 3 hours/week\n- Project updates: 1 hour/week\n\nTotal: ~10 hours/week × R500/hour = **R5,000/week lost to admin**\n\nAutomation tools cost R200-500/month. ROI is immediate.\n\n**What we automate:**\n1. Lead capture → CRM entry → Welcome email\n2. Invoice sent → Payment reminder sequence\n3. Project complete → Review request → Testimonial collection\n4. New job posted → Instant notification to your phone\n5. Blog post published → Auto-share to 5 platforms\n\n**What we DON'T automate:**\nStrategy, creativity, client relationships, and anything requiring judgment. Automate the routine; focus on the valuable." },
          { id: "l1-2", title: "Zapier vs. Make.com: Which to Use", type: "text", duration: "15 min", content: "**Zapier:**\n- Best for: Simple 2-step automations ('If this, then that')\n- Pros: Easiest to learn, 5000+ app integrations, excellent support docs\n- Cons: Gets expensive at scale, limited data transformation\n- Free tier: 100 tasks/month, 5 Zaps\n- SA freelancer use case: Invoice follow-up, CRM updates, email notifications\n\n**Make.com (formerly Integromat):**\n- Best for: Complex multi-step workflows with conditional logic\n- Pros: Visual workflow builder, powerful data handling, cheaper at scale\n- Cons: Steeper learning curve\n- Free tier: 1000 operations/month, unlimited scenarios\n- SA freelancer use case: Client onboarding sequences, multi-step proposal workflows\n\n**Recommendation for beginners:** Start with Zapier. It's the training wheels that build the automation mindset. Move to Make.com when your workflows get complex.\n\n**Both integrate with:** Gmail, Slack, WhatsApp (via Twilio), PayFast, Xero, Google Sheets, Notion, Airtable, and 5000+ more." },
          { id: "l1-3", title: "Quiz: Automation Basics", type: "quiz", duration: "10 min", content: "Test your automation fundamentals.", quiz: [
            { q: "How many hours/week does an average freelancer spend on admin?", options: ["2 hours", "5 hours", "10 hours", "20 hours"], answer: 2 },
            { q: "Which tool is better for beginners?", options: ["Make.com", "Zapier", "n8n", "Power Automate"], answer: 1 },
            { q: "What should you NOT automate?", options: ["Invoice reminders", "Social sharing", "Strategy and creativity", "Lead capture"], answer: 2 },
          ]},
        ],
      },
      {
        id: "m2",
        title: "Module 2: Building Your First Automations",
        description: "Hands-on: Build 5 automations that save time starting today.",
        milestone: "Automation Builder",
        milestoneEmoji: "🔧",
        lessons: [
          { id: "l2-1", title: "Automation #1: Lead Capture to CRM", type: "text", duration: "20 min", content: "**The Automation:** When someone fills in your contact form → Add to Google Sheets CRM → Send welcome email → Notify you on WhatsApp\n\n**Step-by-step (Zapier):**\n\n1. **Trigger:** Typeform / Google Forms / your website contact form\n2. **Action 1:** Google Sheets — Add Row (Name, Email, Message, Date, Source)\n3. **Action 2:** Gmail — Send Email (personalised welcome with next steps)\n4. **Action 3:** Twilio — Send WhatsApp message to you ('New lead from [NAME]: [MESSAGE SNIPPET]')\n\n**The template email:**\n```\nSubject: Great to connect, [FIRST_NAME]!\n\nHi [FIRST_NAME],\n\nThank you for reaching out. I've received your message about [SUBJECT] and will respond within 24 hours.\n\nIn the meantime, here's what most clients ask me about:\n[Link to your FAQ page]\n\nLooking forward to connecting.\n[Your name]\n```\n\n**Result:** Every lead captured, followed up within seconds, and you're notified instantly. Zero manual work." },
          { id: "l2-2", title: "Automation #2: Invoice & Payment Sequence", type: "text", duration: "20 min", content: "**The Automation:** Invoice sent → Wait 3 days → If unpaid, send reminder 1 → Wait 4 days → If still unpaid, send reminder 2 → Notify you\n\n**Tools:** Xero / FreshBooks + Zapier + Gmail\n\n**Trigger:** Invoice status changes to 'Sent' in Xero\n\n**Reminder email templates:**\n\n**Day 3 — Friendly:**\n'Hi [NAME], just a friendly reminder that invoice #[NUM] for R[AMOUNT] is due on [DATE]. If you have any questions, I'm here!'\n\n**Day 7 — Firm:**\n'Hi [NAME], invoice #[NUM] for R[AMOUNT] was due on [DATE] and remains outstanding. Please arrange payment today or let me know if there's an issue.'\n\n**Day 14 — Final:**\n'Hi [NAME], this is a final notice for invoice #[NUM]. Payment of R[AMOUNT] is now [X] days overdue. Please settle within 48 hours to avoid a late payment fee.'\n\n**The result:** Most invoices get paid by Day 7. You never have to send a chasing email manually again." },
          { id: "l2-3", title: "Automation #3: Social Media on Autopilot", type: "text", duration: "20 min", content: "**The Automation:** New blog post on your website → Auto-post to LinkedIn, Twitter/X, and Instagram caption (with image)\n\n**Tools:** WordPress / Ghost blog + Zapier + Buffer\n\n**Or simpler:** Buffer alone (schedule posts in batches)\n\n**The 1-hour content batch method:**\nEvery Monday, spend 1 hour writing 5 LinkedIn posts for the week. Schedule them in Buffer. Done.\n\n**Content formula for freelancers:**\n- Monday: Industry insight or tip\n- Tuesday: Behind-the-scenes of a project\n- Wednesday: Client win / testimonial\n- Thursday: Controversial take / hot topic\n- Friday: Personal story / lesson learned\n\n**AI + Automation combo:**\nUse ChatGPT to write all 5 posts in 15 minutes, paste into Buffer, schedule. You're publishing content 5 days a week with 15 min of work.\n\n**Result:** Consistent LinkedIn presence that attracts inbound clients without daily effort." },
        ],
      },
      {
        id: "m3",
        title: "Module 3: Advanced Workflows",
        description: "Multi-step conditional workflows and API connections.",
        milestone: "Workflow Wizard",
        milestoneEmoji: "🧙",
        lessons: [
          { id: "l3-1", title: "Make.com: Visual Workflow Building", type: "text", duration: "25 min", content: "**Make.com's power: Conditional logic**\n\nUnlike Zapier's linear 'if this then that', Make.com lets you build decision trees:\n\n```\nNew lead arrives\n    ├── Budget > R50,000? → High-value sequence\n    │       └── Personal email + WhatsApp + Book meeting\n    ├── Budget R10-50,000? → Standard sequence\n    │       └── Automated email + CRM tag\n    └── Budget < R10,000? → Self-service sequence\n            └── Link to pricing page + FAQ\n```\n\n**How to build this:**\n1. Add a Router module after the trigger\n2. Set filter conditions for each route\n3. Build separate action chains per route\n\n**Real example:** Triage your contact form by project type:\n- 'Web development' → Notify you immediately + send technical brief\n- 'Content writing' → Add to writing project queue + standard email\n- 'Consulting' → Book calendar link + premium welcome email" },
          { id: "l3-2", title: "Quiz: Advanced Automation", type: "quiz", duration: "10 min", content: "Test your advanced automation skills.", quiz: [
            { q: "What does Make.com's Router module allow?", options: ["Faster processing", "Conditional branching logic", "More app connections", "Cheaper pricing"], answer: 1 },
            { q: "What is the '1-hour content batch method'?", options: ["Write 1 hour of content", "Batch-write 5 posts in 1 hour on Monday", "Post 1 time per hour", "Spend 1 hour per post"], answer: 1 },
            { q: "Which day type works best for personal freelancer stories?", options: ["Monday", "Wednesday", "Friday", "Tuesday"], answer: 2 },
          ]},
        ],
      },
      {
        id: "m4",
        title: "Module 4: Your Automation Stack",
        description: "Build a complete automated freelance business system.",
        milestone: "Automation Master",
        milestoneEmoji: "🏆",
        lessons: [
          { id: "l4-1", title: "The Complete Freelance Automation Stack", type: "text", duration: "25 min", content: "**Your Full Automation Blueprint:**\n\n**Lead Generation:**\n→ LinkedIn post published → Auto-comment first response\n→ New connection → Welcome message sequence\n\n**Lead Conversion:**\n→ Form submitted → CRM + Welcome email + WhatsApp notification\n→ Proposal sent → Follow-up sequence (Day 3, 7, 14)\n\n**Project Management:**\n→ Project started → Create Notion/Asana workspace → Onboarding email\n→ Milestone reached → Client update email + progress dashboard update\n\n**Invoicing:**\n→ Project complete → Invoice generated + sent\n→ Invoice unpaid → Reminder sequence\n→ Invoice paid → Thank you email + review request\n\n**Reviews & Testimonials:**\n→ Payment received → Wait 3 days → Request testimonial\n→ 5-star review submitted → Share to LinkedIn + save to portfolio\n\n**Total setup time:** 8-12 hours (one weekend)\n**Weekly admin time after:** < 30 minutes\n**Time saved per month:** 30-40 hours\n\nThis is the infrastructure that lets you scale without hiring." },
          { id: "l4-2", title: "Quiz: Final Assessment", type: "quiz", duration: "10 min", content: "Final assessment for No-Code Automation course.", quiz: [
            { q: "What should happen immediately when a form is submitted?", options: ["Nothing — check it later", "CRM entry + welcome email + WhatsApp notification", "Just send an email", "Start a 2-week wait"], answer: 1 },
            { q: "How long should it take to set up your complete automation stack?", options: ["1 hour", "8-12 hours (one weekend)", "1 month", "6 months"], answer: 1 },
            { q: "When should you send a testimonial request?", options: ["Before the project starts", "When the invoice is sent", "3 days after payment", "Never"], answer: 2 },
          ]},
        ],
      },
    ],
  },
  {
    id: 3,
    slug: "react-nextjs",
    title: "React + Next.js: Build & Deploy Real Projects",
    tagline: "Build full-stack apps that land R20,000+ projects.",
    description: "Go from React basics to production-ready Next.js apps with real-world projects. Master hooks, API routes, authentication, and deployment.",
    category: "Web Development",
    difficulty: "Intermediate",
    duration: "20 hours",
    earningsLift: "+120%",
    skills: ["React", "Next.js", "TypeScript", "Full-Stack"],
    isFree: false,
    rating: 4.9,
    enrolled: 6800,
    color: "from-blue-600 to-cyan-600",
    emoji: "⚛️",
    modules: [
      { id: "m1", title: "Module 1: React Foundations", description: "Components, props, state, and hooks.", milestone: "React Starter", milestoneEmoji: "⚛️",
        lessons: [
          { id: "l1-1", title: "Components & JSX", type: "text", duration: "30 min", content: "React's core concept: **everything is a component**.\n\nA component is a function that returns JSX (JavaScript XML — HTML-like syntax).\n\n```jsx\nfunction WelcomeCard({ name, role }) {\n  return (\n    <div className=\"card\">\n      <h2>Welcome, {name}</h2>\n      <p>Role: {role}</p>\n    </div>\n  );\n}\n\n// Usage:\n<WelcomeCard name=\"Thabo\" role=\"Developer\" />\n```\n\n**Key rules:**\n1. Component names start with a capital letter\n2. Must return a single parent element (or Fragment: `<>...</>`)\n3. Props flow one direction: parent → child\n4. Never mutate props directly\n\n**Exercise:** Build a `FreelancerCard` component that accepts: name, skill, rate, rating as props." },
          { id: "l1-2", title: "State & useState Hook", type: "text", duration: "30 min", content: "State is **data that changes over time** and causes re-renders when it does.\n\n```jsx\nimport { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>+</button>\n      <button onClick={() => setCount(count - 1)}>-</button>\n    </div>\n  );\n}\n```\n\n**useState returns:** [currentValue, setterFunction]\n\n**Rules of hooks:**\n- Only call hooks at the top level of a function\n- Only call hooks inside React components or custom hooks\n- Never call hooks inside loops, conditions, or nested functions\n\n**Common state patterns:**\n- Toggle: `const [isOpen, setIsOpen] = useState(false)`\n- Form: `const [email, setEmail] = useState('')`\n- Array: `const [items, setItems] = useState([])`\n- Object: `const [user, setUser] = useState({ name: '', email: '' })`" },
          { id: "l1-3", title: "useEffect & Data Fetching", type: "text", duration: "30 min", content: "useEffect runs **side effects** — things outside the React render cycle.\n\n```jsx\nimport { useState, useEffect } from 'react';\n\nfunction JobList() {\n  const [jobs, setJobs] = useState([]);\n  const [loading, setLoading] = useState(true);\n  \n  useEffect(() => {\n    async function fetchJobs() {\n      const res = await fetch('/api/jobs');\n      const data = await res.json();\n      setJobs(data);\n      setLoading(false);\n    }\n    fetchJobs();\n  }, []); // Empty array = run once on mount\n  \n  if (loading) return <div>Loading...</div>;\n  return <div>{jobs.map(job => <JobCard key={job.id} {...job} />)}</div>;\n}\n```\n\n**Dependency array:**\n- `[]` — Run once on mount\n- `[userId]` — Run when userId changes\n- No array — Run after every render (usually wrong)" },
          { id: "l1-4", title: "Quiz: React Foundations", type: "quiz", duration: "15 min", content: "Test your React fundamentals.", quiz: [
            { q: "What does useState return?", options: ["Just the value", "[currentValue, setterFunction]", "A promise", "An object"], answer: 1 },
            { q: "When does useEffect with [] dependency run?", options: ["Every render", "Once on mount", "Only on unmount", "Never"], answer: 1 },
            { q: "Which is valid JSX?", options: ["<div class='box'>", "<div className='box'>", "<div Class='box'>", "<div classes='box'>"], answer: 1 },
          ]},
        ],
      },
      { id: "m2", title: "Module 2: Next.js & Full-Stack", description: "File-based routing, API routes, and server components.", milestone: "Full-Stack Developer", milestoneEmoji: "🌐",
        lessons: [
          { id: "l2-1", title: "Next.js App Router & Pages", type: "text", duration: "30 min", content: "Next.js gives React superpowers: SSR, file-based routing, and API routes in one framework.\n\n**App Router (Next.js 13+):**\nEvery file inside `app/` that's named `page.tsx` becomes a route.\n\n```\napp/\n├── page.tsx          → /\n├── about/page.tsx    → /about\n├── jobs/\n│   ├── page.tsx      → /jobs\n│   └── [id]/page.tsx → /jobs/123 (dynamic)\n└── api/\n    └── hello/route.ts → /api/hello\n```\n\n**Server vs Client Components:**\n- Server Components (default): fetch data, no hooks, no browser APIs\n- Client Components (`'use client'`): useState, useEffect, onClick handlers\n\n**Rule of thumb:** Keep components server-side unless they need interactivity." },
          { id: "l2-2", title: "API Routes & Database", type: "text", duration: "40 min", content: "Next.js API routes are serverless functions inside your app.\n\n```typescript\n// app/api/jobs/route.ts\nimport { NextRequest, NextResponse } from 'next/server';\nimport { db } from '@/lib/db';\n\nexport async function GET(req: NextRequest) {\n  const jobs = await db.select().from(jobsTable);\n  return NextResponse.json(jobs);\n}\n\nexport async function POST(req: NextRequest) {\n  const body = await req.json();\n  const job = await db.insert(jobsTable).values(body).returning();\n  return NextResponse.json(job[0], { status: 201 });\n}\n```\n\n**Database options:**\n- **Neon** (Postgres, free tier, SA-friendly)\n- **PlanetScale** (MySQL)\n- **Supabase** (Postgres + auth + storage)\n\n**ORM:** Drizzle (lightweight, TypeScript-first) or Prisma (more features)" },
          { id: "l2-3", title: "Authentication with NextAuth", type: "text", duration: "30 min", content: "Authentication in 15 minutes with NextAuth.js:\n\n```typescript\n// app/api/auth/[...nextauth]/route.ts\nimport NextAuth from 'next-auth';\nimport GoogleProvider from 'next-auth/providers/google';\n\nconst handler = NextAuth({\n  providers: [\n    GoogleProvider({\n      clientId: process.env.GOOGLE_ID!,\n      clientSecret: process.env.GOOGLE_SECRET!,\n    }),\n  ],\n  callbacks: {\n    session({ session, token }) {\n      session.user.id = token.sub!;\n      return session;\n    },\n  },\n});\n\nexport { handler as GET, handler as POST };\n```\n\n**Protect pages:**\n```typescript\nimport { getServerSession } from 'next-auth';\n\nexport default async function Dashboard() {\n  const session = await getServerSession();\n  if (!session) redirect('/login');\n  return <div>Welcome, {session.user.name}</div>;\n}\n```" },
          { id: "l2-4", title: "Quiz: Next.js & API Routes", type: "quiz", duration: "15 min", content: "Test your Next.js knowledge.", quiz: [
            { q: "What file creates a page at /about in Next.js App Router?", options: ["about.tsx", "app/about.tsx", "app/about/page.tsx", "pages/about.tsx"], answer: 2 },
            { q: "When should you use 'use client'?", options: ["Always", "When using hooks or browser APIs", "For all API calls", "Never in Next.js"], answer: 1 },
            { q: "Which database is recommended for Next.js beginners?", options: ["MongoDB Atlas", "Neon (Postgres)", "SQLite", "Redis"], answer: 1 },
          ]},
        ],
      },
      { id: "m3", title: "Module 3: Real Project — Job Board", description: "Build a full job board app with database, auth, and deployment.", milestone: "Project Builder", milestoneEmoji: "🔨",
        lessons: [
          { id: "l3-1", title: "Project Architecture & Setup", type: "text", duration: "30 min", content: "**We're building:** A niche job board for South African tech freelancers.\n\n**Features:**\n- Browse jobs with search + filter\n- Post a job (authenticated clients)\n- Apply for jobs (authenticated freelancers)\n- Admin dashboard\n\n**Tech stack:**\n- Next.js 14 (App Router)\n- Neon Postgres + Drizzle ORM\n- NextAuth (Google + Email)\n- Tailwind CSS\n- Vercel (deployment)\n\n**Folder structure:**\n```\nmy-job-board/\n├── app/\n│   ├── (auth)/login/page.tsx\n│   ├── (dashboard)/dashboard/page.tsx\n│   ├── jobs/\n│   │   ├── page.tsx\n│   │   ├── [id]/page.tsx\n│   │   └── post/page.tsx\n│   └── api/\n│       ├── auth/[...nextauth]/route.ts\n│       └── jobs/route.ts\n├── lib/db.ts\n├── components/\n└── drizzle/schema.ts\n```\n\n**Day 1 goal:** Get the jobs list page showing mock data." },
          { id: "l3-2", title: "Building the Job Board Frontend", type: "text", duration: "40 min", content: "**Jobs listing page:**\n```tsx\n// app/jobs/page.tsx\nimport { db } from '@/lib/db';\nimport { jobs } from '@/drizzle/schema';\nimport JobCard from '@/components/JobCard';\n\nexport default async function JobsPage() {\n  const allJobs = await db.select().from(jobs)\n    .orderBy(desc(jobs.createdAt))\n    .limit(50);\n  \n  return (\n    <main className=\"max-w-4xl mx-auto py-12 px-4\">\n      <h1 className=\"text-3xl font-bold mb-8\">SA Tech Jobs</h1>\n      <div className=\"grid gap-4\">\n        {allJobs.map(job => (\n          <JobCard key={job.id} job={job} />\n        ))}\n      </div>\n    </main>\n  );\n}\n```\n\n**JobCard component:**\nBuild a clean card showing: title, company, location, salary range, skills tags, posted date.\n\n**Filter bar:**\nAdd search input, location dropdown, salary range slider, remote checkbox." },
        ],
      },
      { id: "m4", title: "Module 4: Deployment & Performance", description: "Deploy to Vercel, optimise images, and achieve 100 Lighthouse score.", milestone: "Deployment Expert", milestoneEmoji: "🚀",
        lessons: [
          { id: "l4-1", title: "Deploying to Vercel", type: "text", duration: "20 min", content: "**Vercel is the easiest Next.js deployment platform:**\n\n1. Push your code to GitHub\n2. Connect repo to Vercel (vercel.com)\n3. Add environment variables (DATABASE_URL, NEXTAUTH_SECRET, etc.)\n4. Click Deploy\n\n**That's it.** Vercel automatically:\n- Runs your build\n- Deploys globally to 36 edge regions\n- Provides HTTPS with your domain\n- Auto-deploys on every git push\n\n**Environment variables checklist:**\n- `DATABASE_URL` — Neon connection string\n- `NEXTAUTH_SECRET` — Random 32+ character string\n- `NEXTAUTH_URL` — Your production domain\n- `GOOGLE_ID` + `GOOGLE_SECRET` — Google OAuth credentials\n\n**Custom domain:** Point your domain's DNS to Vercel, add domain in Vercel dashboard. Free SSL included.\n\n**Cost:** Free tier covers most freelance projects. Scale to Pro (~$20/month) when you need team features or more compute." },
          { id: "l4-2", title: "Quiz: Deployment & Performance", type: "quiz", duration: "10 min", content: "Final assessment for React + Next.js course.", quiz: [
            { q: "What does Vercel do automatically on every git push?", options: ["Nothing", "Auto-deploys your app", "Emails your clients", "Runs tests"], answer: 1 },
            { q: "Where do you store sensitive keys in production?", options: ["In the code", "In .env file only", "In Vercel environment variables", "In comments"], answer: 2 },
            { q: "What is the advantage of Server Components?", options: ["They use hooks", "They fetch data server-side with no client JS", "They are faster to write", "They support all browser APIs"], answer: 1 },
          ]},
        ],
      },
      { id: "m5", title: "Module 5: Advanced Patterns", description: "Advanced React patterns, performance, and freelance business tips.", milestone: "React Expert", milestoneEmoji: "🏆",
        lessons: [
          { id: "l5-1", title: "Advanced React Patterns", type: "text", duration: "30 min", content: "**5 patterns every senior React developer knows:**\n\n**1. Custom Hooks**\nExtract reusable stateful logic:\n```jsx\nfunction useLocalStorage(key, initialValue) {\n  const [value, setValue] = useState(() => {\n    const saved = localStorage.getItem(key);\n    return saved ? JSON.parse(saved) : initialValue;\n  });\n  // ...\n  return [value, setValue];\n}\n```\n\n**2. Compound Components**\nComponents that work together (like Select + Option):\n```jsx\n<Tabs>\n  <Tabs.List>\n    <Tabs.Tab>Profile</Tabs.Tab>\n    <Tabs.Tab>Projects</Tabs.Tab>\n  </Tabs.List>\n  <Tabs.Panel>...</Tabs.Panel>\n</Tabs>\n```\n\n**3. Render Props**\n**4. Context + Reducer**\n**5. Suspense + Error Boundaries**\n\nMastering these separates junior from senior developers and justifies R50k+/month rates." },
          { id: "l5-2", title: "Landing Your First R20k+ React Project", type: "text", duration: "20 min", content: "**The React freelancer's path to R20,000+ projects:**\n\n**Your portfolio must include:**\n1. A real full-stack app (not just a tutorial clone)\n2. 2-3 client projects (even if low-paid to start)\n3. A GitHub profile with clean, commented code\n\n**Position yourself as a specialist:**\n'React developer for South African fintech and e-commerce' earns more than 'I do web development'.\n\n**Where to find clients:**\n- FreelanceSkills.net (post your profile today)\n- LinkedIn (connection + content strategy)\n- SA startup communities (Startup Grind SA, Silicon Cape)\n- Referrals from existing clients\n\n**Proposal tip:**\nLead with the business problem, not the technology. 'I'll build a checkout flow that reduces your cart abandonment by 20%' beats 'I'll use React + Next.js to build your frontend'.\n\n**Pricing:** Start at R800-1,200/hour. Raise by R200/hour every 3 months until you hit resistance." },
        ],
      },
    ],
  },
  {
    id: 4,
    slug: "figma-freelancers",
    title: "Figma for Freelancers",
    tagline: "Design stunning websites and apps. Charge R15,000+ per project.",
    description: "Master Figma from basics to professional UI/UX design. Build a portfolio that lands design clients.",
    category: "Graphic Design",
    difficulty: "Beginner",
    duration: "10 hours",
    earningsLift: "+65%",
    skills: ["Figma", "UI Design", "Prototyping", "Design Systems"],
    isFree: true,
    rating: 4.8,
    enrolled: 9100,
    color: "from-pink-600 to-rose-600",
    emoji: "🎨",
    modules: [
      { id: "m1", title: "Module 1: Figma Interface Mastery", description: "Master every tool, panel, and shortcut in Figma.", milestone: "Figma Initiate", milestoneEmoji: "🖱️",
        lessons: [
          { id: "l1-1", title: "The Figma Interface", type: "text", duration: "25 min", content: "**The 5 core areas of Figma:**\n\n1. **Menu bar** (top): Project name, view options, export\n2. **Toolbar** (left): Frame, Shape, Pen, Text, Hand, Scale tools\n3. **Layers panel** (left sidebar): Your component hierarchy\n4. **Canvas** (center): Your infinite design space\n5. **Properties panel** (right): Position, size, fill, effects\n\n**Essential keyboard shortcuts:**\n- `F` — Frame tool (create artboards)\n- `R` — Rectangle\n- `T` — Text\n- `V` — Move/Select\n- `Ctrl+D` — Duplicate\n- `Ctrl+G` — Group\n- `Ctrl+Alt+K` — Create component\n- `Ctrl+Shift+H` — Hide/show UI\n\n**Frames vs Groups:**\nAlways use frames (F), not groups, for container elements. Frames support constraints, auto layout, and component properties.\n\n**Exercise:** Create a 375×812 frame (iPhone 14 size) and add a header area." },
          { id: "l1-2", title: "Auto Layout: The Designer's Superpower", type: "text", duration: "30 min", content: "Auto Layout makes your designs responsive and easy to maintain.\n\n**What it does:** Automatically arranges child elements like CSS flexbox.\n\n**How to add:** Select elements → `Shift+A`\n\n**Properties:**\n- Direction: Horizontal or Vertical\n- Gap between items: 8px, 16px, 24px\n- Padding: Inner spacing\n- Alignment: Start, center, end, space-between\n\n**Real example — Button component:**\n```\nButton frame (auto layout, horizontal)\n├── Icon (24×24)\n└── Label text\n```\n\nNow when you change the label text, the button automatically resizes. This is what separates professional designs from amateur ones.\n\n**The 8px grid system:**\nUse multiples of 8 for all spacing: 8, 16, 24, 32, 48, 64px.\nThis creates visual harmony and matches most CSS frameworks.\n\n**Exercise:** Build a button with auto layout, icon + text, with 3 variants: primary, secondary, destructive." },
          { id: "l1-3", title: "Quiz: Figma Interface", type: "quiz", duration: "10 min", content: "Test your Figma interface knowledge.", quiz: [
            { q: "What keyboard shortcut creates a Frame?", options: ["G", "F", "R", "C"], answer: 1 },
            { q: "What does Auto Layout replicate from CSS?", options: ["Grid", "Flexbox", "Position absolute", "Float"], answer: 1 },
            { q: "What is the 8px grid system based on?", options: ["Random preference", "Multiples of 8 for visual harmony", "Screen resolution", "Font size"], answer: 1 },
          ]},
        ],
      },
      { id: "m2", title: "Module 2: Components & Design Systems", description: "Build reusable components and a complete design system.", milestone: "Component Creator", milestoneEmoji: "🧩",
        lessons: [
          { id: "l2-1", title: "Building Reusable Components", type: "text", duration: "30 min", content: "**Components are the foundation of scalable design.**\n\nCreate a component: Select elements → Right click → 'Create Component' (or Ctrl+Alt+K)\n\n**Component anatomy:**\n- Main component: The source of truth\n- Instance: A copy that inherits from the main\n- Override: A change made to an instance (name, icon, color)\n\n**Component variants:**\nGroup related components together:\n- Button: Size (sm/md/lg) × State (default/hover/disabled) = 9 variants\n- Input: State (default/focused/error) × Type (text/email/password) = 9 variants\n\n**How to create variants:**\n1. Create all variants as separate components\n2. Select all → 'Combine as Variants'\n3. Set property names (Size, State, etc.)\n4. Now you can switch between variants in the Properties panel\n\n**Why this matters for clients:**\nA component library means changes take seconds, not hours. 'Can you change all buttons to rounded?' — 1 change, done." },
          { id: "l2-2", title: "Design Tokens & Colour Systems", type: "text", duration: "25 min", content: "**Design tokens** are named values for colors, spacing, typography.\n\n**Colour system for a South African tech brand:**\n```\nPrimary: #10B981 (Emerald) — trust, growth\nSecondary: #0F172A (Slate) — sophistication\nAccent: #F59E0B (Amber) — energy, action\nError: #EF4444\nWarning: #F59E0B\nSuccess: #10B981\nText primary: #0F172A\nText secondary: #64748B\nBackground: #F8FAFC\n```\n\n**In Figma:**\nCreate styles for each: fill colour → click '+' in Styles panel → name it 'primary/500'\n\n**Typography scale:**\n- Display: 48/56px, Bold\n- H1: 36/44px, Bold\n- H2: 28/36px, Semibold\n- H3: 22/30px, Semibold\n- Body: 16/24px, Regular\n- Small: 14/20px, Regular\n- Caption: 12/16px, Medium\n\nUse these consistently across ALL designs." },
        ],
      },
      { id: "m3", title: "Module 3: Real Project — App Design", description: "Design a complete mobile app from brief to handoff.", milestone: "App Designer", milestoneEmoji: "📱",
        lessons: [
          { id: "l3-1", title: "Design Brief to Wireframes", type: "text", duration: "30 min", content: "**Project:** Design a freelancer time-tracking mobile app.\n\n**Brief:**\n- Target: South African freelancers\n- Platform: iOS (iPhone 14 Pro, 393×852px)\n- Core features: Timer, invoices, projects, reports\n- Brand: Professional, clean, dark mode\n\n**Phase 1: User flows**\nMap the critical user journey before touching Figma:\n1. Open app → Active timer (or Start timer)\n2. Stop timer → Auto-assign to project → Edit if needed\n3. End of week → Generate invoice → Send to client\n\n**Phase 2: Wireframes**\nSketch rough layouts with grey boxes. No color, no icons, no copy yet.\n\nFocus: Does the layout make logical sense? Is the hierarchy clear? Are CTAs obvious?\n\n**Phase 3: High-fidelity**\nOnly after wireframes are approved, apply your design system." },
          { id: "l3-2", title: "Prototyping & Client Presentation", type: "text", duration: "25 min", content: "**Prototyping in Figma:**\n1. Switch to Prototype tab (top right)\n2. Hover a frame → drag the blue dot to the destination frame\n3. Set interaction: On Click → Navigate to → with Smart Animate\n\n**Share with clients:**\n- Press Play to enter presentation mode\n- Share link: clients can view without a Figma account\n- Comment mode: clients can leave feedback directly on designs\n\n**Design handoff to developers:**\n- Inspect panel: Developers see exact measurements, colors, fonts\n- Export assets: Right click → Export as PNG/SVG\n- Dev Mode: Full specs without needing Figma access\n\n**Client presentation tips:**\n1. Present in presentation mode, not the editor\n2. Walk through the user flow story, not individual screens\n3. Ask 'How would you feel using this?' not 'Do you like it?'\n4. End every review with 'What one thing would make this better?'" },
          { id: "l3-3", title: "Quiz: Design & Prototyping", type: "quiz", duration: "10 min", content: "Test your design and prototyping skills.", quiz: [
            { q: "What should you create before high-fidelity designs?", options: ["Component library", "Wireframes", "Brand guidelines", "User interviews"], answer: 1 },
            { q: "How do you create a prototype interaction in Figma?", options: ["Use plugins", "Drag the blue dot to destination frame", "Write code", "Import from HTML"], answer: 1 },
            { q: "What question should you ask after presenting designs?", options: ["Do you like it?", "Can you pay now?", "What one thing would make this better?", "Is the colour right?"], answer: 2 },
          ]},
        ],
      },
      { id: "m4", title: "Module 4: Freelance Design Business", description: "Pricing, proposals, and building a profitable design practice.", milestone: "Design Entrepreneur", milestoneEmoji: "💼",
        lessons: [
          { id: "l4-1", title: "Pricing Design Projects", type: "text", duration: "20 min", content: "**SA design freelancer rates:**\n\nJunior (0-2 years): R400-700/hour\nMid (2-5 years): R700-1,200/hour\nSenior (5+ years): R1,200-2,500/hour\n\n**Project pricing is better than hourly:**\n- Website design: R8,000-25,000\n- App design (mobile): R15,000-50,000\n- Brand identity: R10,000-30,000\n- Design system: R20,000-60,000\n\n**How to set your project rate:**\n1. Estimate hours (be pessimistic, add 30%)\n2. Multiply by hourly rate\n3. Add a fixed overhead fee (R1,500-3,000 for admin, revisions, calls)\n4. Round to nearest R500\n\n**Package pricing:**\nOffer 3 packages (Small/Medium/Large). Most clients pick middle.\n\n**Recurring revenue:**\nOffer a 'Design Retainer' — R6,000-12,000/month for ongoing design support. 2-4 retainers = stable income." },
          { id: "l4-2", title: "Quiz: Figma Course Final", type: "quiz", duration: "10 min", content: "Final assessment for Figma for Freelancers.", quiz: [
            { q: "What is the SA senior designer hourly rate range?", options: ["R200-400/hour", "R700-1200/hour", "R1200-2500/hour", "R3000+/hour"], answer: 2 },
            { q: "Why is project pricing better than hourly?", options: ["It's easier to calculate", "You earn more as you get faster", "Clients prefer it", "It's required by law"], answer: 1 },
            { q: "What does a Design Retainer provide for freelancers?", options: ["Access to better tools", "Recurring stable monthly income", "Free courses", "Faster project completion"], answer: 1 },
          ]},
        ],
      },
    ],
  },
  {
    id: 5,
    slug: "high-converting-copywriting",
    title: "High-Converting Copywriting",
    tagline: "Write proposals that win. Land clients on the first try.",
    description: "Master the psychology of persuasion, proposal writing, and client communication that wins R50k+ projects.",
    category: "Copywriting",
    difficulty: "Beginner",
    duration: "6 hours",
    earningsLift: "+55%",
    skills: ["Copywriting", "Persuasion", "Proposals", "Client Psychology"],
    isFree: true,
    rating: 4.7,
    enrolled: 7200,
    color: "from-yellow-500 to-orange-500",
    emoji: "✍️",
    modules: [
      { id: "m1", title: "Module 1: The Psychology of Persuasion", description: "Understand why clients say yes or no.", milestone: "Persuasion Initiate", milestoneEmoji: "🧠",
        lessons: [
          { id: "l1-1", title: "Why Clients Really Hire You", type: "text", duration: "20 min", content: "Clients don't hire skills. They hire solutions to problems.\n\n**The emotional buying decision:**\nEvery purchase decision is made emotionally and justified rationally.\n\nA startup doesn't hire a developer because 'we need React expertise'. They hire because:\n- The CTO is stressed about the upcoming investor demo\n- The product manager is scared the competitor will ship first\n- The founder wants to prove to their team they can execute\n\n**Your job:** Identify the underlying fear or desire, and show how you remove the fear or deliver the desire.\n\n**The 4 core buying emotions:**\n1. **Fear of loss** — 'If I don't hire someone good, this project will fail'\n2. **Desire for gain** — 'The right developer will make us 10x more efficient'\n3. **Social proof** — 'Our investors will see we're serious'\n4. **FOMO** — 'My competitor already has this; we need it too'\n\n**Exercise:** Think of your last 3 clients. What was the real emotional driver behind their decision to hire you?" },
          { id: "l1-2", title: "The AIDA Framework for Proposals", type: "text", duration: "25 min", content: "**AIDA: Attention → Interest → Desire → Action**\n\nThis 100-year-old copywriting framework still wins projects today.\n\n**Attention** (First 2 sentences):\nGrab attention by naming their specific problem.\n'Your checkout conversion is dropping because customers don't trust your payment page.'\n\n**Interest** (Sentences 3-6):\nDemonstrate you understand the deeper implications.\n'A 1% improvement in your checkout conversion at your current traffic means R8,000 more revenue every month — without spending a single rand on ads.'\n\n**Desire** (Middle section):\nProve you're the specific solution with social proof.\n'In the last 18 months, I've redesigned checkout flows for 5 South African e-commerce brands. The average improvement: 23% increase in completed purchases.'\n\n**Action** (Last sentence):\nSingle, clear next step.\n'Let's jump on a 20-minute call this week. Book directly here: [Calendar link]'\n\n**Critical rule:** ONE call to action. Not 'email me, WhatsApp me, or fill in the form'. Pick one." },
          { id: "l1-3", title: "Quiz: Psychology & AIDA", type: "quiz", duration: "10 min", content: "Test your persuasion knowledge.", quiz: [
            { q: "What do clients actually hire, not skills?", options: ["Experience", "Solutions to problems", "Tools and software", "Certifications"], answer: 1 },
            { q: "What does the 'A' in AIDA stand for first?", options: ["Action", "Attention", "Achievement", "Analysis"], answer: 1 },
            { q: "How many CTAs should your proposal end with?", options: ["3+ options", "2 options", "1 clear CTA", "None — let them decide"], answer: 2 },
          ]},
        ],
      },
      { id: "m2", title: "Module 2: Proposal Writing Masterclass", description: "Step-by-step proposal templates that win.", milestone: "Proposal Pro", milestoneEmoji: "📝",
        lessons: [
          { id: "l2-1", title: "The 7-Part Winning Proposal", type: "text", duration: "30 min", content: "**Every winning proposal has these 7 parts:**\n\n**1. The Hook (1 paragraph)**\nReference their specific situation. Prove you read their brief.\n\n**2. The Problem Statement**\nArticulate their problem better than they did. This shows expertise.\n\n**3. The Solution Overview**\nYour approach in 3 bullet points. Not exhaustive — intriguing.\n\n**4. Your Relevant Experience**\n2-3 sentences on specific past work. Numbers where possible.\n\n**5. The Delivery Plan**\nPhase 1: [Milestone] by [Date]\nPhase 2: [Milestone] by [Date]\nPhase 3: [Delivery] by [Date]\n\n**6. The Investment**\n'Investment: R[X]'\nAvoid the word 'cost' — it sounds like a burden. 'Investment' implies return.\n\n**7. The Single CTA**\n'Reply to this message with any questions, or book a 20-minute intro call here: [link]'\n\n**Length:** 300-400 words. Long enough to be thorough, short enough to be read." },
          { id: "l2-2", title: "Proposals for Different Project Types", type: "text", duration: "25 min", content: "**Web Development Proposal Hook:**\n'I've reviewed your brief for the e-commerce redesign. The core issue isn't design — it's conversion architecture. Your current site has 7 friction points that data shows kill purchasing intent. I can eliminate all 7 in the first phase.'\n\n**Design Proposal Hook:**\n'Your brand currently signals 'small business' when your product quality signals 'premium'. That gap is costing you clients who should be paying 3× more. I specialise in the brand identity that closes that gap.'\n\n**Content/Copy Proposal Hook:**\n'I spent an hour on your website before writing this. The core problem: your copy talks about features, not transformations. Potential clients don't care that you offer X service — they care what their life looks like after working with you.'\n\n**Marketing Proposal Hook:**\n'Your Google Ads CTR of 0.8% tells me your ad copy is generic. I've run campaigns in your industry with 3-4% CTR at the same budget. The difference: specificity over optimism.'\n\n**Pattern:** Always lead with a specific insight derived from their actual business. Never with your qualifications." },
        ],
      },
      { id: "m3", title: "Module 3: Client Communication", description: "From first contact to long-term relationship.", milestone: "Client Champion", milestoneEmoji: "🤝",
        lessons: [
          { id: "l3-1", title: "The Discovery Call Script", type: "text", duration: "25 min", content: "**The discovery call is not about selling — it's about diagnosing.**\n\n**Call structure (20-30 minutes):**\n\n**Opening (2 min):**\n'I've read through your brief and done some research on your business. Before I give you my perspective, I'd love to understand more about [specific thing]. Can you tell me more about...'\n\n**Discovery questions (15 min):**\n1. 'What specifically triggered the decision to invest in this right now?'\n2. 'What does success look like in 6 months — what would have to be true?'\n3. 'What's happened in the past when you've tried to solve this?'\n4. 'Who else will be involved in the decision?'\n5. 'What's your timeline and what's driving it?'\n6. 'What's your budget range for this?'\n\n**Closing (5 min):**\n'Based on what you've told me, here's what I'm thinking... [2-3 sentence solution]. Does that feel like the right approach?'\n\n**Never:** Give a price on the first call. Always say 'I'll put together a detailed proposal for you by [day]'." },
          { id: "l3-2", title: "Quiz: Proposal & Communication", type: "quiz", duration: "10 min", content: "Test your proposal writing and communication skills.", quiz: [
            { q: "What word should replace 'cost' in proposals?", options: ["Price", "Fee", "Investment", "Rate"], answer: 2 },
            { q: "What is the purpose of the discovery call?", options: ["Selling your services", "Diagnosing the client's problem", "Presenting your portfolio", "Negotiating price"], answer: 1 },
            { q: "How long should a winning proposal be?", options: ["50-100 words", "300-400 words", "1000+ words", "5 pages"], answer: 1 },
          ]},
        ],
      },
      { id: "m4", title: "Module 4: Copywriting as a Service", description: "Build a profitable copywriting freelance practice.", milestone: "Copy Master", milestoneEmoji: "🏆",
        lessons: [
          { id: "l4-1", title: "Building Your Copywriting Portfolio", type: "text", duration: "20 min", content: "**The fastest way to build a portfolio with zero clients:**\n\n**Option 1: Spec work**\nRewrite the copy on 3 real SA company websites (without permission). Show before/after. 'I rewrote Old Mutual's homepage for a clearer CTA hierarchy — here's the before and after.'\n\n**Option 2: Create content**\nWrite 12 LinkedIn posts over 6 weeks. The posts themselves ARE your portfolio.\n\n**Option 3: Personal brand**\nCreate your own website and write compelling copy for it. If you can sell yourself, you can sell anything.\n\n**Portfolio pieces you need:**\n- 2-3 website copy samples (homepage, service page, about)\n- 2-3 email sequences (welcome, launch, follow-up)\n- 2-3 social media campaigns\n- 1-2 proposals (sanitise client details)\n\n**Platform:** Use Canva or Notion to create a simple portfolio page. No need for a custom website initially." },
          { id: "l4-2", title: "Quiz: Copywriting Final", type: "quiz", duration: "10 min", content: "Final assessment for High-Converting Copywriting.", quiz: [
            { q: "What is 'spec work' in copywriting?", options: ["Work done on speculation for a future client", "Rewriting existing copy to build your portfolio", "Writing technical specifications", "Special client work"], answer: 1 },
            { q: "What is the fastest portfolio builder with zero clients?", options: ["Waiting for referrals", "Creating spec work and content", "Cold calling", "Joining agencies"], answer: 1 },
            { q: "What platform can you use for a simple portfolio without a website?", options: ["Only WordPress", "Canva or Notion", "Adobe XD", "InDesign"], answer: 1 },
          ]},
        ],
      },
    ],
  },
  {
    id: 6,
    slug: "google-ads-mastery",
    title: "Google Ads Mastery",
    tagline: "Spend R5, get R50. Master Google Search Ads for SA businesses.",
    description: "Learn to plan, build, and optimise profitable Google Ads campaigns for South African businesses. Get certified.",
    category: "Digital Marketing",
    difficulty: "Intermediate",
    duration: "14 hours",
    earningsLift: "+120%",
    skills: ["Google Ads", "PPC", "Analytics", "CRO"],
    isFree: false,
    rating: 4.9,
    enrolled: 4200,
    color: "from-red-500 to-orange-600",
    emoji: "📢",
    modules: [
      { id: "m1", title: "Module 1: Google Ads Fundamentals", description: "How Google Ads works, campaign types, and account structure.", milestone: "Ads Initiate", milestoneEmoji: "🎯",
        lessons: [
          { id: "l1-1", title: "How Google Search Ads Work", type: "text", duration: "25 min", content: "**Google Search Ads appear when people actively search for what you offer.**\n\nThis is intent-based advertising — the most powerful form of marketing.\n\n**The Auction (happens in milliseconds):**\n1. User types a search query\n2. Google identifies all ads bidding on that query\n3. Each ad gets an **Ad Rank** score\n4. Top 3-4 ads appear above organic results\n\n**Ad Rank = Max Bid × Quality Score × Expected Impact**\n\n**Quality Score (1-10):** Google's rating of your ad relevance\n- Expected CTR (Click-Through Rate)\n- Ad relevance to keyword\n- Landing page experience\n\n**SA market opportunity:**\n- Average SA Google Ads CPC: R3-15 (much cheaper than UK/US at R25-80)\n- SA searches growing 18% YoY\n- 64% of SA internet users click Google Ads when looking to buy\n\n**Your job as a Google Ads freelancer:** Make clients' ads rank at the top for less cost than competitors." },
          { id: "l1-2", title: "Account Structure: Campaigns, Ad Groups, Keywords", type: "text", duration: "30 min", content: "**The Google Ads hierarchy:**\n\n```\nAccount (brand)\n└── Campaign (goal + budget)\n    └── Ad Group (theme + audience)\n        ├── Keywords (what triggers your ads)\n        └── Ads (the actual text shown)\n```\n\n**Example: Cape Town Plumber**\n```\nCampaign: Plumbing Services JHB (Budget: R200/day)\n├── Ad Group: Emergency Plumber\n│   ├── Keywords: 'emergency plumber johannesburg', 'burst pipe repair jhb'\n│   └── Ad: 'Emergency Plumber JHB | Available 24/7 | Call Now'\n└── Ad Group: Geyser Installation\n    ├── Keywords: 'geyser installation johannesburg', 'new geyser installed jhb'\n    └── Ad: 'Geyser Installation JHB | Certified Plumber | Free Quote'\n```\n\n**Why structure matters:**\nTight, themed ad groups = higher Quality Scores = lower CPCs = more profit for client." },
          { id: "l1-3", title: "Quiz: Google Ads Fundamentals", type: "quiz", duration: "10 min", content: "Test your Google Ads knowledge.", quiz: [
            { q: "What is Ad Rank based on?", options: ["Budget alone", "Max Bid × Quality Score × Expected Impact", "Company size", "Account age"], answer: 1 },
            { q: "What are the typical SA Google Ads CPC rates?", options: ["R50-100", "R3-15", "R1 or less", "R25-80"], answer: 1 },
            { q: "What is the correct Google Ads hierarchy order?", options: ["Keywords > Ad Groups > Campaigns", "Campaign > Ad Group > Keywords > Ads", "Ads > Keywords > Campaign", "Account > Keywords > Campaigns"], answer: 1 },
          ]},
        ],
      },
      { id: "m2", title: "Module 2: Keyword Research & Strategy", description: "Find the keywords that drive profit, not just clicks.", milestone: "Keyword Strategist", milestoneEmoji: "🔑",
        lessons: [
          { id: "l2-1", title: "Keyword Research for SA Businesses", type: "text", duration: "30 min", content: "**The 3 types of keywords:**\n\n**1. Branded:** 'Nike shoes' — high intent, usually owned by the brand\n\n**2. Commercial intent:** 'buy running shoes cape town' — ready to purchase\n\n**3. Informational:** 'how to choose running shoes' — research phase\n\n**For SA freelancer clients, focus on commercial intent.**\n\n**Free keyword research tools:**\n- Google Keyword Planner (free with Ads account)\n- Google Search Console (see what terms drive organic traffic)\n- Google Autocomplete (type query + Spacebar to see suggestions)\n- Answer The Public (question-based keywords)\n\n**Match types:**\n- `+Broad +Match +Modifier` — Ads show for variations\n- `\"Phrase match\"` — Ads show for queries containing this phrase\n- `[Exact match]` — Ads only show for this exact query\n\n**SA-specific:** Use township and language variants. 'Plumber in Soweto', 'Umsebenzi weplumbing KZN'. This often has zero competition." },
          { id: "l2-2", title: "Negative Keywords: Your Hidden Weapon", type: "text", duration: "20 min", content: "**Negative keywords** prevent your ads showing for irrelevant searches.\n\n**Example: Plumber campaign**\nWithout negatives, your 'plumber johannesburg' ad might show for:\n- 'plumber salary johannesburg' → job seekers, not customers\n- 'plumber course johannesburg' → students, not customers\n- 'plumber complaints johannesburg' → complainers, not buyers\n\n**Add as negatives:** salary, course, course, training, DIY, free, how to, reviews\n\n**Pro tip:** Run your campaigns for 1 week, then review the Search Terms report. Add every irrelevant search as a negative. Repeat monthly.\n\n**Impact:** Most poorly-run campaigns waste 30-50% of budget on irrelevant clicks. Negative keywords alone can halve client costs." },
        ],
      },
      { id: "m3", title: "Module 3: Writing Ads That Convert", description: "Ad copywriting, extensions, and landing pages.", milestone: "Ad Copywriter", milestoneEmoji: "✏️",
        lessons: [
          { id: "l3-1", title: "Responsive Search Ad Formula", type: "text", duration: "25 min", content: "**Responsive Search Ads (RSAs):** You provide up to 15 headlines and 4 descriptions. Google tests combinations and shows the best performing ones.\n\n**Headline formulas that work:**\n1. [Service] + [Location]: 'Emergency Plumber Cape Town'\n2. USP: '24/7 Available · Same Day Service'\n3. Social proof: '500+ 5-Star Reviews'\n4. Feature: 'Licensed & Insured Plumbers'\n5. CTA: 'Call Now for Free Quote'\n6. Urgency: 'Available Today — Book Now'\n\n**SA-specific winners:**\n- Include 'BEE Compliant' for B2B ads\n- Include 'PayFast Accepted' for e-commerce\n- Include price: 'From R550' (if competitive)\n\n**Ad extensions (always add all):**\n- Sitelinks: Link to key pages\n- Callouts: 'Free Quote', '24/7 Support', 'POPIA Compliant'\n- Call extension: Phone number\n- Location extension: Your physical address\n- Structured snippets: 'Services: Plumbing, Electrical, Tiling'" },
          { id: "l3-2", title: "Quiz: Ads & Keywords", type: "quiz", duration: "10 min", content: "Test your keyword and ad writing knowledge.", quiz: [
            { q: "What type of keywords indicate a buyer is ready to purchase?", options: ["Informational", "Branded", "Commercial intent", "Navigational"], answer: 2 },
            { q: "What do negative keywords prevent?", options: ["Any ad showing", "Irrelevant searches triggering your ads", "High bids", "Low Quality Scores"], answer: 1 },
            { q: "How many headlines can you add to a Responsive Search Ad?", options: ["3", "5", "10", "15"], answer: 3 },
          ]},
        ],
      },
      { id: "m4", title: "Module 4: Optimization & Reporting", description: "Monitor, optimise, and report results to clients.", milestone: "Ads Expert", milestoneEmoji: "📊",
        lessons: [
          { id: "l4-1", title: "The Weekly Optimisation Routine", type: "text", duration: "25 min", content: "**Every Monday: 30-minute Google Ads health check**\n\n**1. Check key metrics:**\n- Impressions (visibility)\n- CTR — should be above 5% for SA search\n- CPC — is it trending up? Why?\n- Conversion rate — benchmark: 3-5% for SA\n- CPA (Cost Per Acquisition) — is it below the client's target?\n\n**2. Search Terms Report:**\nIdentify and add new negative keywords.\nIdentify and add high-performing search terms as exact match keywords.\n\n**3. Bid adjustments:**\n- Device: Are mobile conversions cheaper or more expensive?\n- Time of day: When do conversions happen?\n- Location: Which suburbs/cities drive most value?\n\n**4. Pause poor performers:**\nKeywords with 100+ clicks and 0 conversions → pause immediately.\n\n**Monthly client report template:**\n- Spend this month: RX\n- Impressions: X\n- Clicks: X (CTR: X%)\n- Conversions: X (Conversion rate: X%)\n- Revenue attributed: RX\n- ROAS (Return on Ad Spend): X:1" },
          { id: "l4-2", title: "Quiz: Google Ads Final", type: "quiz", duration: "10 min", content: "Final assessment for Google Ads Mastery.", quiz: [
            { q: "What is a good CTR benchmark for SA Google Search ads?", options: ["0.5%", "2%", "5%+", "20%"], answer: 2 },
            { q: "What should you do with keywords that have 100+ clicks and 0 conversions?", options: ["Increase bids", "Add more ads", "Pause immediately", "Wait 6 months"], answer: 2 },
            { q: "What does ROAS stand for?", options: ["Rate of Ad Spending", "Return on Ad Spend", "Reach of Ad System", "Revenue of Active Searches"], answer: 1 },
          ]},
        ],
      },
    ],
  },
  {
    id: 7,
    slug: "personal-branding",
    title: "Personal Branding: Become Unforgettable",
    tagline: "Build a personal brand that attracts premium clients on autopilot.",
    description: "Learn how to position yourself, create compelling LinkedIn content, and build authority that commands premium rates.",
    category: "Business Development",
    difficulty: "Beginner",
    duration: "7 hours",
    earningsLift: "+70%",
    skills: ["LinkedIn", "Personal Branding", "Content Strategy", "Authority"],
    isFree: true,
    rating: 4.8,
    enrolled: 10500,
    color: "from-indigo-600 to-blue-600",
    emoji: "⭐",
    modules: [
      { id: "m1", title: "Module 1: Positioning & Niche", description: "Define who you are, who you serve, and why you're different.", milestone: "Brand Architect", milestoneEmoji: "🏛️",
        lessons: [
          { id: "l1-1", title: "The Riches Are in the Niches", type: "text", duration: "20 min", content: "**Generalists struggle. Specialists thrive.**\n\nWhy? Because specialists can charge more, get found more easily, and build reputation faster.\n\n**The Niche Decision Framework:**\n\n1. **Skills** — What are you genuinely good at?\n2. **Interest** — What could you talk about for 3 hours without notes?\n3. **Market** — Who will pay you and is growing?\n\nNiche = Intersection of all 3.\n\n**SA freelancer niche examples:**\n- 'React developer for South African fintech startups'\n- 'Copywriter for township economy brands'\n- 'Google Ads specialist for SA home service businesses'\n- 'Figma designer for SaaS products'\n- 'Project manager for Cape Town property developers'\n\n**Test your niche:**\n1. Google '[skill] + [niche] + South Africa'\n2. Are there businesses looking for this?\n3. Is there content about this topic on LinkedIn?\n\n**The riches are waiting in specific niches that feel 'too narrow'.**" },
          { id: "l1-2", title: "Your Positioning Statement", type: "text", duration: "20 min", content: "**The Positioning Formula:**\n'I help [specific audience] achieve [specific outcome] through [your unique approach], even if [common objection].'\n\n**Examples:**\n- 'I help Cape Town e-commerce brands increase checkout conversion by 25% through UX-driven redesigns, even if they've never had professional design before.'\n- 'I help South African SMEs automate their admin using no-code tools, even if they're not technical.'\n- 'I help fintech startups ship React dashboards 40% faster through component-driven architecture, even if their team is small.'\n\n**This statement goes:**\n- Top of your LinkedIn profile (headline)\n- First sentence of proposals\n- Your website hero\n- Your email signature\n- Intro at networking events\n\n**Your turn:** Write your positioning statement. Make it specific, outcome-focused, and with a unique angle." },
          { id: "l1-3", title: "Quiz: Positioning & Niche", type: "quiz", duration: "10 min", content: "Test your positioning knowledge.", quiz: [
            { q: "The Niche Decision Framework includes Skills, Interest, and what?", options: ["Experience", "Location", "Market", "Education"], answer: 2 },
            { q: "What completes: 'I help [audience] achieve [outcome] through [approach], even if...'?", options: ["...you're expensive", "...a common objection", "...competition exists", "...the market is small"], answer: 1 },
            { q: "Who earns more: generalists or specialists?", options: ["Generalists", "Both the same", "Specialists", "It depends only on experience"], answer: 2 },
          ]},
        ],
      },
      { id: "m2", title: "Module 2: LinkedIn Mastery", description: "Turn your LinkedIn profile into a client-attracting machine.", milestone: "LinkedIn Authority", milestoneEmoji: "💼",
        lessons: [
          { id: "l2-1", title: "The LinkedIn Profile That Converts", type: "text", duration: "25 min", content: "**7 sections that convert LinkedIn visitors into clients:**\n\n**1. Profile Photo:**\nProfessional, good lighting, looking at camera, slight smile.\nNO: sunglasses, group photos, logo, blank.\n\n**2. Banner Image:**\nYour positioning statement or a visual of your best work.\n\n**3. Headline (220 chars):**\nNot your job title — your positioning statement.\n'React Developer helping SA fintech startups ship faster | R0 → R5M ARR products | FreelanceSkills Top Rated'\n\n**4. About Section:**\nStory format: Problem you solve → How you solve it → Proof → CTA.\nFirst 3 lines must hook (visible without 'see more').\n\n**5. Experience:**\nAdd results and metrics, not just responsibilities.\n'Built 3 checkout flows that increased conversion by avg 28%' not 'Responsible for frontend development'.\n\n**6. Featured:**\nPin your 3 best: case study, testimonial, portfolio link.\n\n**7. Skills + Recommendations:**\nTop 3 skills should be your core service. Ask clients for recommendations." },
          { id: "l2-2", title: "LinkedIn Content That Gets Clients", type: "text", duration: "25 min", content: "**The Content Types That Work for Freelancers:**\n\n**1. Lessons from client work (best performer)**\n'I was working with a Cape Town startup last week. Their Google Ads were burning R15,000/month with no conversions. Here's the 3-thing audit that fixed it in 48 hours: [Thread]'\n\n**2. Controversial takes**\n'Hot take: Most SA freelancers are undercharging by 50%. Here's the uncomfortable math...'\n\n**3. Personal story with lesson**\n'In 2022, I took on a project I wasn't qualified for. It nearly destroyed my reputation. What I learned: [story]'\n\n**4. Before & after results**\n'Before: Client website, 0.8% checkout conversion. After: 2.3% conversion. Here's exactly what we changed: [breakdown]'\n\n**Posting frequency:** 3-4 times/week minimum for 90 days. Then results compound.\n\n**Format rules:**\n- First line: Strong hook. No context, pure intrigue.\n- Line 2: Blank (forces 'see more' click)\n- Use 3-4 word sentences at key moments\n- End with a question to drive comments" },
        ],
      },
      { id: "m3", title: "Module 3: Content Strategy", description: "90-day content plan that builds authority.", milestone: "Content Strategist", milestoneEmoji: "📅",
        lessons: [
          { id: "l3-1", title: "The 90-Day Authority Plan", type: "text", duration: "25 min", content: "**Phase 1 (Days 1-30): Foundation**\nGoal: Optimise profile, post consistently, understand what resonates.\n\nPost 3×/week. Mix: 40% lessons, 40% takes, 20% personal.\nTrack: Impressions, engagement rate (aim for 3%+).\n\n**Phase 2 (Days 31-60): Niche Down**\nGoal: Become the go-to person for one specific topic.\n\nChoose your content pillar: The 1 topic you post about relentlessly.\n- Write a weekly 'deep dive' post (800-1000 words)\n- Share 2 short insights from your work\n- Engage in 5 other people's posts daily\n\n**Phase 3 (Days 61-90): Monetise**\nGoal: Convert audience into clients.\n\n- Publish a comprehensive LinkedIn article (2000 words)\n- Offer a free 30-minute audit to your most engaged followers\n- Launch a lead magnet (free checklist/template/guide)\n- Direct message 5 ideal clients per week (warm outreach, not cold)\n\n**By Day 90:** If done consistently, most SA freelancers see:\n- 500-2000 new followers\n- 2-5 inbound inquiries\n- 1-2 new clients" },
          { id: "l3-2", title: "Quiz: Personal Branding Final", type: "quiz", duration: "10 min", content: "Final assessment for Personal Branding.", quiz: [
            { q: "What should your LinkedIn headline contain instead of your job title?", options: ["Your company name", "Your positioning statement", "Your phone number", "Your education"], answer: 1 },
            { q: "What is the best-performing content type for freelancers?", options: ["Job listings", "Lessons from client work", "Company news", "Motivational quotes"], answer: 1 },
            { q: "What should the first line of a LinkedIn post be?", options: ["A greeting", "Your bio", "A strong hook with no context", "A disclaimer"], answer: 2 },
          ]},
        ],
      },
      { id: "m4", title: "Module 4: Authority to Income", description: "Convert your brand into consistent client revenue.", milestone: "Brand Authority", milestoneEmoji: "👑",
        lessons: [
          { id: "l4-1", title: "Converting Followers to Clients", type: "text", duration: "20 min", content: "**The Authority → Client Pipeline:**\n\n```\nContent → Follower → Engaged → Warm Lead → Discovery Call → Client\n```\n\n**The DM that converts (never cold pitches):**\n\n'Hi [Name], your comment on [POST TOPIC] really resonated — particularly the point about [SPECIFIC THING]. I've been working in this exact space with [TYPE OF CLIENT] and found [RELEVANT INSIGHT]. Happy to share the full case study if useful — no pitch, just a conversation.'\n\n**The free audit offer:**\nPost: 'I'm offering 5 free [SKILL] audits this month to give back to the community. Here's what I cover: [3 bullet points]. DM me 'AUDIT' if interested.'\n\nThis generates leads and social proof simultaneously.\n\n**The referral system:**\nEvery completed project → ask for 2 referrals.\n'If you know 1-2 businesses that could use [YOUR SERVICE], I'd love an introduction. I'll prioritise them as existing client referrals.'\n\n**90 days in:** Your brand compounds. New clients mention seeing your content before reaching out. Your price resistance drops. Negotiations get easier." },
          { id: "l4-2", title: "Quiz: Authority to Income", type: "quiz", duration: "10 min", content: "Test your authority-to-income conversion skills.", quiz: [
            { q: "What is the correct DM approach to warm leads?", options: ["Send a direct pitch with your rates", "Reference their specific engagement and offer value", "Copy-paste the same message to everyone", "Ask for referrals immediately"], answer: 1 },
            { q: "How should you ask for referrals?", options: ["After every invoice", "After completed projects when clients are happiest", "On the first discovery call", "Never — wait for them to come naturally"], answer: 1 },
            { q: "What makes the free audit offer work?", options: ["It's free so everyone wants it", "It generates leads and social proof simultaneously", "It forces clients to hire you", "It's a legal requirement"], answer: 1 },
          ]},
        ],
      },
    ],
  },
  {
    id: 8,
    slug: "data-analytics-python-sql",
    title: "Data Analytics with Python & SQL",
    tagline: "Master Python, SQL, and data viz. Land R30-50k/month contracts.",
    description: "From zero to professional data analyst. Learn Python pandas, SQL queries, Power BI, and data storytelling for the South African market.",
    category: "Data Analytics",
    difficulty: "Intermediate",
    duration: "24 hours",
    earningsLift: "+140%",
    skills: ["Python", "SQL", "Power BI", "Pandas", "Data Viz"],
    isFree: false,
    rating: 4.9,
    enrolled: 3800,
    color: "from-teal-600 to-emerald-600",
    emoji: "📊",
    modules: [
      { id: "m1", title: "Module 1: Python Foundations", description: "Python basics specifically for data work.", milestone: "Python Initiate", milestoneEmoji: "🐍",
        lessons: [
          { id: "l1-1", title: "Python for Data — The Essentials", type: "text", duration: "35 min", content: "**Why Python for data?**\n- Most widely used data language globally\n- Massive SA job market demand (R30-80k/month contracts)\n- Free, open-source, runs on any machine\n\n**Python data essentials:**\n\n```python\n# Variables and types\nname = 'Sipho'          # string\nage = 28                # integer\nrate = 850.50           # float\nis_available = True     # boolean\n\n# Lists\nskills = ['Python', 'SQL', 'Power BI']\nskills.append('Tableau')\nprint(skills[0])  # 'Python'\n\n# Dictionaries\nfreelancer = {\n  'name': 'Sipho',\n  'rate': 850,\n  'skills': ['Python', 'SQL'],\n  'city': 'Durban'\n}\nprint(freelancer['city'])  # 'Durban'\n\n# Functions\ndef calculate_project_cost(hours, rate):\n  return hours * rate\n\ncost = calculate_project_cost(40, 850)\nprint(f'Project cost: R{cost}')  # R34000\n```\n\n**Install:** Download Anaconda (includes Python + Jupyter Notebook). Free." },
          { id: "l1-2", title: "Pandas: The Data Analysis Library", type: "text", duration: "40 min", content: "**Pandas is the backbone of Python data analysis.**\n\n```python\nimport pandas as pd\n\n# Load data\ndf = pd.read_csv('sa_freelancer_rates.csv')\n\n# Explore\nprint(df.head())          # First 5 rows\nprint(df.info())          # Column types and nulls\nprint(df.describe())      # Statistics\nprint(df.shape)           # (rows, columns)\n\n# Filter\nsenior = df[df['experience'] >= 5]\ncape_town = df[df['city'] == 'Cape Town']\nhigh_rate = df[df['hourly_rate'] > 1000]\n\n# Group and aggregate\ncity_avg = df.groupby('city')['hourly_rate'].mean()\nprint(city_avg)\n\n# Output:\n# Cape Town    1180\n# Johannesburg  950\n# Durban        820\n\n# Add columns\ndf['monthly_potential'] = df['hourly_rate'] * 160\n\n# Export\ndf.to_csv('cleaned_rates.csv', index=False)\ndf.to_excel('report.xlsx', index=False)\n```\n\n**Exercise:** Download the StatsSA employment dataset and find the average income by province." },
          { id: "l1-3", title: "Quiz: Python Foundations", type: "quiz", duration: "15 min", content: "Test your Python and Pandas knowledge.", quiz: [
            { q: "Which library is the backbone of Python data analysis?", options: ["NumPy", "Matplotlib", "Pandas", "Scikit-learn"], answer: 2 },
            { q: "How do you filter a DataFrame for rows where age > 30?", options: ["df.filter(age>30)", "df[df['age'] > 30]", "df.where(age > 30)", "df.select(age > 30)"], answer: 1 },
            { q: "Which command shows the first 5 rows of a DataFrame?", options: ["df.top()", "df.show()", "df.head()", "df.first()"], answer: 2 },
          ]},
        ],
      },
      { id: "m2", title: "Module 2: SQL for Data Analysis", description: "Query any database, join tables, and extract insights.", milestone: "SQL Analyst", milestoneEmoji: "🗄️",
        lessons: [
          { id: "l2-1", title: "SQL Essentials: Query, Filter, Sort", type: "text", duration: "35 min", content: "**SQL is the universal language of data.**\n\n```sql\n-- Basic query structure\nSELECT column1, column2\nFROM table_name\nWHERE condition\nORDER BY column1 DESC\nLIMIT 10;\n\n-- Real example: Find top-earning SA freelancers\nSELECT \n  name,\n  city,\n  hourly_rate,\n  skills,\n  (hourly_rate * 160) AS monthly_potential\nFROM freelancers\nWHERE country = 'South Africa'\n  AND is_verified = true\n  AND hourly_rate > 500\nORDER BY hourly_rate DESC\nLIMIT 20;\n\n-- Aggregate functions\nSELECT \n  city,\n  COUNT(*) AS freelancer_count,\n  AVG(hourly_rate) AS avg_rate,\n  MAX(hourly_rate) AS top_rate,\n  MIN(hourly_rate) AS entry_rate\nFROM freelancers\nWHERE country = 'South Africa'\nGROUP BY city\nHAVING COUNT(*) > 100\nORDER BY avg_rate DESC;\n```\n\n**Practice:** Use DB Fiddle (free) to practice SQL without installing anything." },
          { id: "l2-2", title: "JOINs: Combining Multiple Tables", type: "text", duration: "35 min", content: "**JOINs combine rows from multiple tables based on related columns.**\n\n```sql\n-- INNER JOIN: Only rows that match in both tables\nSELECT \n  f.name,\n  f.city,\n  j.title AS job_title,\n  j.budget,\n  a.status AS application_status\nFROM freelancers f\nINNER JOIN applications a ON f.id = a.freelancer_id\nINNER JOIN jobs j ON a.job_id = j.id\nWHERE j.created_at >= '2026-01-01'\n  AND a.status = 'hired'\nORDER BY j.budget DESC;\n\n-- LEFT JOIN: All freelancers, even those with no applications\nSELECT \n  f.name,\n  COUNT(a.id) AS total_applications,\n  COUNT(CASE WHEN a.status = 'hired' THEN 1 END) AS hired_count,\n  ROUND(COUNT(CASE WHEN a.status = 'hired' THEN 1 END) * 100.0 \n        / NULLIF(COUNT(a.id), 0), 1) AS hire_rate_pct\nFROM freelancers f\nLEFT JOIN applications a ON f.id = a.freelancer_id\nGROUP BY f.name\nHAVING COUNT(a.id) >= 5\nORDER BY hire_rate_pct DESC;\n```" },
        ],
      },
      { id: "m3", title: "Module 3: Data Visualization", description: "Tell compelling data stories with Python and Power BI.", milestone: "Data Visualizer", milestoneEmoji: "📈",
        lessons: [
          { id: "l3-1", title: "Python Data Visualization", type: "text", duration: "30 min", content: "**3 visualization libraries every SA data analyst needs:**\n\n**Matplotlib** (base layer):\n```python\nimport matplotlib.pyplot as plt\n\nrates = [650, 820, 1050, 1200, 1800]\nlevels = ['Junior', 'Mid', 'Senior', 'Lead', 'Principal']\n\nplt.bar(levels, rates, color='#10B981')\nplt.title('SA Developer Rates by Level')\nplt.ylabel('Rate (ZAR/hour)')\nplt.savefig('rates_chart.png', dpi=150, bbox_inches='tight')\n```\n\n**Seaborn** (statistical, beautiful defaults):\n```python\nimport seaborn as sns\nsns.boxplot(data=df, x='city', y='hourly_rate', palette='viridis')\n```\n\n**Plotly** (interactive charts for web):\n```python\nimport plotly.express as px\nfig = px.scatter(df, x='experience', y='hourly_rate', \n                 color='city', size='project_count',\n                 hover_data=['name', 'skills'])\nfig.show()\n```" },
          { id: "l3-2", title: "Quiz: Data Analysis Final", type: "quiz", duration: "10 min", content: "Final assessment for Data Analytics.", quiz: [
            { q: "What does an INNER JOIN return?", options: ["All rows from left table", "All rows from both tables", "Only rows that match in both tables", "Only rows unique to each table"], answer: 2 },
            { q: "Which library creates interactive Python charts?", options: ["Matplotlib", "Seaborn", "Plotly", "Pandas"], answer: 2 },
            { q: "What SA salary range can a data analyst contract command?", options: ["R5-10k/month", "R15-20k/month", "R30-50k+/month", "R100k/month"], answer: 2 },
          ]},
        ],
      },
      { id: "m4", title: "Module 4: Real Projects & Portfolio", description: "Build 3 real data analysis projects for your portfolio.", milestone: "Data Portfolio", milestoneEmoji: "💼",
        lessons: [
          { id: "l4-1", title: "Project 1: SA Freelancer Market Analysis", type: "text", duration: "40 min", content: "**Your capstone project: Analyse the SA freelancer market**\n\nThis becomes your portfolio centerpiece.\n\n**Dataset options:**\n1. Scrape FreelanceSkills.net job listings (with permission)\n2. Use StatsSA data on employment and income\n3. Use public Upwork/Fiverr data from Kaggle\n\n**Analysis questions to answer:**\n1. What are the fastest growing skills in SA?\n2. Which cities pay the highest freelancer rates?\n3. How does years of experience correlate with rate?\n4. What skills command premium rates?\n5. Is there a gender pay gap in SA freelancing?\n\n**Deliverables:**\n1. Jupyter Notebook with full analysis and code\n2. 5-slide executive summary (for non-technical clients)\n3. Interactive Plotly dashboard\n4. GitHub repo with clean, commented code\n5. LinkedIn post sharing key findings (instant lead generator)" },
        ],
      },
      { id: "m5", title: "Module 5: Freelance Data Career", description: "Land your first data contract and build a data practice.", milestone: "Data Expert", milestoneEmoji: "🏆",
        lessons: [
          { id: "l5-1", title: "Landing Your First Data Contract", type: "text", duration: "25 min", content: "**SA data analyst rates:**\n\nJunior (0-2 years): R15,000-25,000/month\nMid (2-5 years): R25,000-45,000/month\nSenior (5+ years): R45,000-80,000+/month\n\n**Types of data contracts:**\n1. Monthly retainer: R15-30k for 3-4 days/week\n2. Project-based: R20-80k per analysis project\n3. Embedded analyst: R40-80k/month full-time\n\n**Where to find data contracts in SA:**\n- FreelanceSkills.net (post your data profile)\n- LinkedIn (DM analytics managers at banks/insurers/retail)\n- PNet/Careers24 (contract roles, not just permanent)\n- Financial sector: Standard Bank, Discovery, Old Mutual, Nedbank all use freelancers\n- SA tech companies: Takealot, Naspers, Investec\n\n**The winning pitch:**\n'I can analyse [SPECIFIC DATASET] to identify [SPECIFIC OPPORTUNITY] worth [ESTIMATED VALUE] to your business. I've done this for [SIMILAR COMPANY].'" },
        ],
      },
    ],
  },
  {
    id: 9,
    slug: "high-ticket-sales",
    title: "High-Ticket Sales: Closing R50k+ Projects",
    tagline: "Land R50,000-500,000 contracts using proven sales psychology.",
    description: "Master discovery calls, objection handling, and closing techniques to consistently land high-value freelance contracts.",
    category: "Business Development",
    difficulty: "Advanced",
    duration: "10 hours",
    earningsLift: "+200%",
    skills: ["Sales", "Negotiation", "Discovery", "Closing"],
    isFree: false,
    rating: 4.9,
    enrolled: 2900,
    color: "from-emerald-600 to-teal-600",
    emoji: "💎",
    modules: [
      { id: "m1", title: "Module 1: High-Ticket Sales Mindset", description: "The psychology and mindset of closing large deals.", milestone: "Sales Mindset", milestoneEmoji: "🧠",
        lessons: [
          { id: "l1-1", title: "Why High-Ticket Changes Everything", type: "text", duration: "20 min", content: "**The math that will transform your freelance business:**\n\n**Low-ticket approach:**\n10 clients × R5,000/project = R50,000/month\n10 clients = 10 discovery calls, 10 contracts, 10 briefs, 10 feedback rounds, 10 invoices\n\n**High-ticket approach:**\n2 clients × R25,000/project = R50,000/month\n2 clients = 2 of everything above\n\n**Same income. 80% less admin.**\n\n**What makes high-ticket possible:**\n1. Confidence in your value\n2. A positioning that justifies premium\n3. A sales process that qualifies before pitching\n4. Willingness to walk away from bad-fit clients\n\n**The premium paradox:** Higher prices often ATTRACT better clients and result in FEWER objections. Cheap clients are the most difficult.\n\n**SA context:** R50,000+ projects are common in:\n- Fintech apps\n- E-commerce platforms\n- Corporate websites\n- Data systems\n- Marketing campaigns\n- Brand identity projects" },
          { id: "l1-2", title: "Qualifying: Only Speak to Buyers", type: "text", duration: "20 min", content: "**80% of freelancers' time is wasted on non-buyers.**\n\nQualification questions to ask before any call:\n\n**1. Budget:**\n'What's your approximate budget range for this project?'\nIf they say 'What's your rate?' respond: 'It varies from R15,000 to R150,000 depending on scope. Most projects like yours land in the R[X-X] range. Does that feel aligned?'\n\n**2. Decision authority:**\n'Who else will be involved in the decision?'\nYou need the decision-maker on the call.\n\n**3. Timeline:**\n'When are you looking to get started?'\n'Right away' → hot lead. '6 months' → warm, nurture.\n\n**4. Commitment:**\n'Is this a priority for your business right now?'\n\n**Red flags — disengage politely:**\n- 'We have no budget, but there's potential for equity'\n- 'My previous developer did this for R500'\n- 'We're comparing 20 quotes'\n- 'My nephew could probably do this'\n\n**Your time is your most valuable asset. Protect it ruthlessly.**" },
          { id: "l1-3", title: "Quiz: High-Ticket Mindset", type: "quiz", duration: "10 min", content: "Test your high-ticket sales mindset.", quiz: [
            { q: "What is the main advantage of 2 R25k clients vs 10 R5k clients?", options: ["More income", "More experience", "80% less admin for same income", "Better portfolio"], answer: 2 },
            { q: "What should you do when a prospect says 'My nephew could do this for free'?", options: ["Lower your price", "Disengage politely — they're not a buyer", "Offer free discovery", "Argue your value"], answer: 1 },
            { q: "Why do higher prices often attract BETTER clients?", options: ["Rich clients are always nice", "Premium prices filter out difficult low-budget buyers", "High prices signal worse quality", "It's a myth"], answer: 1 },
          ]},
        ],
      },
      { id: "m2", title: "Module 2: The Discovery Call System", description: "Master the discovery process that closes deals before pitching.", milestone: "Discovery Expert", milestoneEmoji: "🔍",
        lessons: [
          { id: "l2-1", title: "The Discovery Framework", type: "text", duration: "30 min", content: "**Discovery is not a sales call. It's a diagnostic session.**\n\nYou are a doctor. Doctors don't prescribe without diagnosing.\n\n**The SPIN Selling model adapted for freelancers:**\n\n**S — Situation Questions** (understand where they are now)\n'Tell me about your current [website/system/process]...'\n'How are you currently handling [challenge]?'\n'What does your team size look like?'\n\n**P — Problem Questions** (uncover pain)\n'What's the biggest frustration with your current setup?'\n'What happens when [system fails]?'\n'What's it costing you to not have this solved?'\n\n**I — Implication Questions** (amplify the pain)\n'If this isn't solved in the next 6 months, what does that mean for your growth targets?'\n'How is this affecting your team's productivity?'\n'What does this mean for your relationship with clients?'\n\n**N — Need-Payoff Questions** (get them to articulate the solution)\n'If we fixed this, what would that mean for your business?'\n'How would your team's day look different?'\n'What's the financial impact of solving this?'\n\n**By the end, the client has convinced themselves they need you.**" },
          { id: "l2-2", title: "Objection Handling Scripts", type: "text", duration: "25 min", content: "**Every objection has a perfect response. Prepare them all.**\n\n**'Your price is too high'**\nResponse: 'Compared to what? Let me understand what you were expecting... [pause] ... What I'm hearing is the investment feels significant. Let me share what my clients typically see in return: [specific ROI story]. Does that change the calculation?'\n\n**'We need to think about it'**\nResponse: 'Of course. To make sure I give you everything you need to decide: what specifically would need to be true for this to be a clear yes? [pause] ... And what's your timeline for making this decision?'\n\n**'Can you do it cheaper?'**\nResponse: 'I could reduce the investment, yes. But let me ask — which part of the scope do you want to cut? Because the budget and the outcome are directly connected. If you need the full outcome, we need the full investment.'\n\n**'We're talking to other people'**\nResponse: 'That makes sense. I'd encourage you to. As you evaluate options, here are 5 questions I'd ask every person you're considering... [questions that highlight your strengths]'" },
        ],
      },
      { id: "m3", title: "Module 3: Closing Techniques", description: "Ask for the sale with confidence. Handle the final yes.", milestone: "Closer", milestoneEmoji: "🎯",
        lessons: [
          { id: "l3-1", title: "The 5 Closes Every Freelancer Needs", type: "text", duration: "25 min", content: "**1. The Assumptive Close**\n'So, if I send you the proposal by Thursday, what's the best way to move forward from there?'\n\n**2. The Summary Close**\n'Let me confirm what we've discussed: [recap their goals, pain, desired outcome]. And the investment is R[X]. Does this all make sense and feel right?'\n\n**3. The Urgency Close (only if true)**\n'I have space for one project starting [DATE]. I'm speaking with two other clients this week. If you want that slot, we'd need to confirm by [DATE]. Would that work?'\n\n**4. The Scale Close**\n'On a scale of 1-10, how ready do you feel to move forward?' [If 7+: 'What would make it a 10?'] [If under 7: 'What's holding you back?']\n\n**5. The Alternative Close**\n'Would you prefer to start with Phase 1 for R25,000, or the full scope for R60,000 with a 10% discount?'\n\n**The most important rule:** SHUT UP after you ask.\nThe first person to speak after the close loses.\nSit in silence. Breathe. Let them respond." },
          { id: "l3-2", title: "Quiz: Closing & Objections", type: "quiz", duration: "10 min", content: "Test your sales closing skills.", quiz: [
            { q: "What should you do immediately after asking a closing question?", options: ["Follow up with more questions", "Explain your reasoning", "Shut up and let them respond", "Lower your price"], answer: 2 },
            { q: "SPIN stands for Situation, Problem, Implication, and...?", options: ["Negotiation", "Need-Payoff", "Navigation", "Net-value"], answer: 1 },
            { q: "What does the Assumptive Close assume?", options: ["The client will say no", "The sale is already agreed — just confirming next steps", "The price is negotiable", "The project will take longer"], answer: 1 },
          ]},
        ],
      },
      { id: "m4", title: "Module 4: Contracts & Onboarding", description: "Close the deal, sign the contract, and start profitably.", milestone: "Deal Closer", milestoneEmoji: "🏆",
        lessons: [
          { id: "l4-1", title: "Contracts That Protect You", type: "text", duration: "20 min", content: "**Every freelance contract must include:**\n\n1. **Scope of work** — Detailed and specific. 'Design 5 screens' not 'Design the app'\n2. **Deliverables** — Exactly what you'll deliver and in what format\n3. **Timeline** — Milestone dates with client review windows\n4. **Revisions** — 'Includes 2 rounds of revisions. Additional rounds: R[X]/hour'\n5. **Payment schedule:**\n   - 50% upfront before work begins\n   - 25% at Phase 1 delivery\n   - 25% at final delivery\n6. **Ownership:** 'IP transfers to client upon receipt of final payment'\n7. **Termination clause:** 'Client may cancel with 14 days notice. Work completed to that point is billable.'\n8. **Confidentiality:** Standard NDA language\n\n**Free contract tools:**\n- Docusign (7-day free trial)\n- HelloSign\n- Adobe Acrobat Sign\n- Bonsai (purpose-built for freelancers)\n\n**Never start work without a signed contract and deposit in your account.**" },
        ],
      },
    ],
  },
  {
    id: 10,
    slug: "content-marketing",
    title: "Content Marketing: Build Authority",
    tagline: "Blog, LinkedIn, YouTube: become the go-to expert in your niche.",
    description: "Build a content marketing machine that generates leads on autopilot. Learn SEO, content strategy, distribution, and monetisation.",
    category: "Digital Marketing",
    difficulty: "Intermediate",
    duration: "12 hours",
    earningsLift: "+85%",
    skills: ["Content Strategy", "SEO", "LinkedIn", "Blogging"],
    isFree: false,
    rating: 4.7,
    enrolled: 5100,
    color: "from-purple-600 to-indigo-600",
    emoji: "📝",
    modules: [
      { id: "m1", title: "Module 1: Content Strategy Foundation", description: "Build a content strategy that generates consistent leads.", milestone: "Content Strategist", milestoneEmoji: "🎯",
        lessons: [
          { id: "l1-1", title: "The Content Marketing Flywheel", type: "text", duration: "25 min", content: "**Content marketing is the only marketing that gets more valuable over time.**\n\nA blog post you write today will still generate leads in 3 years.\nA cold email you send today stops working tomorrow.\n\n**The Content Flywheel:**\n```\nCreate Content → SEO/Distribution → New Audience → Trust Built → Leads Generated → Revenue → Create Better Content\n```\n\n**The SA content marketing opportunity:**\n- Only 12% of SA businesses publish consistent content\n- SA Google search volume is growing 22% YoY\n- SA LinkedIn has 7M+ users (most in Africa)\n- Afrikaans/Zulu content has almost zero competition\n\n**Your content goal as a freelancer:**\nNot virality. Not followers. **Leads.**\n\nEvery piece of content should have a path to a lead:\n- Blog post → Email subscribe → Lead magnet → Discovery call\n- LinkedIn post → Profile visit → DM request → Discovery call\n- YouTube video → Description link → Landing page → Booking" },
          { id: "l1-2", title: "Finding Your Content Pillars", type: "text", duration: "20 min", content: "**Content pillars** are the 3-5 themes you consistently create content around.\n\n**How to choose yours:**\n1. What do your ideal clients struggle with?\n2. What topics are you genuinely expert in?\n3. What questions do prospects ask on your discovery calls?\n4. What topics rank on Google for your niche + location?\n\n**Example: React developer targeting SA fintech**\n- Pillar 1: React & Next.js tutorials (skill demonstration)\n- Pillar 2: SA fintech landscape (niche authority)\n- Pillar 3: Freelance business tips (audience growth)\n- Pillar 4: Client case studies (social proof)\n- Pillar 5: Salary/rate benchmarks (high search intent)\n\n**Content calendar:**\n- Week 1: Tutorial (skill demo)\n- Week 2: Case study (social proof)\n- Week 3: Industry insight (authority)\n- Week 4: How-to guide (SEO)" },
          { id: "l1-3", title: "Quiz: Content Strategy", type: "quiz", duration: "10 min", content: "Test your content strategy knowledge.", quiz: [
            { q: "Why is content marketing more valuable than cold outreach over time?", options: ["It's cheaper to produce", "Old content still generates leads years later", "It requires less skill", "It's easier to distribute"], answer: 1 },
            { q: "What percentage of SA businesses publish consistent content?", options: ["12%", "45%", "72%", "90%"], answer: 0 },
            { q: "What is the ultimate goal of freelancer content marketing?", options: ["Virality", "Followers", "Leads", "Comments"], answer: 2 },
          ]},
        ],
      },
      { id: "m2", title: "Module 2: SEO for Freelancers", description: "Rank on Google and get found by clients organically.", milestone: "SEO Expert", milestoneEmoji: "🔍",
        lessons: [
          { id: "l2-1", title: "SEO Fundamentals for Freelancer Websites", type: "text", duration: "30 min", content: "**SEO makes clients find you instead of you finding them.**\n\n**The 3 pillars of SEO:**\n\n**1. Technical SEO (Foundation)**\n- Fast loading (< 3 seconds)\n- Mobile-first responsive\n- HTTPS/SSL certificate\n- Clean URL structure (/services/react-development not /page?id=12)\n\n**2. On-Page SEO (Content signals)**\n- Target keyword in: Title tag, H1, first 100 words, image alt text, URL\n- Internal links between related pages\n- External links to authority sources\n- Structured content (H2s, bullet points, tables)\n\n**3. Off-Page SEO (Trust signals)**\n- Backlinks from other websites\n- Google My Business listing\n- Local directory listings (SA Business Directory, Hotfrog)\n\n**SA local SEO keywords to target:**\n- '[Skill] freelancer [city]': 'React developer Cape Town'\n- '[Service] South Africa': 'Figma design South Africa'\n- '[Niche] specialist SA': 'Fintech UX designer SA'\n\n**Free tools:** Google Search Console, Ubersuggest, AnswerThePublic" },
        ],
      },
      { id: "m3", title: "Module 3: LinkedIn & Long-Form Content", description: "Master LinkedIn articles, newsletters, and long-form authority content.", milestone: "Content Creator", milestoneEmoji: "✍️",
        lessons: [
          { id: "l3-1", title: "LinkedIn Articles That Generate Leads", type: "text", duration: "25 min", content: "**LinkedIn Articles (long-form) vs Posts (short-form):**\n\nArticles: 800-2000 words, indexed by Google, build long-term authority\nPosts: 150-500 words, algorithm-boosted, build short-term engagement\n\n**Article formula that generates client inquiries:**\n\n**Title:** 'How [TYPE OF BUSINESS] Can [ACHIEVE OUTCOME] Using [YOUR METHOD]'\nExample: 'How Cape Town E-commerce Stores Can Double Checkout Conversion in 6 Weeks'\n\n**Structure:**\n1. Hook: The specific problem (2 paragraphs)\n2. The cost of not solving it (1 paragraph)\n3. The solution framework (your method, 3-5 steps)\n4. Case study: A real example with results\n5. Action step: What to do right now\n6. CTA: 'If you're dealing with this, let's talk'\n\n**Distribution:** Post article link on LinkedIn post, in relevant LinkedIn Groups, as a link in your email signature.\n\n**Frequency:** 1 article/month minimum. 2/month optimal." },
          { id: "l3-2", title: "Quiz: Content Marketing Final", type: "quiz", duration: "10 min", content: "Final assessment for Content Marketing.", quiz: [
            { q: "What are the 3 pillars of SEO?", options: ["Writing, Editing, Publishing", "Technical, On-Page, Off-Page", "Keywords, Links, Speed", "Google, Bing, Yahoo"], answer: 1 },
            { q: "What is the optimal frequency for LinkedIn articles?", options: ["Daily", "Once per week", "1-2 per month", "Once per year"], answer: 2 },
            { q: "What makes content marketing compound in value over time?", options: ["You spend more money", "Old content continues to rank and generate leads", "You get more followers", "The algorithms change"], answer: 1 },
          ]},
        ],
      },
      { id: "m4", title: "Module 4: Monetising Your Content", description: "Turn your content audience into consulting, courses, and retainer revenue.", milestone: "Content Monetiser", milestoneEmoji: "💰",
        lessons: [
          { id: "l4-1", title: "Content to Revenue Funnels", type: "text", duration: "25 min", content: "**The Content Monetisation Ladder:**\n\n**Rung 1: Awareness**\nFree content: LinkedIn posts, blog articles, YouTube videos\n→ Grows audience, builds trust\n\n**Rung 2: Conversion**\nLead magnet: Free guide, checklist, template, mini-course\n→ Capture email addresses\nEmail sequence: 5-7 emails over 10 days → warm relationship\n\n**Rung 3: Entry offer**\nR500-2,000: Audit, workshop, consultation hour, template pack\n→ First transaction, proves value\n\n**Rung 4: Core offer**\nR10,000-50,000: Your main freelance service\n→ Proposed only to warm leads who've converted at lower rungs\n\n**Rung 5: Premium**\nR50,000+: Done-for-you, retainer, enterprise\n→ Reserved for best clients, highest value\n\n**The key insight:** Most freelancers skip Rungs 1-3 and go straight to cold pitching Rung 4. That's why they struggle. Build the ladder." },
          { id: "l4-2", title: "Quiz: Monetisation Final", type: "quiz", duration: "10 min", content: "Final content marketing assessment.", quiz: [
            { q: "What is Rung 2 in the Content Monetisation Ladder?", options: ["Core offer", "Premium service", "Lead magnet and email capture", "Social media posting"], answer: 2 },
            { q: "What mistake do most freelancers make in content monetisation?", options: ["Creating too much content", "Skipping to cold pitching without warming the audience", "Charging too much", "Using too many platforms"], answer: 1 },
            { q: "What price range is appropriate for a Rung 3 entry offer?", options: ["R50-100", "R500-2,000", "R10,000+", "Free only"], answer: 1 },
          ]},
        ],
      },
    ],
  },
  {
    id: 11,
    slug: "responsive-web-design",
    title: "Responsive Web Design & Mobile-First",
    tagline: "Master CSS Grid, Flexbox, and build beautiful websites.",
    description: "Build professional, responsive websites from scratch. Learn HTML, CSS, Tailwind, and mobile-first design principles.",
    category: "Web Development",
    difficulty: "Beginner",
    duration: "8 hours",
    earningsLift: "+40%",
    skills: ["HTML", "CSS", "Tailwind CSS", "Responsive Design"],
    isFree: true,
    rating: 4.7,
    enrolled: 11200,
    color: "from-sky-600 to-blue-700",
    emoji: "🌐",
    modules: [
      { id: "m1", title: "Module 1: HTML & CSS Foundations", description: "The building blocks of every website.", milestone: "Web Initiate", milestoneEmoji: "🌱",
        lessons: [
          { id: "l1-1", title: "HTML: Structure of the Web", type: "text", duration: "30 min", content: "**HTML is the skeleton. CSS is the skin. JavaScript is the muscles.**\n\n```html\n<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>SA Freelancer Portfolio</title>\n</head>\n<body>\n  <header>\n    <nav>\n      <a href=\"/\">Home</a>\n      <a href=\"/work\">Work</a>\n      <a href=\"/contact\">Contact</a>\n    </nav>\n  </header>\n  \n  <main>\n    <section class=\"hero\">\n      <h1>I Build Websites for SA Businesses</h1>\n      <p>Cape Town-based front-end developer. 5+ years experience.</p>\n      <a href=\"/contact\" class=\"btn\">Let's Work Together</a>\n    </section>\n  </main>\n  \n  <footer>\n    <p>© 2026 Your Name. Made in Cape Town 🇿🇦</p>\n  </footer>\n</body>\n</html>\n```\n\n**Semantic HTML elements to always use:**\n`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`\n\nThese improve SEO and accessibility. Google and screen readers understand semantic HTML." },
          { id: "l1-2", title: "CSS Flexbox: The Layout Tool", type: "text", duration: "30 min", content: "**Flexbox solves 90% of layout challenges.**\n\n```css\n/* Basic flex container */\n.navbar {\n  display: flex;\n  justify-content: space-between; /* Left and right sides */\n  align-items: center;           /* Vertically centered */\n  padding: 16px 24px;\n  background: #0F172A;\n}\n\n/* Flex children */\n.nav-links {\n  display: flex;\n  gap: 32px;  /* Space between links */\n  list-style: none;\n}\n\n/* Card grid */\n.card-grid {\n  display: flex;\n  flex-wrap: wrap;  /* Wrap to new line */\n  gap: 24px;\n}\n\n.card {\n  flex: 1 1 300px;  /* Grow/shrink, min 300px width */\n  /* This creates a responsive grid without media queries! */\n}\n```\n\n**The Flexbox cheat sheet:**\n- `justify-content`: Main axis (horizontal in row)\n- `align-items`: Cross axis (vertical in row)\n- `flex-wrap`: Allow wrapping\n- `gap`: Space between items (better than margin)" },
          { id: "l1-3", title: "Quiz: HTML & CSS", type: "quiz", duration: "10 min", content: "Test your HTML and CSS knowledge.", quiz: [
            { q: "Which HTML element is most appropriate for a navigation menu?", options: ["<div>", "<nav>", "<section>", "<header>"], answer: 1 },
            { q: "What does 'justify-content: space-between' do in Flexbox?", options: ["Adds space inside elements", "Puts equal space between flex items", "Centers all items", "Aligns items vertically"], answer: 1 },
            { q: "What does 'flex: 1 1 300px' mean?", options: ["Fixed width of 300px", "Can grow/shrink with minimum 300px width", "Max width of 300px", "Three columns"], answer: 1 },
          ]},
        ],
      },
      { id: "m2", title: "Module 2: Tailwind CSS", description: "Build faster with utility-first CSS.", milestone: "Tailwind Developer", milestoneEmoji: "🎨",
        lessons: [
          { id: "l2-1", title: "Tailwind CSS: Build 5× Faster", type: "text", duration: "30 min", content: "**Tailwind is utility-first CSS — you style directly in HTML.**\n\n```html\n<!-- Without Tailwind -->\n<div class=\"hero-section\">\n  <h1 class=\"hero-title\">Hello</h1>\n</div>\n\n<style>\n  .hero-section { padding: 64px 24px; background: #0F172A; }\n  .hero-title { font-size: 48px; font-weight: bold; color: white; }\n</style>\n\n<!-- With Tailwind -->\n<div class=\"py-16 px-6 bg-slate-950\">\n  <h1 class=\"text-5xl font-bold text-white\">Hello</h1>\n</div>\n```\n\n**No context switching.** No naming classes. No CSS files.\n\n**Most-used Tailwind classes:**\n- Spacing: `p-4`, `px-6`, `py-8`, `m-4`, `gap-4`\n- Colors: `bg-slate-950`, `text-emerald-500`, `border-gray-700`\n- Typography: `text-xl`, `font-bold`, `text-center`, `leading-relaxed`\n- Layout: `flex`, `grid`, `grid-cols-3`, `items-center`, `justify-between`\n- Responsive: `sm:text-xl`, `md:grid-cols-2`, `lg:px-8`\n\n**Install:** Add CDN in head or install via npm. Use the Tailwind Play CDN for prototyping." },
          { id: "l2-2", title: "Responsive Design with Tailwind", type: "text", duration: "25 min", content: "**Tailwind's mobile-first breakpoints:**\n\n```html\n<!-- Mobile: 1 column | Tablet: 2 cols | Desktop: 3 cols -->\n<div class=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">\n  <div class=\"bg-slate-900 p-6 rounded-xl\">Card 1</div>\n  <div class=\"bg-slate-900 p-6 rounded-xl\">Card 2</div>\n  <div class=\"bg-slate-900 p-6 rounded-xl\">Card 3</div>\n</div>\n\n<!-- Text that scales: small on mobile, large on desktop -->\n<h1 class=\"text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-bold\">\n  The Future of Work\n</h1>\n\n<!-- Hidden on mobile, visible on desktop -->\n<div class=\"hidden lg:block\">\n  Desktop sidebar\n</div>\n\n<!-- Full width on mobile, auto on desktop -->\n<button class=\"w-full sm:w-auto px-8 py-3 bg-emerald-500\">\n  Get Started\n</button>\n```\n\n**Breakpoints:**\n- No prefix: Mobile (< 640px)\n- `sm:` ≥ 640px\n- `md:` ≥ 768px\n- `lg:` ≥ 1024px\n- `xl:` ≥ 1280px" },
        ],
      },
      { id: "m3", title: "Module 3: Build a Portfolio Website", description: "Build and deploy a professional portfolio from scratch.", milestone: "Portfolio Builder", milestoneEmoji: "🌟",
        lessons: [
          { id: "l3-1", title: "Portfolio Design & Development", type: "text", duration: "40 min", content: "**Build this portfolio structure:**\n\n1. **Hero** — Name, title, CTA\n2. **About** — Short bio, skills badges\n3. **Work** — 3-6 project cards with images, description, tech stack\n4. **Testimonials** — 2-3 client quotes\n5. **Contact** — Form + links\n\n**Hero section code:**\n```html\n<section class=\"min-h-screen flex items-center justify-center bg-slate-950 px-4\">\n  <div class=\"max-w-4xl mx-auto text-center\">\n    <p class=\"text-emerald-500 font-medium mb-4 tracking-wider\">AVAILABLE FOR PROJECTS</p>\n    <h1 class=\"text-5xl md:text-7xl font-bold text-white mb-6\">\n      Hi, I'm <span class=\"text-emerald-400\">Thabo</span>.<br>\n      I build for the web.\n    </h1>\n    <p class=\"text-xl text-slate-400 mb-8 max-w-xl mx-auto\">\n      Frontend developer based in Johannesburg. I help SA businesses build\n      fast, beautiful websites and applications.\n    </p>\n    <div class=\"flex gap-4 justify-center\">\n      <a href=\"#work\" class=\"px-8 py-4 bg-emerald-500 text-slate-950 rounded-lg font-bold hover:bg-emerald-400 transition-colors\">\n        See My Work\n      </a>\n      <a href=\"#contact\" class=\"px-8 py-4 border border-slate-600 text-white rounded-lg font-medium hover:border-emerald-500 transition-colors\">\n        Get In Touch\n      </a>\n    </div>\n  </div>\n</section>\n```" },
          { id: "l3-2", title: "Quiz: Web Design Final", type: "quiz", duration: "10 min", content: "Final assessment for Responsive Web Design.", quiz: [
            { q: "In Tailwind, what does 'md:grid-cols-2' mean?", options: ["Always 2 columns", "2 columns on medium screens and above", "Medium sized 2 columns", "2 column medium gap"], answer: 1 },
            { q: "Which Tailwind class makes text appear only on large screens?", options: ["hidden-mobile", "lg:block hidden", "hidden lg:block", "desktop-only"], answer: 2 },
            { q: "What is the recommended structure for a freelancer portfolio?", options: ["Just a contact form", "Hero, About, Work, Testimonials, Contact", "Only portfolio images", "Blog + Work + About"], answer: 1 },
          ]},
        ],
      },
      { id: "m4", title: "Module 4: Deploy & Get Clients", description: "Launch your portfolio and land your first web design clients.", milestone: "Web Developer", milestoneEmoji: "🚀",
        lessons: [
          { id: "l4-1", title: "Deploy Free in 5 Minutes", type: "text", duration: "15 min", content: "**3 free ways to deploy your portfolio:**\n\n**Option 1: Netlify (Recommended)**\n1. Drag your project folder to netlify.com/drop\n2. Get a URL instantly: `your-name.netlify.app`\n3. Custom domain: Add in settings → DNS records\n\n**Option 2: GitHub Pages**\n1. Push code to GitHub\n2. Settings → Pages → Source: main branch\n3. URL: `username.github.io/portfolio`\n\n**Option 3: Vercel**\nConnect GitHub → auto-deploy on every push\n\n**Custom domain ($5-15/year):**\n- Buy from GoDaddy, Namecheap, or Afrihost (local)\n- Point DNS to your hosting\n- SSL/HTTPS is automatic on all platforms\n\n**Getting your first client:**\n1. Post your portfolio on LinkedIn (use the 'Featured' section)\n2. Join Cape Town / JHB tech WhatsApp groups\n3. Post on FreelanceSkills.net (free profile)\n4. Reach out to 3 local businesses with outdated websites\n5. Offer a free audit to start the conversation" },
        ],
      },
    ],
  },
  {
    id: 12,
    slug: "video-editing",
    title: "Video Editing: DaVinci Resolve & Premiere",
    tagline: "Edit YouTube, social, and corporate videos. Land R8,000+ projects.",
    description: "Learn professional video editing from scratch using DaVinci Resolve (free) and Adobe Premiere. Build a video editing practice.",
    category: "Video & Animation",
    difficulty: "Beginner",
    duration: "12 hours",
    earningsLift: "+75%",
    skills: ["DaVinci Resolve", "Adobe Premiere", "Color Grading", "Audio"],
    isFree: true,
    rating: 4.6,
    enrolled: 6700,
    color: "from-red-600 to-pink-600",
    emoji: "🎬",
    modules: [
      { id: "m1", title: "Module 1: Video Editing Fundamentals", description: "Software, interface, and the language of editing.", milestone: "Editor Initiate", milestoneEmoji: "🎞️",
        lessons: [
          { id: "l1-1", title: "DaVinci Resolve: Free Professional Tool", type: "text", duration: "25 min", content: "**DaVinci Resolve is free and used by Hollywood.**\n\nThe same tool behind Netflix productions is free to download. For most freelancers, the free version is sufficient.\n\n**6 Workspaces (Pages):**\n1. **Cut** — Fast editing, simplified interface\n2. **Edit** — Full editing timeline\n3. **Fusion** — Motion graphics & VFX\n4. **Color** — Industry-leading colour grading\n5. **Fairlight** — Professional audio\n6. **Deliver** — Export\n\n**The Edit page layout:**\n- Media Pool (top left): Your imported footage\n- Viewer (top center): Preview your edit\n- Inspector (top right): Clip properties\n- Timeline (bottom): Your edit sequence\n\n**Essential keyboard shortcuts:**\n- `I` / `O` — Set In/Out points\n- `D` — Delete gap\n- `Ctrl+Z` — Undo\n- `Space` — Play/pause\n- `J`, `K`, `L` — Rewind, pause, fast-forward\n- `Ctrl+B` — Blade (cut clip)\n- `Shift+Z` — Fit timeline to window\n\n**Your first project:** Import any personal video footage and create a 30-second highlight reel." },
          { id: "l1-2", title: "The 3-Point Edit & Cutting Principles", type: "text", duration: "25 min", content: "**Professional editing isn't about effects — it's about story.**\n\n**The 3 rules of cutting:**\n1. **Cut on action** — The eye follows movement. Cut as someone starts to move or gesture.\n2. **Cut on sound** — Dialogue-driven cuts should follow the audio rhythm.\n3. **Cut for purpose** — Every cut must serve the story.\n\n**The 5 types of cuts:**\n1. **Straight cut** — Instant cut from one shot to another (most common)\n2. **J-cut** — Audio from next shot starts before the visual\n3. **L-cut** — Audio from current shot continues over next visual\n4. **Jump cut** — Same angle, different time (popular on YouTube)\n5. **Match cut** — Two shots matched by shape, movement, or concept\n\n**The 3-Point Edit:**\n1. Set In point on source clip (where you want to start)\n2. Set Out point on source clip (where you want to end)\n3. Place playhead in timeline where you want it to go\n4. Press F9 (Insert) or F10 (Overwrite)\n\n**Pacing:** Most YouTube videos cut every 3-5 seconds. Corporate videos cut every 7-10 seconds. Action cuts every 1-2 seconds." },
          { id: "l1-3", title: "Quiz: Video Editing Basics", type: "quiz", duration: "10 min", content: "Test your video editing knowledge.", quiz: [
            { q: "Which page in DaVinci Resolve is for colour grading?", options: ["Edit", "Fusion", "Color", "Deliver"], answer: 2 },
            { q: "What keyboard shortcut cuts a clip in DaVinci Resolve?", options: ["Ctrl+C", "X", "Ctrl+B", "Shift+K"], answer: 2 },
            { q: "Which cut type keeps the previous audio playing over the new visual?", options: ["J-cut", "L-cut", "Match cut", "Jump cut"], answer: 1 },
          ]},
        ],
      },
      { id: "m2", title: "Module 2: Colour Grading & Audio", description: "Make your footage look professional and cinematic.", milestone: "Color Expert", milestoneEmoji: "🎨",
        lessons: [
          { id: "l2-1", title: "Colour Grading for Beginners", type: "text", duration: "30 min", content: "**Colour grading transforms amateur footage into professional video.**\n\n**2-step colour correction workflow:**\n\n**Step 1: Primary Colour Correction (Fix)**\nMake footage look accurate and balanced:\n- Exposure: Lift (shadows), Gamma (midtones), Gain (highlights)\n- White Balance: Remove colour cast (orange/blue tint)\n- Contrast: Add depth between darks and lights\n\n**Step 2: Creative Grade (Style)**\nGive it a distinctive look:\n- Cinematically dark: Lift shadows slightly, crush blacks, add blue in shadows\n- Warm corporate: Slight orange push, lifted shadows, warm highlights\n- Clean and bright: Neutral white balance, high contrast, saturated greens\n\n**SA content creator look:**\nWarm skin tones + rich, saturated environment colours + lifted shadows\n\n**Using LUTs:**\nLUTs (Look Up Tables) are preset colour grades. Free and paid.\n- Apply a LUT then reduce opacity to 50-70% for subtlety\n- Popular free LUT packs: Cinematic Luts, FREE Luts\n\n**Key tools in DaVinci Color page:**\n- Wheels (Lift/Gamma/Gain)\n- Curves (precise RGB control)\n- Scopes (check if exposure is correct)\n- Power Windows (isolate areas for selective grading)" },
          { id: "l2-2", title: "Audio: The Hidden 50%", type: "text", duration: "25 min", content: "**Bad audio kills good video. Great audio forgives mediocre video.**\n\n**Audio mixing in DaVinci Fairlight:**\n\n**1. Set levels:**\n- Dialogue should peak at -12dB to -6dB\n- Music should sit at -18dB to -24dB (under dialogue)\n- Sound effects: Context-dependent\n\n**2. Remove noise:**\nFairlight Noise Reduction → Sample a section of background noise → Apply\n\n**3. EQ dialogue:**\n- Cut below 80Hz (remove rumble)\n- Boost 2-5kHz (adds presence/clarity)\n- Cut 250-500Hz (reduces muddiness)\n\n**4. Compression:**\nEven out dialogue volume — soft parts louder, loud parts quieter\nSetting: Ratio 3:1, Attack 5ms, Release 100ms\n\n**5. Stereo width:**\nDialogue: Keep mono (center)\nMusic: Full stereo\nAmbience: Stereo\n\n**Free music sources for commercial use:**\n- YouTube Audio Library\n- Epidemic Sound (subscription)\n- Artlist (subscription, SA usage)\n- ccMixter (free, attribution required)" },
        ],
      },
      { id: "m3", title: "Module 3: Titles, Graphics & Export", description: "Professional title sequences, lower thirds, and export settings.", milestone: "Video Producer", milestoneEmoji: "🎥",
        lessons: [
          { id: "l3-1", title: "Titles & Lower Thirds", type: "text", duration: "25 min", content: "**Professional title design principles:**\n\n**Lower Thirds (identifying text bars):**\nRule: Maximum 2 lines. Name + Title.\nFont: Clean sans-serif (Helvetica, Montserrat, Inter)\nAnimation: Slide in from left or fade in (0.3-0.5 second)\nPosition: Lower third of screen (hence the name)\n\n**DaVinci Titles:**\n1. Effects Library → Titles → drag to timeline\n2. Inspector → Edit text, font, size, colour\n3. Add keyframes for animation\n\n**Consistent brand system:**\nCreate a template with your brand colours and font.\nEvery video uses the same templates. This builds brand recognition.\n\n**SA client types that need video:**\n- Property agents (listings, virtual tours)\n- Restaurants (menu videos, atmosphere)\n- Event companies (recaps, promos)\n- Corporates (testimonials, case studies)\n- Training companies (educational content)\n- YouTubers (editing only)\n\n**Rates:**\n- YouTube video edit (10-15 min): R800-2,000\n- Corporate testimonial: R3,000-6,000\n- Product promo: R5,000-15,000\n- Full corporate production: R15,000-50,000" },
          { id: "l3-2", title: "Quiz: Video Editing Final", type: "quiz", duration: "10 min", content: "Final assessment for Video Editing.", quiz: [
            { q: "What dB level should dialogue peak at for video?", options: ["-3dB to 0dB", "-12dB to -6dB", "-30dB to -24dB", "0dB exactly"], answer: 1 },
            { q: "What are LUTs used for?", options: ["Audio mixing", "Timeline editing", "Colour grade presets", "Export settings"], answer: 2 },
            { q: "What is the typical rate for editing a corporate testimonial in SA?", options: ["R200-500", "R3,000-6,000", "R50,000-100,000", "R100"], answer: 1 },
          ]},
        ],
      },
      { id: "m4", title: "Module 4: Video Business", description: "Build a profitable video editing and production practice.", milestone: "Video Entrepreneur", milestoneEmoji: "🏆",
        lessons: [
          { id: "l4-1", title: "Building a Video Editing Practice", type: "text", duration: "20 min", content: "**The Video Editing Business Model:**\n\n**Month 1-3: Foundation**\n- Edit 3-5 projects at cost/discount to build reel\n- Create your own YouTube channel to demonstrate skills\n- Build profiles on FreelanceSkills.net, Upwork\n\n**Month 4-6: Growth**\n- Set rates (R800-2,000 per video minimum)\n- Partner with videographers who need editors\n- Target property agencies (massive SA demand)\n\n**Month 7-12: Scale**\n- Retainer clients (R6,000-15,000/month for regular video content)\n- Hire a junior editor for overflow\n- Specialise: Property, corporate, YouTube, or events\n\n**The partnership model:**\nConnect with 3-5 local videographers. You handle editing, they handle shooting. You split revenue or charge separately. Both win.\n\n**SA growth niches for 2026:**\n1. Township business promo videos (underserved, growing)\n2. Real estate walkthroughs (JHB, CT, DBN booming)\n3. Financial advisor content (compliance-driven demand)\n4. Skills training videos (huge post-COVID demand)" },
        ],
      },
    ],
  },
  {
    id: 13,
    slug: "time-management-productivity",
    title: "Time Management & Productivity for Freelancers",
    tagline: "4-hour effective workday. Earn more by working less.",
    description: "Master time blocking, the Pomodoro technique, AI-assisted workflows, and systems thinking to maximise your freelance output.",
    category: "Business Development",
    difficulty: "Beginner",
    duration: "5 hours",
    earningsLift: "+40%",
    skills: ["Time Management", "Productivity", "Systems", "Automation"],
    isFree: true,
    rating: 4.6,
    enrolled: 13400,
    color: "from-green-600 to-emerald-700",
    emoji: "⏰",
    modules: [
      { id: "m1", title: "Module 1: The Productivity Mindset", description: "Rethink how you relate to time and output.", milestone: "Mindset Shift", milestoneEmoji: "🧠",
        lessons: [
          { id: "l1-1", title: "Busy ≠ Productive: The Freelancer's Trap", type: "text", duration: "20 min", content: "**The busiest freelancers are often the least profitable.**\n\nBusy = filling time with activity\nProductive = generating value per unit of time\n\n**The math:**\n- Freelancer A: Works 10 hours/day, R300/hour average = R3,000/day\n- Freelancer B: Works 5 hours/day, R800/hour average = R4,000/day\n\nFreelancer B earns 33% more by working 50% less.\nThe difference: Freelancer B charges more, works on fewer but better projects, and protects focus time.\n\n**The 3 enemies of freelance productivity:**\n1. **Context switching** — Jumping between tasks (reduces output by 40%)\n2. **Reactive work** — Responding to messages all day (never deep work)\n3. **Perfectionism** — Polishing work past diminishing returns\n\n**The 80/20 rule for freelancers:**\n20% of your work produces 80% of your revenue.\nIdentify that 20% (your highest-value activities) and protect them with time blocks." },
          { id: "l1-2", title: "Your Ideal Work Week Design", type: "text", duration: "20 min", content: "**Design your week before the week designs itself.**\n\n**The Freelancer's Ideal Week Template:**\n\n**Monday:**\n- 8am-10am: Deep work Block 1 (highest priority task)\n- 10am-12pm: Client work\n- 12pm-1pm: Lunch + walk\n- 1pm-3pm: Deep work Block 2\n- 3pm-4pm: Admin (email, invoices, proposals)\n\n**Tuesday-Thursday: Same structure**\n\n**Friday:**\n- Morning: Weekly review + next week planning\n- Afternoon: Learning, content creation, networking\n\n**Rules:**\n1. No meetings before 11am (protect morning focus)\n2. Email checks: 9am, 1pm, 5pm only (3× daily max)\n3. Phone on silent during deep work blocks\n4. Hard stop at 5pm (or your chosen time)\n\n**The key insight:** Structure creates freedom. A structured week means you're never scrambling, always know what to work on next, and have clear off-time boundaries." },
          { id: "l1-3", title: "Quiz: Productivity Mindset", type: "quiz", duration: "10 min", content: "Test your productivity mindset knowledge.", quiz: [
            { q: "By how much does context switching reduce productivity?", options: ["5%", "20%", "40%", "60%"], answer: 2 },
            { q: "According to the 80/20 rule, what produces 80% of revenue?", options: ["80% of work", "20% of work", "50% of work", "All work equally"], answer: 1 },
            { q: "How many times per day should you check email maximum?", options: ["1", "3", "10", "Continuously"], answer: 1 },
          ]},
        ],
      },
      { id: "m2", title: "Module 2: Deep Work Systems", description: "Create conditions for focused, high-quality output.", milestone: "Deep Work Practitioner", milestoneEmoji: "🎯",
        lessons: [
          { id: "l2-1", title: "The Pomodoro Technique & Time Blocking", type: "text", duration: "20 min", content: "**The Pomodoro Technique:**\n1. Choose one task\n2. Set timer for 25 minutes (one 'Pomodoro')\n3. Work with complete focus until timer rings\n4. Take 5-minute break\n5. After 4 Pomodoros, take 25-minute break\n\n**Why it works:**\n- Creates urgency (timer creates focus)\n- Makes large tasks manageable\n- Enforces breaks (prevents burnout)\n- Tracks how many 'units' a task takes\n\n**Time Blocking:**\nSchedule specific work into specific time slots in your calendar.\nNot 'work on client project today' but '9am-11am: Build the hero section for Thabo's website'\n\n**Tools:**\n- Google Calendar (free, syncs everywhere)\n- Notion (blocks + notes + tasks)\n- Sunsama (purpose-built for daily planning, R300/month)\n- Brain.fm (focus music, scientifically optimised)\n\n**SA context:** South African freelancers report Eskom load shedding kills productivity. Solution: Identify your load shedding schedule, time block your deep work for powered hours, use offline tools during outages." },
        ],
      },
      { id: "m3", title: "Module 3: Tools & Systems", description: "Build a productivity system that runs your business.", milestone: "Systems Builder", milestoneEmoji: "⚙️",
        lessons: [
          { id: "l3-1", title: "The Freelancer's Productivity Stack", type: "text", duration: "25 min", content: "**Your complete SA freelancer productivity system (mostly free):**\n\n**Project Management:** Notion or Trello\n**Time Tracking:** Toggl (free) — track every billable minute\n**Communication:** Slack for teams, WhatsApp for clients\n**File Storage:** Google Drive (15GB free) or Dropbox\n**Invoicing:** Wave (free) or Xero (R300/month)\n**Contract:** Bonsai or Google Docs template\n**Scheduling:** Calendly (free tier) — no more back-and-forth email\n**Focus music:** YouTube Lo-Fi streams (free) or Brain.fm\n\n**The Weekly Review (30 minutes every Friday):**\n1. Review this week's completed tasks\n2. Note what went well and what to improve\n3. Review all open projects and deadlines\n4. Plan next week's big rocks (3 most important things)\n5. Clear email inbox to zero\n\n**Monthly review:**\n1. Revenue vs. target\n2. Hours worked vs. hours billed\n3. Client satisfaction\n4. Skills gap: What should I learn next?" },
          { id: "l3-2", title: "Quiz: Productivity Final", type: "quiz", duration: "10 min", content: "Final assessment for Time Management & Productivity.", quiz: [
            { q: "How long is one Pomodoro work session?", options: ["15 minutes", "25 minutes", "45 minutes", "60 minutes"], answer: 1 },
            { q: "Which free tool tracks billable time?", options: ["Toggl", "Calendly", "Zapier", "Canva"], answer: 0 },
            { q: "What is the recommended frequency for a weekly review?", options: ["Daily", "Monthly", "Every Friday", "Every Monday morning"], answer: 2 },
          ]},
        ],
      },
      { id: "m4", title: "Module 4: Sustainability & Scale", description: "Build a sustainable freelance practice that doesn't burn you out.", milestone: "Productivity Master", milestoneEmoji: "🏆",
        lessons: [
          { id: "l4-1", title: "Avoiding Freelance Burnout", type: "text", duration: "20 min", content: "**Burnout is the #1 killer of freelance careers.**\n\n**Warning signs:**\n- Working more than 50 hours/week consistently\n- Dreading client calls\n- Doing work that used to excite you but now feels empty\n- Taking on bad-fit clients because of money anxiety\n\n**Prevention systems:**\n\n**1. The minimum viable income number:**\nCalculate the minimum you need per month to cover everything.\nOnce you hit that number → stop taking new work, raise prices, or invest in learning.\n\n**2. The client acceptance criteria:**\nBefore taking any project, score it:\n- Interesting work? (1-5)\n- Good rate? (1-5)\n- Good client? (1-5)\nOnly take projects scoring 12+.\n\n**3. The protected time zones:**\n- No work after 6pm\n- Weekends off\n- 2 weeks off per year minimum\n- 1 morning per week for personal development\n\n**4. Raise prices to work less:**\nIf you're fully booked, raise prices by 20%. Lose 1-2 clients. Work less. Earn the same or more." },
        ],
      },
    ],
  },
  {
    id: 14,
    slug: "public-speaking-pitching",
    title: "Public Speaking & Client Pitching",
    tagline: "Own the room. Pitch with confidence. Win every presentation.",
    description: "Transform from nervous presenter to confident communicator. Master pitching to clients, presenting to boardrooms, and commanding any room.",
    category: "Business Development",
    difficulty: "Beginner",
    duration: "6 hours",
    earningsLift: "+50%",
    skills: ["Public Speaking", "Presenting", "Pitching", "Confidence"],
    isFree: true,
    rating: 4.5,
    enrolled: 8900,
    color: "from-amber-500 to-yellow-600",
    emoji: "🎤",
    modules: [
      { id: "m1", title: "Module 1: Overcoming Fear", description: "Understand and defeat presentation anxiety.", milestone: "Fear Conquered", milestoneEmoji: "🦁",
        lessons: [
          { id: "l1-1", title: "The Science of Presentation Anxiety", type: "text", duration: "20 min", content: "**Presentation anxiety is your body's gift — learn to use it.**\n\nThe symptoms: racing heart, sweaty palms, shaky voice, dry mouth.\nThese are your body's stress response — the same one that helped humans survive lions.\n\n**Reframe:** Your body is giving you performance-enhancing energy. The same adrenaline that makes you anxious also makes you more alert, more articulate, and more energetic.\n\n**Studies show:**\n- Presenters consistently overestimate how nervous they appear\n- Audiences are rooting for presenters to succeed\n- The anxiety peak is in the first 60 seconds — then it drops dramatically\n\n**3 techniques that work immediately:**\n\n1. **Box breathing:** Inhale 4 counts, hold 4, exhale 4, hold 4. Repeat 3 times.\n2. **Power pose:** Stand tall, hands on hips, for 2 minutes before entering. Increases testosterone, reduces cortisol.\n3. **Reframe:** Replace 'I'm nervous' with 'I'm excited'. Same physiology, different meaning.\n\n**Practice rule:** The discomfort of practice is temporary. The regret of never improving is permanent." },
          { id: "l1-2", title: "Quiz: Overcoming Fear", type: "quiz", duration: "10 min", content: "Test your knowledge of presentation anxiety.", quiz: [
            { q: "Presentation anxiety peaks at which moment?", options: ["The middle of the talk", "During Q&A", "The first 60 seconds", "The last 5 minutes"], answer: 2 },
            { q: "What is box breathing?", options: ["4-4-4-4 breathing pattern", "Deep breaths only", "Breathing into a box", "Breath holding only"], answer: 0 },
            { q: "What does reframing 'I'm nervous' to 'I'm excited' do?", options: ["Makes the fear disappear", "Same physiology, different empowering meaning", "Tricks the audience", "Makes you overconfident"], answer: 1 },
          ]},
        ],
      },
      { id: "m2", title: "Module 2: Structure & Story", description: "Build presentations that persuade and inspire action.", milestone: "Storyteller", milestoneEmoji: "📖",
        lessons: [
          { id: "l2-1", title: "The Presentation Framework", type: "text", duration: "25 min", content: "**Every great presentation has this structure:**\n\n**1. The Hook (First 60 seconds)**\nNot 'Thank you for having me'. Start with:\n- A shocking statistic: 'R2.3 billion changes hands on FreelanceSkills this year alone.'\n- A story: 'Two years ago, I cold-emailed 50 companies and heard nothing. Last month, clients found me.'\n- A question: 'How many of you have lost a project because your proposal didn't stand out?'\n- A bold statement: 'Everything you think you know about client pitching is wrong.'\n\n**2. The Problem**\nEstablish the pain your audience is feeling.\n\n**3. The Stakes**\nWhat happens if the problem isn't solved?\n\n**4. The Solution**\nYour approach. Clear, specific, and differentiated.\n\n**5. The Proof**\nEvidence, case studies, testimonials, data.\n\n**6. The Call to Action**\nOne clear next step. No options, no ambiguity.\n\n**The 'So What?' test:**\nAfter every slide/point, ask: 'So what?' If you can't answer, cut it." },
        ],
      },
      { id: "m3", title: "Module 3: Delivery Mastery", description: "Voice, body language, and slide design.", milestone: "Presenter", milestoneEmoji: "🎯",
        lessons: [
          { id: "l3-1", title: "Voice, Body Language & Slides", type: "text", duration: "25 min", content: "**The 55-38-7 rule:**\n- 55% impact from body language\n- 38% from voice tone\n- 7% from actual words\n\n**Body language:**\n- Stand with feet shoulder-width apart (power stance)\n- Hands visible, gesture naturally above the waist\n- Make eye contact for 3-5 seconds per person (not scanning)\n- Eliminate nervous habits: pacing, playing with hair, fidgeting\n\n**Voice:**\n- **Pace:** Slower than feels natural. Pause for emphasis.\n- **Volume:** 20% louder than conversation\n- **Inflection:** Vary pitch — monotone kills attention\n- **Pause:** The 3-second pause after a key point. Most powerful tool.\n\n**Slides (5 rules):**\n1. 1 idea per slide\n2. Maximum 30 words per slide\n3. Images > text\n4. No bullet walls (maximum 3 bullets)\n5. High contrast (dark background, light text OR white, dark text)\n\n**SA presentation tip:** If presenting to corporate SA, start 5 minutes of informal conversation. Relationship before business is culturally important in SA business culture." },
          { id: "l3-2", title: "Quiz: Presentation & Delivery", type: "quiz", duration: "10 min", content: "Test your presentation skills.", quiz: [
            { q: "What percentage of presentation impact comes from body language?", options: ["7%", "38%", "55%", "80%"], answer: 2 },
            { q: "How many words should maximum appear on a presentation slide?", options: ["100+", "30", "15", "0"], answer: 1 },
            { q: "What is the most powerful vocal tool in presenting?", options: ["Loud volume", "Fast pace", "The 3-second pause", "Monotone delivery"], answer: 2 },
          ]},
        ],
      },
      { id: "m4", title: "Module 4: Pitching Clients & Winning", description: "Use your presentation skills to win freelance projects.", milestone: "Pitch Master", milestoneEmoji: "🏆",
        lessons: [
          { id: "l4-1", title: "The Client Pitch Presentation", type: "text", duration: "20 min", content: "**The 20-minute client pitch structure:**\n\n**Slides 1-2: Them (5 min)**\nShow deep understanding of their business, their challenges, their goals.\n'I spent 3 hours on your business before today. Here's what I found...'\n\n**Slide 3: The Problem (3 min)**\nName the challenge precisely. Better than they could name it themselves.\n\n**Slide 4: Your Approach (5 min)**\nYour solution. 3-step process. Not a wall of features.\n\n**Slide 5: Proof (4 min)**\nBefore/after case study. Relevant client. Specific results.\n\n**Slide 6: Next Steps + Investment (3 min)**\nPhase 1 → Phase 2 → Phase 3\nTimeline. Investment.\nSingle CTA: 'Let's confirm the project this week so we can start by [DATE].'\n\n**The close:**\nDon't wait to be asked. After presenting, say:\n'Based on what we've discussed, I believe this is exactly the right fit. How would you like to move forward?'\n\nThen. Stop. Talking." },
        ],
      },
    ],
  },
  {
    id: 15,
    slug: "blockchain-solidity-web3",
    title: "Blockchain Development: Solidity & Web3",
    tagline: "Build smart contracts, DeFi apps, and NFT platforms.",
    description: "Master Solidity smart contract development, Web3 integration, and blockchain fundamentals to land premium Web3 contracts.",
    category: "Web Development",
    difficulty: "Advanced",
    duration: "30 hours",
    earningsLift: "+200%",
    skills: ["Solidity", "Smart Contracts", "Web3", "Ethereum"],
    isFree: false,
    rating: 4.8,
    enrolled: 2100,
    color: "from-violet-700 to-purple-800",
    emoji: "⛓️",
    modules: [
      { id: "m1", title: "Module 1: Blockchain Fundamentals", description: "How blockchains work, consensus, and cryptography basics.", milestone: "Blockchain Initiate", milestoneEmoji: "⛓️",
        lessons: [
          { id: "l1-1", title: "How Blockchain Actually Works", type: "text", duration: "35 min", content: "**Blockchain is a distributed ledger — a database that no single entity controls.**\n\n**Key concepts:**\n\n**Block:** A group of transactions bundled together\n**Chain:** Blocks linked cryptographically — changing one block invalidates all subsequent blocks\n**Node:** A computer participating in the network\n**Consensus:** How the network agrees on the 'true' state\n\n**Proof of Work (Bitcoin):**\nMiners compete to solve a mathematical puzzle. Winner adds the block, gets Bitcoin.\nSlow, energy intensive, but proven secure.\n\n**Proof of Stake (Ethereum):**\nValidators lock up (stake) ETH as collateral. Selected randomly to validate.\nFaster, 99.9% less energy, still secure.\n\n**The Ethereum stack:**\n- Ethereum Virtual Machine (EVM): Runs smart contracts\n- Solidity: Language for writing contracts\n- Gas: Fee paid for computation on Ethereum\n- Wei/Gwei/ETH: ETH denominations (1 ETH = 10^18 Wei)\n\n**SA context:**\n- Luno (SA company) holds R80B+ in crypto for SA users\n- SA has the highest crypto ownership rate in Africa (10% of adults)\n- FSCA now regulates crypto service providers in SA (FAIS)\n- Growing SA Web3 developer market with shortfall of talent" },
          { id: "l1-2", title: "Setting Up Your Web3 Dev Environment", type: "text", duration: "30 min", content: "**Your blockchain development toolkit:**\n\n**1. MetaMask** — Browser wallet for testing\nInstall the browser extension. Create a wallet. Never share your seed phrase.\n\n**2. Hardhat** — Development framework\n```bash\nnpm install --save-dev hardhat\nnpx hardhat init  # Select TypeScript project\n```\n\n**3. OpenZeppelin** — Security-audited contract libraries\n```bash\nnpm install @openzeppelin/contracts\n```\n\n**4. Testnet ETH** — Free fake ETH for testing\nSepolia testnet: Use the Alchemy or Infura faucet to get free Sepolia ETH\n\n**5. Alchemy** — Node infrastructure (free tier)\nProvides Ethereum node access without running your own node.\n\n**Project structure:**\n```\nmy-contract/\n├── contracts/\n│   └── MyToken.sol\n├── scripts/\n│   └── deploy.js\n├── test/\n│   └── MyToken.test.js\n├── hardhat.config.ts\n└── package.json\n```\n\n**Remix IDE:** Browser-based Solidity development. Perfect for learning without setup." },
          { id: "l1-3", title: "Quiz: Blockchain Fundamentals", type: "quiz", duration: "15 min", content: "Test your blockchain knowledge.", quiz: [
            { q: "What is the key difference between Proof of Work and Proof of Stake?", options: ["Speed only", "PoW uses miners/computation; PoS uses validators/staked ETH", "They are the same", "PoS is less secure"], answer: 1 },
            { q: "What language is used to write Ethereum smart contracts?", options: ["JavaScript", "Python", "Solidity", "Rust"], answer: 2 },
            { q: "What is 'Gas' in Ethereum?", options: ["Actual fuel", "Fee paid for computation on Ethereum", "Token denomination", "Mining reward"], answer: 1 },
          ]},
        ],
      },
      { id: "m2", title: "Module 2: Solidity Smart Contracts", description: "Write, test, and deploy real smart contracts.", milestone: "Smart Contract Developer", milestoneEmoji: "📜",
        lessons: [
          { id: "l2-1", title: "Your First Smart Contract", type: "text", duration: "40 min", content: "**Hello World in Solidity:**\n\n```solidity\n// SPDX-License-Identifier: MIT\npragma solidity ^0.8.19;\n\ncontract SimpleStorage {\n    // State variable (stored on blockchain)\n    uint256 private storedNumber;\n    address public owner;\n    \n    // Event (emitted on blockchain, cheap to log)\n    event NumberUpdated(uint256 newNumber, address updatedBy);\n    \n    // Constructor (runs once on deploy)\n    constructor() {\n        owner = msg.sender;\n        storedNumber = 0;\n    }\n    \n    // Modifier (reusable access control)\n    modifier onlyOwner() {\n        require(msg.sender == owner, 'Not the owner');\n        _; // Run the rest of the function\n    }\n    \n    // State-changing function (costs gas)\n    function setNumber(uint256 newNumber) public onlyOwner {\n        storedNumber = newNumber;\n        emit NumberUpdated(newNumber, msg.sender);\n    }\n    \n    // View function (free to call, no gas)\n    function getNumber() public view returns (uint256) {\n        return storedNumber;\n    }\n}\n```\n\n**Key Solidity concepts:**\n- `msg.sender`: Address calling the function\n- `msg.value`: ETH sent with the transaction\n- `require(condition, 'error message')`: Revert if false\n- `emit EventName(params)`: Log an event\n- `view` / `pure`: Read-only functions, free to call" },
          { id: "l2-2", title: "ERC-20 Token Contract", type: "text", duration: "40 min", content: "**ERC-20 is the standard for fungible tokens (like currencies).**\n\n```solidity\n// SPDX-License-Identifier: MIT\npragma solidity ^0.8.19;\n\nimport '@openzeppelin/contracts/token/ERC20/ERC20.sol';\nimport '@openzeppelin/contracts/access/Ownable.sol';\n\ncontract FreelanceToken is ERC20, Ownable {\n    // Maximum supply: 100 million tokens\n    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18;\n    \n    // Freelancer registry\n    mapping(address => bool) public isVerifiedFreelancer;\n    \n    event FreelancerVerified(address freelancer, uint256 timestamp);\n    \n    constructor() ERC20('FreelanceSkills Token', 'FSKL') Ownable(msg.sender) {\n        // Mint 10M tokens to deployer (treasury)\n        _mint(msg.sender, 10_000_000 * 10**18);\n    }\n    \n    // Verify a freelancer (admin only)\n    function verifyFreelancer(address freelancer) public onlyOwner {\n        isVerifiedFreelancer[freelancer] = true;\n        // Award 100 tokens for verification\n        require(totalSupply() + 100 * 10**18 <= MAX_SUPPLY, 'Max supply exceeded');\n        _mint(freelancer, 100 * 10**18);\n        emit FreelancerVerified(freelancer, block.timestamp);\n    }\n}\n```\n\n**OpenZeppelin's ERC20 gives you for free:**\n- transfer(), transferFrom(), approve()\n- balanceOf(), totalSupply(), allowance()\n- All events (Transfer, Approval)\nYou only write the custom logic on top." },
        ],
      },
      { id: "m3", title: "Module 3: Web3 Frontend Integration", description: "Connect React frontends to smart contracts.", milestone: "Web3 Developer", milestoneEmoji: "🌐",
        lessons: [
          { id: "l3-1", title: "Connecting React to Ethereum", type: "text", duration: "35 min", content: "**The Web3 React stack:**\n\n```bash\nnpm install wagmi viem @tanstack/react-query\n```\n\n**Setup:**\n```tsx\n// app/providers.tsx\nimport { WagmiProvider, createConfig, http } from 'wagmi';\nimport { mainnet, sepolia } from 'wagmi/chains';\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query';\n\nconst config = createConfig({\n  chains: [mainnet, sepolia],\n  transports: { [mainnet.id]: http(), [sepolia.id]: http() },\n});\n\nconst queryClient = new QueryClient();\n\nexport function Providers({ children }) {\n  return (\n    <WagmiProvider config={config}>\n      <QueryClientProvider client={queryClient}>\n        {children}\n      </QueryClientProvider>\n    </WagmiProvider>\n  );\n}\n```\n\n**Connect wallet button:**\n```tsx\nimport { useConnect, useAccount, useDisconnect } from 'wagmi';\nimport { injected } from 'wagmi/connectors';\n\nexport function WalletButton() {\n  const { connect } = useConnect();\n  const { address, isConnected } = useAccount();\n  const { disconnect } = useDisconnect();\n  \n  if (isConnected) {\n    return (\n      <button onClick={() => disconnect()}>\n        {address?.slice(0,6)}...{address?.slice(-4)}\n      </button>\n    );\n  }\n  \n  return (\n    <button onClick={() => connect({ connector: injected() })}>\n      Connect Wallet\n    </button>\n  );\n}\n```" },
          { id: "l3-2", title: "Quiz: Web3 & Solidity", type: "quiz", duration: "15 min", content: "Test your Web3 development knowledge.", quiz: [
            { q: "What does msg.sender represent in Solidity?", options: ["The contract address", "The address calling the function", "The deployer always", "A random address"], answer: 1 },
            { q: "What does the 'view' keyword do for a Solidity function?", options: ["Makes it private", "Makes it free to call (read-only)", "Makes it payable", "Makes it only callable once"], answer: 1 },
            { q: "Which library provides audited ERC-20 implementations?", options: ["ethers.js", "wagmi", "OpenZeppelin", "web3.js"], answer: 2 },
          ]},
        ],
      },
      { id: "m4", title: "Module 4: DeFi & NFT Development", description: "Build decentralised finance and NFT applications.", milestone: "DeFi Builder", milestoneEmoji: "🏦",
        lessons: [
          { id: "l4-1", title: "ERC-721 NFT Contract", type: "text", duration: "40 min", content: "**NFTs (Non-Fungible Tokens) use ERC-721 standard.**\n\n```solidity\n// SPDX-License-Identifier: MIT\npragma solidity ^0.8.19;\n\nimport '@openzeppelin/contracts/token/ERC721/ERC721.sol';\nimport '@openzeppelin/contracts/access/Ownable.sol';\nimport '@openzeppelin/contracts/utils/Counters.sol';\n\ncontract FreelanceCertificate is ERC721, Ownable {\n    using Counters for Counters.Counter;\n    Counters.Counter private _tokenIds;\n    \n    // Token ID → metadata URI (IPFS link)\n    mapping(uint256 => string) private _tokenURIs;\n    \n    // Recipient → course → token ID\n    mapping(address => mapping(string => uint256)) public certificates;\n    \n    constructor() ERC721('FreelanceSkills Certificate', 'FSKL-CERT') Ownable(msg.sender) {}\n    \n    // Issue a certificate NFT (only owner/admin)\n    function issueCertificate(\n        address recipient,\n        string memory courseId,\n        string memory metadataURI  // IPFS hash with course details\n    ) public onlyOwner returns (uint256) {\n        require(certificates[recipient][courseId] == 0, 'Already certified');\n        \n        _tokenIds.increment();\n        uint256 newTokenId = _tokenIds.current();\n        \n        _safeMint(recipient, newTokenId);\n        _tokenURIs[newTokenId] = metadataURI;\n        certificates[recipient][courseId] = newTokenId;\n        \n        return newTokenId;\n    }\n    \n    function tokenURI(uint256 tokenId) public view override returns (string memory) {\n        return _tokenURIs[tokenId];\n    }\n}\n```\n\n**This is exactly how FreelanceSkills issues blockchain credentials for verified professionals.**" },
        ],
      },
      { id: "m5", title: "Module 5: Web3 Freelance Career", description: "Land $5,000-20,000/month Web3 contracts globally.", milestone: "Web3 Expert", milestoneEmoji: "🚀",
        lessons: [
          { id: "l5-1", title: "The Web3 Freelance Market", type: "text", duration: "25 min", content: "**Web3 is one of the highest-paying niches in the world.**\n\n**Global Web3 developer rates:**\n- Junior Solidity: $60-100/hour\n- Mid Solidity: $100-200/hour\n- Senior Solidity/DeFi: $200-400/hour\n\n**In ZAR at R18/$:** That's R1,080-7,200/hour\n\n**SA advantage:**\n- Low cost of living relative to USD rates\n- English proficiency\n- Strong Math/Science culture\n- Time zone works for EU and some US hours\n\n**Where to find Web3 contracts:**\n- Gitcoin (crypto native, pay in ETH)\n- Braintrust (decentralised talent network)\n- Toptal (premium, competitive)\n- CryptoJobsList.com\n- Angle Jobs (Web3 focused)\n- Direct Discord communities of protocols\n\n**Your Web3 portfolio:**\n1. Deployed contract on Sepolia testnet (show Etherscan link)\n2. GitHub with 3+ Solidity projects\n3. A simple DApp with MetaMask integration\n4. Understanding of 1 protocol: Uniswap, Aave, or OpenSea\n\n**The fastest path:** Join a DAO (Decentralised Autonomous Organisation) as a contributor. Learn on the job. Get paid in crypto." },
        ],
      },
    ],
  },
];

export function getCourse(idOrSlug: number | string): Course | undefined {
  if (typeof idOrSlug === "number") {
    return COURSES.find((c) => c.id === idOrSlug);
  }
  return COURSES.find((c) => c.slug === idOrSlug || c.id === Number(idOrSlug));
}

export function getTotalLessons(course: Course): number {
  return course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
}

export function getTotalModules(course: Course): number {
  return course.modules.length;
}
