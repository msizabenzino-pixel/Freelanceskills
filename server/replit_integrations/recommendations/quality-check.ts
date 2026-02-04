import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export const contentQualityCheckInputSchema = z.object({
  content: z.string().min(20, "Content must be at least 20 characters"),
  contentType: z.enum(["proposal", "job_post", "profile_bio", "message", "deliverable"]).default("message"),
});

export type ContentQualityCheckInput = z.infer<typeof contentQualityCheckInputSchema>;

export interface ContentQualityResult {
  overallScore: number;
  isOriginal: boolean;
  aiGeneratedProbability: number;
  plagiarismRisk: "low" | "medium" | "high";
  qualityMetrics: {
    clarity: number;
    professionalism: number;
    relevance: number;
    grammar: number;
  };
  issues: string[];
  suggestions: string[];
}

export async function checkContentQuality(
  input: ContentQualityCheckInput
): Promise<ContentQualityResult> {
  const systemPrompt = `You are a content quality analyzer for FreelanceSkills, a freelance marketplace. Analyze the provided ${input.contentType} for:
1. Originality (estimate if AI-generated or plagiarized)
2. Quality metrics (clarity, professionalism, relevance, grammar)
3. Issues and improvement suggestions

Be constructive but honest. Score metrics from 0-100.

Respond with JSON:
- overallScore: Combined quality score (0-100)
- isOriginal: Boolean indicating if content appears original
- aiGeneratedProbability: 0-1 probability content is AI-generated
- plagiarismRisk: "low", "medium", or "high"
- qualityMetrics: Object with clarity, professionalism, relevance, grammar scores
- issues: Array of identified problems (if any)
- suggestions: Array of improvement recommendations`;

  const userPrompt = `Analyze this ${input.contentType}:

${input.content}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 800,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(result);
    return {
      overallScore: Math.min(100, Math.max(0, parsed.overallScore || 70)),
      isOriginal: parsed.isOriginal ?? true,
      aiGeneratedProbability: Math.min(1, Math.max(0, parsed.aiGeneratedProbability || 0)),
      plagiarismRisk: parsed.plagiarismRisk || "low",
      qualityMetrics: {
        clarity: parsed.qualityMetrics?.clarity || 70,
        professionalism: parsed.qualityMetrics?.professionalism || 70,
        relevance: parsed.qualityMetrics?.relevance || 70,
        grammar: parsed.qualityMetrics?.grammar || 70,
      },
      issues: parsed.issues || [],
      suggestions: parsed.suggestions || [],
    };
  } catch (error) {
    console.error("Error checking content quality:", error);
    throw error;
  }
}

export const profileOptimizationInputSchema = z.object({
  bio: z.string().min(20, "Bio must be at least 20 characters"),
  title: z.string().min(5, "Title is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  category: z.string().optional(),
});

export interface ProfileOptimizationResult {
  optimizedBio: string;
  optimizedTitle: string;
  suggestedSkills: string[];
  seoKeywords: string[];
  profileScore: number;
  improvements: string[];
}

export async function optimizeProfile(
  bio: string,
  title: string,
  skills: string[],
  category?: string
): Promise<ProfileOptimizationResult> {
  const systemPrompt = `You are a profile optimization expert for FreelanceSkills, a South African freelance marketplace. Optimize the freelancer's profile for maximum visibility and attractiveness to clients.

Consider:
1. SEO optimization for South African market
2. Clear value proposition
3. Professional but approachable tone
4. Relevant skills highlighting

Respond with JSON:
- optimizedBio: Improved bio (150-250 words)
- optimizedTitle: Catchy, specific professional title
- suggestedSkills: Array of additional relevant skills to add
- seoKeywords: Array of keywords for discoverability
- profileScore: How optimized the profile is (0-100)
- improvements: Array of specific changes made`;

  const userPrompt = `Optimize this freelancer profile:

Title: ${title}
Bio: ${bio}
Skills: ${skills.join(", ")}
${category ? `Category: ${category}` : ""}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 1000,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(result);
    return {
      optimizedBio: parsed.optimizedBio || bio,
      optimizedTitle: parsed.optimizedTitle || title,
      suggestedSkills: parsed.suggestedSkills || [],
      seoKeywords: parsed.seoKeywords || [],
      profileScore: Math.min(100, Math.max(0, parsed.profileScore || 70)),
      improvements: parsed.improvements || [],
    };
  } catch (error) {
    console.error("Error optimizing profile:", error);
    throw error;
  }
}
