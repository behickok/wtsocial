import type { ImageConfig, GeneratedImageResult, ImageTemplateInfo } from "@/lib/types";

/**
 * Interface for image generation adapters.
 * Each adapter implements a specific image generation strategy
 * (template compositing, AI generation, Canva API, etc.)
 */
export interface ImageGenerator {
  readonly name: string;
  generate(config: ImageConfig): Promise<GeneratedImageResult>;
  getTemplates(orgId: string): Promise<ImageTemplateInfo[]>;
}

/**
 * Sharp-based template renderer for Phase 1.
 * Composites images from a base template with dynamic logo placement,
 * text overlay, and brand color extraction.
 */
export class SharpTemplateRenderer implements ImageGenerator {
  readonly name = "sharp-template";

  async generate(config: ImageConfig): Promise<GeneratedImageResult> {
    const width = config.outputWidth ?? 980;
    const height = config.outputHeight ?? 515;

    // Placeholder: In production, this would:
    // 1. Load the base template from the ImageTemplate record
    // 2. Fetch company logo from Brandfetch/Clearbit using companyDomain
    // 3. Extract dominant brand colors from the logo
    // 4. Composite the logo, headline text, and brand colors onto the template
    // 5. Export as PNG/JPEG and upload to file storage
    void config;

    return {
      imageUrl: "",
      width,
      height,
      metadata: {
        templateId: config.templateId,
        headline: config.headline,
        companyName: config.companyName,
      },
    };
  }

  async getTemplates(orgId: string): Promise<ImageTemplateInfo[]> {
    void orgId;
    // Placeholder: Query ImageTemplate records from database
    return [];
  }
}
