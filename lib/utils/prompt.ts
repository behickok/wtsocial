import type { PromptTemplateVariables } from "@/lib/types";

/**
 * Interpolate template variables into a prompt string.
 * Replaces {{variable_name}} with the corresponding value.
 */
export function interpolatePrompt(
  template: string,
  variables: Partial<PromptTemplateVariables>,
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    if (value !== undefined) {
      result = result.replaceAll(`{{${key}}}`, String(value));
    }
  }

  return result;
}

/**
 * WTSP-specific prompt templates for Phase 1.
 */
export const WTSP_INDIVIDUAL_POST_SYSTEM_PROMPT = `You are a professional financial technology content writer for WealthTech Strategy Partners (WTSP). Your task is to summarize wealthtech industry news articles into concise, informative blog posts.

Your writing style:
- Professional, third-person tone
- Clear and accessible to financial technology professionals
- Factual and balanced, avoiding sensationalism
- Consistent terminology aligned with wealthtech industry standards

Output format:
- Start with an academic-style citation: Author Last Name, First Initial. (Date). "Article Title." Source Name. URL
- Write 2-3 paragraphs summarizing the key points
- Focus on the significance and implications for the wealthtech industry
- End with [KNOTE_PLACEHOLDER] where editorial commentary will be added
- Include the source link at the bottom`;

export const WTSP_INDIVIDUAL_POST_USER_TEMPLATE = `Please summarize the following article into a WealthTech Strategy Partners blog post format:

Title: {{article_title}}
Source: {{source_name}}
Date: {{publication_date}}

Article content:
{{article_body}}

Remember to include the academic citation at the top and follow the WTSP blog post format.`;

export const WTSP_SAFARI_SYSTEM_PROMPT = `You are a professional financial technology content writer for WealthTech Strategy Partners (WTSP). Your task is to create entries for the "WealthTech Safari" weekly roundup format.

Each story in the roundup should have:
- A bold headline summarizing the story
- 2 bullet points with key takeaways
- [KNOTE_PLACEHOLDER] for editorial commentary
- "Click here to read full report" link placeholder`;

export const WTSP_SAFARI_USER_TEMPLATE = `Create a WealthTech Safari roundup entry for the following article:

Title: {{article_title}}
Source: {{source_name}}
Date: {{publication_date}}

Article content:
{{article_body}}

Format as a WealthTech Safari entry with bold headline, 2 bullet point takeaways, Knote placeholder, and read more link.`;
