import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export const generateProposalInputSchema = z.object({
  jobTitle: z.string().min(5, "Job title is required"),
  jobDescription: z.string().min(20, "Job description must be at least 20 characters"),
  freelancerSkills: z.array(z.string()).min(1, "At least one skill is required"),
  freelancerExperience: z.string().optional(),
  freelancerName: z.string().optional(),
  tone: z.enum(["professional", "friendly", "confident"]).optional().default("professional"),
});

export type GenerateProposalInput = z.infer<typeof generateProposalInputSchema>;

export interface ProposalSuggestion {
  proposal: string;
  coverLetter: string;
  keyPoints: string[];
  estimatedReadTime: string;
}

export async function generateProposalSuggestion(
  input: GenerateProposalInput
): Promise<ProposalSuggestion> {
  const systemPrompt = `You are an expert proposal writer for FreelanceSkills, a South African freelance marketplace. Help freelancers write compelling, personalized proposals that stand out.

Write in a ${input.tone} tone. Be concise but impactful. Focus on:
1. Addressing the client's specific needs
2. Highlighting relevant skills and experience
3. Demonstrating understanding of the project
4. Creating urgency and confidence

Respond with a JSON object containing:
- proposal: A complete proposal message (150-250 words)
- coverLetter: A shorter cover letter version (80-120 words)
- keyPoints: Array of 3-4 key selling points to emphasize
- estimatedReadTime: Estimated time to read the full proposal`;

  const userPrompt = `Create a proposal for this job:

Job Title: ${input.jobTitle}
Job Description: ${input.jobDescription}

Freelancer Details:
- Name: ${input.freelancerName || "Not provided"}
- Skills: ${input.freelancerSkills.join(", ")}
- Experience: ${input.freelancerExperience || "Not specified"}

Generate a compelling proposal in JSON format.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);
    return {
      proposal: result.proposal || "",
      coverLetter: result.coverLetter || "",
      keyPoints: result.keyPoints || [],
      estimatedReadTime: result.estimatedReadTime || "1-2 minutes",
    };
  } catch (error) {
    console.error("Error generating proposal:", error);
    throw error;
  }
}

export const improveProposalInputSchema = z.object({
  currentProposal: z.string().min(20, "Proposal must be at least 20 characters"),
  jobDescription: z.string().optional(),
  improvementFocus: z.enum(["clarity", "persuasion", "brevity", "professionalism"]).optional().default("clarity"),
});

export async function improveProposal(
  currentProposal: string,
  jobDescription?: string,
  focus: "clarity" | "persuasion" | "brevity" | "professionalism" = "clarity"
): Promise<{ improvedProposal: string; changes: string[]; score: number }> {
  const systemPrompt = `You are a proposal optimization expert. Improve the given proposal focusing on ${focus}.

Respond with JSON containing:
- improvedProposal: The enhanced version
- changes: Array of specific improvements made
- score: Quality score from 1-100 for the improved version`;

  const userPrompt = `Improve this proposal${jobDescription ? ` for the job: "${jobDescription}"` : ""}:

${currentProposal}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);
    return {
      improvedProposal: result.improvedProposal || currentProposal,
      changes: result.changes || [],
      score: Math.min(100, Math.max(0, result.score || 70)),
    };
  } catch (error) {
    console.error("Error improving proposal:", error);
    throw error;
  }
}
