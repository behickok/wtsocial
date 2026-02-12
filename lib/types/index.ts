// ─── Content Status Flow ─────────────────────────────────────────────────────

export type ContentStatusType =
  | "ingested"
  | "summarizing"
  | "summarized"
  | "generating_image"
  | "ready_for_review"
  | "approved"
  | "publishing"
  | "published"
  | "rejected"
  | "failed";

export const CONTENT_STATUS_TRANSITIONS: Record<ContentStatusType, ContentStatusType[]> = {
  ingested: ["summarizing", "failed"],
  summarizing: ["summarized", "failed"],
  summarized: ["generating_image", "failed"],
  generating_image: ["ready_for_review", "failed"],
  ready_for_review: ["approved", "rejected"],
  approved: ["publishing", "failed"],
  publishing: ["published", "failed"],
  published: [],
  rejected: ["ingested"],
  failed: ["ingested"],
};

// ─── Adapter Types ───────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface IngestInput {
  url: string;
  organizationId: string;
  sourceId?: string;
  metadata?: Record<string, unknown>;
}

export interface ExtractedContent {
  title: string;
  author?: string;
  publishedDate?: Date;
  sourceDomain: string;
  content: string;
  featuredImage?: string;
}

export interface SummaryResult {
  body: string;
  modelUsed: string;
  tokensUsed?: number;
}

export interface CostEstimate {
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  currency: string;
}

export interface AuthResult {
  authenticated: boolean;
  expiresAt?: Date;
  error?: string;
}

export interface PublishPayload {
  title: string;
  body: string;
  imageUrl?: string;
  knote?: string;
  tags?: string[];
  categories?: string[];
  metadata?: Record<string, unknown>;
}

export interface PublishResult {
  success: boolean;
  externalId?: string;
  externalUrl?: string;
  error?: string;
}

export interface PublishStatusResult {
  status: "pending" | "published" | "failed" | "deleted";
  externalUrl?: string;
}

export interface ImageConfig {
  templateId: string;
  headline: string;
  companyName?: string;
  companyDomain?: string;
  logoUrl?: string;
  brandColors?: string[];
  outputWidth?: number;
  outputHeight?: number;
}

export interface GeneratedImageResult {
  imageUrl: string;
  width: number;
  height: number;
  metadata: Record<string, unknown>;
}

export interface ImageTemplateInfo {
  id: string;
  name: string;
  width: number;
  height: number;
  previewUrl?: string;
}

// ─── Pipeline Types ──────────────────────────────────────────────────────────

export type PipelineStage =
  | "ingestion"
  | "summarization"
  | "image_generation"
  | "review"
  | "publishing";

export interface PipelineStageResult {
  stage: PipelineStage;
  success: boolean;
  startedAt: Date;
  completedAt: Date;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface PipelineEvent {
  type: "stage_started" | "stage_completed" | "stage_failed" | "pipeline_completed" | "pipeline_failed";
  contentItemId: string;
  pipelineRunId: string;
  stage: PipelineStage;
  timestamp: Date;
  data?: Record<string, unknown>;
}

// ─── Prompt Template Types ───────────────────────────────────────────────────

export interface PromptTemplateVariables {
  article_title: string;
  article_body: string;
  source_name: string;
  publication_date: string;
  content_type: string;
  tone: string;
  length: string;
  custom_instructions?: string;
}

// ─── Dashboard Types ─────────────────────────────────────────────────────────

export interface DashboardStats {
  queueCount: number;
  publishedToday: number;
  publishedThisWeek: number;
  failedCount: number;
  sourceCount: number;
}

export interface RecentActivity {
  id: string;
  type: "published" | "ingested" | "failed" | "approved";
  title: string;
  timestamp: Date;
  channel?: string;
}
