import OpenAI from "openai";
import { z } from "zod";
import { SERVICE_CATEGORIES } from "@shared/categories";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export const generateJobPostInputSchema = z.object({
  briefDescription: z.string().min(10, "Please describe what you need (at least 10 characters)"),
  category: z.string().optional(),
  budget: z.number().optional(),
  locationType: z.enum(["onsite", "remote", "either"]).optional(),
  urgency: z.enum(["urgent", "standard", "flexible"]).optional(),
});

export type GenerateJobPostInput = z.infer<typeof generateJobPostInputSchema>;

export interface JobPostSuggestion {
  title: string;
  description: string;
  suggestedCategory: string;
  suggestedBudget: { min: number; max: number };
  requiredSkills: string[];
  questions: string[];
}

export async function generateJobPost(
  input: GenerateJobPostInput
): Promise<JobPostSuggestion> {
  const categoriesContext = SERVICE_CATEGORIES.map(cat => ({
    id: cat.id,
    name: cat.name,
    subcategories: cat.subcategories.slice(0, 5)
  }));

  const systemPrompt = `You are an expert job posting assistant for FreelanceSkills, a South African freelance marketplace. Help clients create clear, detailed job posts that attract qualified freelancers.

Available categories: ${JSON.stringify(categoriesContext)}

Create a professional job post that:
1. Has a clear, specific title (5-10 words)
2. Includes detailed description with scope, deliverables, and timeline
3. Lists required skills
4. Suggests screening questions

Use South African context and ZAR for budget. Respond with JSON:
- title: Clear job title
- description: Detailed description (150-300 words)
- suggestedCategory: Category ID from the list
- suggestedBudget: Object with min and max in ZAR
- requiredSkills: Array of 4-6 relevant skills
- questions: Array of 2-3 screening questions to ask applicants`;

  const userPrompt = `Create a job post based on this brief description:

"${input.briefDescription}"

Additional context:
- Preferred category: ${input.category || "Not specified"}
- Budget: ${input.budget ? `R${input.budget}` : "Not specified"}
- Location type: ${input.locationType || "Not specified"}
- Urgency: ${input.urgency || "Standard"}

Generate a complete job post in JSON format.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1200,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);
    
    // Validate category ID
    const validCategoryId = SERVICE_CATEGORIES.find(c => c.id === result.suggestedCategory)?.id || "handyman";
    
    return {
      title: result.title || "",
      description: result.description || "",
      suggestedCategory: validCategoryId,
      suggestedBudget: {
        min: result.suggestedBudget?.min || 500,
        max: result.suggestedBudget?.max || 5000,
      },
      requiredSkills: result.requiredSkills || [],
      questions: result.questions || [],
    };
  } catch (error) {
    console.error("Error generating job post:", error);
    throw error;
  }
}

export const improveJobPostInputSchema = z.object({
  title: z.string().min(5, "Title is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
});

export async function improveJobPost(
  title: string,
  description: string
): Promise<{ improvedTitle: string; improvedDescription: string; suggestions: string[]; completenessScore: number }> {
  const systemPrompt = `You are a job post optimization expert. Analyze and improve the job post to attract more qualified freelancers.

Respond with JSON:
- improvedTitle: Enhanced title (clearer, more specific)
- improvedDescription: Improved description with better structure and details
- suggestions: Array of specific improvements or missing elements
- completenessScore: Score from 1-100 for how complete/effective the post is`;

  const userPrompt = `Improve this job post:

Title: ${title}

Description:
${description}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);
    return {
      improvedTitle: result.improvedTitle || title,
      improvedDescription: result.improvedDescription || description,
      suggestions: result.suggestions || [],
      completenessScore: Math.min(100, Math.max(0, result.completenessScore || 60)),
    };
  } catch (error) {
    console.error("Error improving job post:", error);
    throw error;
  }
}
