import { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";
import { storage } from "./storage";

const BOT_PATTERNS = [
  /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i, /baiduspider/i,
  /yandexbot/i, /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
  /whatsapp/i, /telegrambot/i, /applebot/i, /ia_archiver/i, /rogerbot/i,
  /embedly/i, /quora\s*link\s*preview/i, /showyoubot/i, /outbrain/i,
  /pinterest/i, /slackbot/i, /vkshare/i, /msnbot/i, /screaming\s*frog/i,
  /semrushbot/i, /ahrefsbot/i, /mj12bot/i, /dotbot/i, /prerender/i,
  /Googlebot-Image/i, /Mediapartners-Google/i,
];

export function isBot(userAgent: string): boolean {
  if (!userAgent) return false;
  return BOT_PATTERNS.some(p => p.test(userAgent));
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function injectMeta(html: string, replacements: Record<string, string>): string {
  let out = html;
  for (const [key, value] of Object.entries(replacements)) {
    out = out.split(key).join(value);
  }
  return out;
}

function buildFreelancerHtml(baseHtml: string, profile: any, name: string): string {
  const title = `${escapeHtml(name)} — FreelanceSkills.net`;
  const category = escapeHtml(profile.category || "Freelancer");
  const location = escapeHtml(profile.location || "South Africa");
  const rate = profile.hourlyRate ? `R${profile.hourlyRate}/hr` : "";
  const rating = profile.rating ? `${(profile.rating / 100).toFixed(1)} stars` : "5.0 stars";
  const bio = escapeHtml((profile.bio || profile.tagline || "").slice(0, 300));
  const desc = `${category} in ${location}${rate ? ` · ${rate}` : ""} · ${rating}. ${bio}`.trim();
  const url = `https://freelanceskills.net/profile/${profile.id}`;
  const avatar = profile.avatarUrl || "https://freelanceskills.net/hero-bg.png";

  const skills: string[] = [];
  try {
    const raw = profile.skills || profile.skillsJson || "[]";
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) skills.push(...parsed.slice(0, 10));
  } catch {}

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    "name": name,
    "jobTitle": profile.category || "Freelancer",
    "url": url,
    "image": avatar,
    "description": bio,
    "address": { "@type": "PostalAddress", "addressCountry": "ZA", "addressLocality": location },
    "knowsAbout": skills,
    ...(profile.hourlyRate ? {
      "makesOffer": {
        "@type": "Offer",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": profile.hourlyRate,
          "priceCurrency": "ZAR",
          "unitCode": "HUR",
        },
      },
    } : {}),
  });

  let html = baseHtml;
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${title}</title>`
  );
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${escapeHtml(desc)}"`
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${title}"`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${escapeHtml(desc)}"`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${url}"`
  );
  html = html.replace(
    /<meta property="og:image" content="[^"]*"/,
    `<meta property="og:image" content="${escapeHtml(avatar)}"`
  );
  html = html.replace(
    /<meta property="og:type" content="[^"]*"/,
    `<meta property="og:type" content="profile"`
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${title}"`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${escapeHtml(desc)}"`
  );
  html = html.replace(
    /<meta name="twitter:image" content="[^"]*"/,
    `<meta name="twitter:image" content="${escapeHtml(avatar)}"`
  );
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${url}"`
  );
  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">${jsonLd}</script>`
  );

  const prerenderedContent = `
    <div style="display:none" aria-hidden="true" id="prerendered-seo">
      <h1>${escapeHtml(name)}</h1>
      <p>${escapeHtml(category)} · ${escapeHtml(location)}</p>
      <p>${escapeHtml(bio)}</p>
      ${skills.length ? `<p>Skills: ${skills.map(s => escapeHtml(s)).join(", ")}</p>` : ""}
    </div>
  `;
  html = html.replace('<div id="root">', `<div id="root">${prerenderedContent}`);

  return html;
}

function buildJobsHtml(baseHtml: string, jobCount: number): string {
  const title = `${jobCount.toLocaleString()}+ Freelance Jobs in Africa — FreelanceSkills.net`;
  const desc = `Browse ${jobCount.toLocaleString()}+ verified freelance jobs across South Africa, Nigeria, Kenya, Ghana and 54 African countries. Updated every 30 minutes.`;
  const url = "https://freelanceskills.net/jobs";

  let html = baseHtml;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${escapeHtml(desc)}"`);
  html = html.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${escapeHtml(title)}"`);
  html = html.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${escapeHtml(desc)}"`);
  html = html.replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${url}"`);
  html = html.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${url}"`);
  return html;
}

function buildFindTalentHtml(baseHtml: string): string {
  const title = "Hire Verified Freelancers in South Africa & Africa — FreelanceSkills.net";
  const desc = "Find and hire top-rated, identity-verified freelancers across South Africa, Nigeria, Kenya, Ghana and 54 African countries. AI-matched talent with escrow payment protection.";
  const url = "https://freelanceskills.net/find-talent";

  let html = baseHtml;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${escapeHtml(desc)}"`);
  html = html.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${escapeHtml(title)}"`);
  html = html.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${escapeHtml(desc)}"`);
  html = html.replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${url}"`);
  html = html.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${url}"`);
  return html;
}

let cachedIndexHtml: string | null = null;
function getIndexHtml(): string {
  if (!cachedIndexHtml) {
    const indexPath = path.resolve(__dirname, "public", "index.html");
    cachedIndexHtml = fs.readFileSync(indexPath, "utf-8");
  }
  return cachedIndexHtml;
}

export function registerPrerenderRoutes(app: Express): void {
  // 301 redirect old profile URLs to canonical /profile/:id
  app.get("/freelancer-profile/:id", (req: Request, res: Response) => {
    res.redirect(301, `/profile/${req.params.id}`);
  });

  app.get("/profile/:id", async (req: Request, res: Response, next: NextFunction) => {
    const ua = req.headers["user-agent"] || "";
    if (!isBot(ua)) return next();

    try {
      const profile = await storage.getProfileById(req.params.id);
      if (!profile) return next();

      let firstName = "", lastName = "";
      try {
        const { db } = await import("./db");
        const { users: usersTable } = await import("../shared/models/auth");
        const { eq } = await import("drizzle-orm");
        const [u] = await db.select({ firstName: usersTable.firstName, lastName: usersTable.lastName })
          .from(usersTable).where(eq(usersTable.id, profile.userId));
        if (u) { firstName = u.firstName || ""; lastName = u.lastName || ""; }
      } catch {}

      const name = [firstName, lastName].filter(Boolean).join(" ") ||
        (profile as any).title || profile.category || "Freelancer";

      const html = buildFreelancerHtml(getIndexHtml(), profile, name);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Robots-Tag", "index, follow");
      res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
      return res.send(html);
    } catch (err) {
      return next();
    }
  });

  app.get("/jobs", async (req: Request, res: Response, next: NextFunction) => {
    const ua = req.headers["user-agent"] || "";
    if (!isBot(ua)) return next();

    try {
      const jobs = await storage.getAllJobs();
      const aggJobs = await storage.getAggregatedJobs();
      const count = (jobs?.length || 0) + (aggJobs?.length || 0);
      const html = buildJobsHtml(getIndexHtml(), count || 11400);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
      return res.send(html);
    } catch {
      const html = buildJobsHtml(getIndexHtml(), 11400);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(html);
    }
  });

  app.get("/find-talent", (req: Request, res: Response, next: NextFunction) => {
    const ua = req.headers["user-agent"] || "";
    if (!isBot(ua)) return next();
    const html = buildFindTalentHtml(getIndexHtml());
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
    return res.send(html);
  });
}
