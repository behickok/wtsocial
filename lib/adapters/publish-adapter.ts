import type {
  AuthResult,
  ValidationResult,
  PublishPayload,
  PublishResult,
  PublishStatusResult,
} from "@/lib/types";

/**
 * Interface for publishing adapters.
 * Each adapter handles publishing content to a specific channel
 * (Wix, LinkedIn, HubSpot, WordPress, etc.)
 */
export interface PublishAdapter {
  readonly name: string;
  authenticate(): Promise<AuthResult>;
  validateContent(content: PublishPayload): Promise<ValidationResult>;
  publish(content: PublishPayload): Promise<PublishResult>;
  getStatus(externalId: string): Promise<PublishStatusResult>;
  unpublish(externalId: string): Promise<void>;
}

/**
 * Wix Blog publishing adapter for Phase 1.
 */
export class WixPublishAdapter implements PublishAdapter {
  readonly name = "wix";

  constructor(
    private apiKey?: string,
    private siteId?: string,
  ) {}

  async authenticate(): Promise<AuthResult> {
    if (!this.apiKey || !this.siteId) {
      return { authenticated: false, error: "Wix API key and site ID are required" };
    }
    // Placeholder: Validate API key with Wix
    return { authenticated: true };
  }

  async validateContent(content: PublishPayload): Promise<ValidationResult> {
    const errors: string[] = [];
    if (!content.title) errors.push("Title is required for Wix posts");
    if (!content.body) errors.push("Body content is required for Wix posts");
    return { valid: errors.length === 0, errors };
  }

  async publish(content: PublishPayload): Promise<PublishResult> {
    const auth = await this.authenticate();
    if (!auth.authenticated) {
      return { success: false, error: auth.error };
    }
    // Placeholder: Publish to Wix Blog REST API
    return { success: false, error: "Wix publishing not yet implemented" };
  }

  async getStatus(externalId: string): Promise<PublishStatusResult> {
    void externalId;
    return { status: "pending" };
  }

  async unpublish(externalId: string): Promise<void> {
    void externalId;
  }
}

/**
 * LinkedIn publishing adapter for Phase 1.
 */
export class LinkedInPublishAdapter implements PublishAdapter {
  readonly name = "linkedin";

  constructor(private accessToken?: string) {}

  async authenticate(): Promise<AuthResult> {
    if (!this.accessToken) {
      return { authenticated: false, error: "LinkedIn access token is required" };
    }
    return { authenticated: true };
  }

  async validateContent(content: PublishPayload): Promise<ValidationResult> {
    const errors: string[] = [];
    if (!content.body) errors.push("Post content is required for LinkedIn");
    if (content.body && content.body.length > 3000) {
      errors.push("LinkedIn post content must be under 3000 characters");
    }
    return { valid: errors.length === 0, errors };
  }

  async publish(content: PublishPayload): Promise<PublishResult> {
    const auth = await this.authenticate();
    if (!auth.authenticated) {
      return { success: false, error: auth.error };
    }
    // Placeholder: Publish to LinkedIn Marketing API
    return { success: false, error: "LinkedIn publishing not yet implemented" };
  }

  async getStatus(externalId: string): Promise<PublishStatusResult> {
    void externalId;
    return { status: "pending" };
  }

  async unpublish(externalId: string): Promise<void> {
    void externalId;
  }
}

/**
 * HubSpot publishing adapter for Phase 1.
 */
export class HubSpotPublishAdapter implements PublishAdapter {
  readonly name = "hubspot";

  constructor(private accessToken?: string) {}

  async authenticate(): Promise<AuthResult> {
    if (!this.accessToken) {
      return { authenticated: false, error: "HubSpot access token is required" };
    }
    return { authenticated: true };
  }

  async validateContent(content: PublishPayload): Promise<ValidationResult> {
    const errors: string[] = [];
    if (!content.title) errors.push("Subject line/title is required for HubSpot");
    if (!content.body) errors.push("Email body is required for HubSpot");
    return { valid: errors.length === 0, errors };
  }

  async publish(content: PublishPayload): Promise<PublishResult> {
    const auth = await this.authenticate();
    if (!auth.authenticated) {
      return { success: false, error: auth.error };
    }
    // Placeholder: Publish to HubSpot Marketing API
    return { success: false, error: "HubSpot publishing not yet implemented" };
  }

  async getStatus(externalId: string): Promise<PublishStatusResult> {
    void externalId;
    return { status: "pending" };
  }

  async unpublish(externalId: string): Promise<void> {
    void externalId;
  }
}
