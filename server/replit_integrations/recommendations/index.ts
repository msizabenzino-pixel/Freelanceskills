import OpenAI from "openai";
import { z } from "zod";
import { SERVICE_CATEGORIES } from "@shared/categories";

const VALID_CATEGORY_IDS = SERVICE_CATEGORIES.map(cat => cat.id);

export const analyzeTaskInputSchema = z.object({
  taskDescription: z.string().min(10, "Task description must be at least 10 characters"),
  location: z.string().optional(),
});

export const matchPackagesInputSchema = z.object({
  taskDescription: z.string().min(10, "Task description must be at least 10 characters"),
});

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface TaskRecommendation {
  suggestedCategories: {
    categoryId: string;
    categoryName: string;
    confidence: number;
    relevantSubcategories: string[];
  }[];
  estimatedBudgetRange: {
    min: number;
    max: number;
    currency: string;
  };
  recommendedLocationType: "onsite" | "remote" | "either";
  urgencyLevel: "urgent" | "standard" | "flexible";
  skillsNeeded: string[];
  taskBreakdown: string[];
  tips: string[];
}

export async function analyzeTaskAndRecommend(
  taskDescription: string,
  location?: string
): Promise<TaskRecommendation> {
  const categoriesContext = SERVICE_CATEGORIES.map(cat => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    subcategories: cat.subcategories
  }));

  const systemPrompt = `You are an expert task recommendation assistant for FreelanceSkills, a South African freelance marketplace. Your job is to analyze client task descriptions and recommend the most suitable service categories, budget estimates, and helpful tips.

Available service categories:
${JSON.stringify(categoriesContext, null, 2)}

Respond with a JSON object containing:
- suggestedCategories: Array of up to 3 most relevant categories with:
  - categoryId: The category id from the list
  - categoryName: The category name
  - confidence: 0-1 score of how relevant this category is
  - relevantSubcategories: Array of specific subcategories that match the task
- estimatedBudgetRange: Object with min (number in ZAR), max (number in ZAR), currency ("ZAR")
- recommendedLocationType: "onsite" (requires physical presence), "remote" (can be done online), or "either"
- urgencyLevel: "urgent" (needs immediate attention), "standard" (normal timeline), or "flexible" (no rush)
- skillsNeeded: Array of specific skills the freelancer should have
- taskBreakdown: Array of steps to complete this task (2-4 items)
- tips: Array of 2-3 helpful tips for the client when hiring for this task

Consider South African market rates. Be practical and specific in your recommendations.`;

  const userPrompt = `Analyze this task and provide recommendations:

Task Description: ${taskDescription}
${location ? `Location: ${location}` : "Location: Not specified"}

Provide your analysis as a JSON object.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const recommendation = JSON.parse(content) as TaskRecommendation;
    
    // Validate and normalize the response - filter to only valid category IDs
    const validCategories = (recommendation.suggestedCategories || [])
      .filter(cat => VALID_CATEGORY_IDS.includes(cat.categoryId))
      .slice(0, 3);
    
    // If no valid categories, provide fallback with most relevant general categories
    const finalCategories = validCategories.length > 0 
      ? validCategories 
      : [{ categoryId: "handyman", categoryName: "Handyman & Home", confidence: 0.5, relevantSubcategories: ["General Repairs"] }];

    return {
      suggestedCategories: finalCategories.map(cat => {
        const categoryDef = SERVICE_CATEGORIES.find(c => c.id === cat.categoryId);
        const validSubcategories = (cat.relevantSubcategories || [])
          .filter(sub => categoryDef?.subcategories.includes(sub));
        return {
          categoryId: cat.categoryId,
          categoryName: categoryDef?.name || cat.categoryName || "",
          confidence: Math.min(1, Math.max(0, cat.confidence || 0)),
          relevantSubcategories: validSubcategories.length > 0 ? validSubcategories : categoryDef?.subcategories.slice(0, 2) || []
        };
      }),
      estimatedBudgetRange: {
        min: recommendation.estimatedBudgetRange?.min || 500,
        max: recommendation.estimatedBudgetRange?.max || 5000,
        currency: "ZAR"
      },
      recommendedLocationType: recommendation.recommendedLocationType || "either",
      urgencyLevel: recommendation.urgencyLevel || "standard",
      skillsNeeded: recommendation.skillsNeeded || [],
      taskBreakdown: recommendation.taskBreakdown || [],
      tips: recommendation.tips || []
    };
  } catch (error) {
    console.error("Error analyzing task:", error);
    throw error;
  }
}

export async function suggestServicePackages(
  taskDescription: string,
  servicePackages: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    freelancerName?: string;
    rating?: number;
  }>
): Promise<{
  rankedPackages: Array<{
    packageId: string;
    matchScore: number;
    matchReason: string;
  }>;
  searchSuggestions: string[];
}> {
  if (servicePackages.length === 0) {
    return {
      rankedPackages: [],
      searchSuggestions: ["Try posting a job to attract freelancers", "Browse service categories to find what you need"]
    };
  }

  const packagesContext = servicePackages.map(pkg => ({
    id: pkg.id,
    title: pkg.title,
    description: pkg.description.substring(0, 200),
    category: pkg.category,
    price: pkg.price,
    freelancer: pkg.freelancerName,
    rating: pkg.rating
  }));

  const systemPrompt = `You are a matching assistant for FreelanceSkills marketplace. Given a client's task description and a list of available service packages, rank the packages by relevance.

Respond with JSON containing:
- rankedPackages: Array of objects with packageId, matchScore (0-100), and matchReason (1 sentence explaining why this is a good match)
- searchSuggestions: Array of 2-3 alternative search terms or tips if no great matches found`;

  const userPrompt = `Client's task: ${taskDescription}

Available service packages:
${JSON.stringify(packagesContext, null, 2)}

Rank these packages by relevance to the task. Only include packages with matchScore >= 40.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
      rankedPackages: (result.rankedPackages || []).filter((pkg: any) => pkg.matchScore >= 40),
      searchSuggestions: result.searchSuggestions || []
    };
  } catch (error) {
    console.error("Error matching packages:", error);
    throw error;
  }
}
