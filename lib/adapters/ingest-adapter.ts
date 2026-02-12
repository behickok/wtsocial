import type { IngestInput, ExtractedContent, ValidationResult } from "@/lib/types";

/**
 * Interface for content ingestion adapters.
 * Each adapter handles a specific input method (URL, RSS, bulk import, etc.)
 * and normalizes it into extracted content for the pipeline.
 */
export interface IngestAdapter {
  readonly name: string;
  ingest(input: IngestInput): Promise<ExtractedContent>;
  validate(input: IngestInput): Promise<ValidationResult>;
}

/**
 * URL-based ingestion adapter for Phase 1.
 * Extracts article content from a given URL using readability parsing.
 */
export class URLIngestAdapter implements IngestAdapter {
  readonly name = "url";

  async validate(input: IngestInput): Promise<ValidationResult> {
    const errors: string[] = [];

    if (!input.url) {
      errors.push("URL is required");
    } else {
      try {
        new URL(input.url);
      } catch {
        errors.push("Invalid URL format");
      }
    }

    if (!input.organizationId) {
      errors.push("Organization ID is required");
    }

    return { valid: errors.length === 0, errors };
  }

  async ingest(input: IngestInput): Promise<ExtractedContent> {
    const validation = await this.validate(input);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    const url = new URL(input.url);

    // Placeholder: In production, this would use Mozilla Readability or Playwright
    // to extract article content from the URL
    return {
      title: "",
      sourceDomain: url.hostname,
      content: "",
      author: undefined,
      publishedDate: undefined,
      featuredImage: undefined,
    };
  }
}

/**
 * RSS feed ingestion adapter for Phase 1.
 * Monitors RSS feeds and creates content items from new entries.
 */
export class RSSIngestAdapter implements IngestAdapter {
  readonly name = "rss";

  async validate(input: IngestInput): Promise<ValidationResult> {
    const errors: string[] = [];

    if (!input.url) {
      errors.push("RSS feed URL is required");
    }

    if (!input.organizationId) {
      errors.push("Organization ID is required");
    }

    return { valid: errors.length === 0, errors };
  }

  async ingest(input: IngestInput): Promise<ExtractedContent> {
    const validation = await this.validate(input);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    const url = new URL(input.url);

    // Placeholder: In production, this would parse the RSS feed
    // and extract individual article entries
    return {
      title: "",
      sourceDomain: url.hostname,
      content: "",
    };
  }
}
