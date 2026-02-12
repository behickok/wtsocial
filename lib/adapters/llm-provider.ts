import type { SummaryResult, CostEstimate } from "@/lib/types";

export interface PromptTemplate {
  systemPrompt: string;
  userPromptTemplate: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

/**
 * Interface for LLM provider adapters.
 * Each adapter wraps a specific LLM API (Anthropic, OpenAI, Google, etc.)
 * behind a common interface for the summarization pipeline stage.
 */
export interface LLMProvider {
  readonly name: string;
  summarize(content: string, template: PromptTemplate): Promise<SummaryResult>;
  estimateCost(content: string, template: PromptTemplate): Promise<CostEstimate>;
}

/**
 * Anthropic Claude adapter for Phase 1.
 * Implements the LLM provider interface using the Anthropic API.
 */
export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic";

  constructor(private apiKey?: string) {
    this.apiKey = apiKey ?? process.env.ANTHROPIC_API_KEY;
  }

  async summarize(content: string, template: PromptTemplate): Promise<SummaryResult> {
    if (!this.apiKey) {
      throw new Error("Anthropic API key is not configured");
    }

    // Interpolate template variables
    const userPrompt = template.userPromptTemplate
      .replace("{{article_body}}", content);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: template.model,
        max_tokens: template.maxTokens,
        temperature: template.temperature,
        system: template.systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const textBlock = data.content?.find(
      (block: { type: string }) => block.type === "text"
    );

    return {
      body: textBlock?.text ?? "",
      modelUsed: template.model,
      tokensUsed: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
    };
  }

  async estimateCost(content: string, template: PromptTemplate): Promise<CostEstimate> {
    // Rough token estimation: ~4 chars per token
    const inputTokens = Math.ceil(
      (template.systemPrompt.length + content.length + template.userPromptTemplate.length) / 4
    );
    const outputTokens = template.maxTokens;

    // Claude Sonnet pricing (approximate)
    const inputCostPer1k = 0.003;
    const outputCostPer1k = 0.015;

    return {
      inputTokens,
      outputTokens,
      estimatedCost:
        (inputTokens / 1000) * inputCostPer1k +
        (outputTokens / 1000) * outputCostPer1k,
      currency: "USD",
    };
  }
}
