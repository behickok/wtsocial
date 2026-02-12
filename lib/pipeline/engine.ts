import { prisma } from "@/lib/db/client";
import type { PipelineStage, PipelineStageResult, PipelineEvent } from "@/lib/types";
import { CONTENT_STATUS_TRANSITIONS, type ContentStatusType } from "@/lib/types";

type PipelineEventHandler = (event: PipelineEvent) => void | Promise<void>;

/**
 * Pipeline engine that orchestrates content through configurable stages.
 * Each stage is executed sequentially with event emission, error handling,
 * and audit trail logging.
 */
export class PipelineEngine {
  private handlers: Map<PipelineEvent["type"], PipelineEventHandler[]> = new Map();

  /**
   * Register an event handler for a specific pipeline event type.
   */
  on(eventType: PipelineEvent["type"], handler: PipelineEventHandler): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  /**
   * Emit a pipeline event to all registered handlers.
   */
  private async emit(event: PipelineEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) ?? [];
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Pipeline event handler error for ${event.type}:`, error);
      }
    }
  }

  /**
   * Execute a single pipeline stage for a content item.
   * Updates the content item status, pipeline run record, and emits events.
   */
  async executeStage(
    contentItemId: string,
    pipelineRunId: string,
    stage: PipelineStage,
    executor: () => Promise<Record<string, unknown>>,
  ): Promise<PipelineStageResult> {
    const startedAt = new Date();

    await this.emit({
      type: "stage_started",
      contentItemId,
      pipelineRunId,
      stage,
      timestamp: startedAt,
    });

    // Update pipeline run with current stage
    await prisma.pipelineRun.update({
      where: { id: pipelineRunId },
      data: { currentStage: stage },
    });

    try {
      const metadata = await executor();
      const completedAt = new Date();

      const result: PipelineStageResult = {
        stage,
        success: true,
        startedAt,
        completedAt,
        metadata,
      };

      // Update pipeline run stages
      const run = await prisma.pipelineRun.findUnique({
        where: { id: pipelineRunId },
      });
      const stages = (run?.stages as unknown as PipelineStageResult[]) ?? [];
      stages.push(result);

      await prisma.pipelineRun.update({
        where: { id: pipelineRunId },
        data: { stages: JSON.parse(JSON.stringify(stages)) },
      });

      await this.emit({
        type: "stage_completed",
        contentItemId,
        pipelineRunId,
        stage,
        timestamp: completedAt,
        data: metadata,
      });

      return result;
    } catch (error) {
      const completedAt = new Date();
      const errorMessage = error instanceof Error ? error.message : String(error);

      const result: PipelineStageResult = {
        stage,
        success: false,
        startedAt,
        completedAt,
        error: errorMessage,
      };

      // Update pipeline run with error
      const run = await prisma.pipelineRun.findUnique({
        where: { id: pipelineRunId },
      });
      const stages = (run?.stages as unknown as PipelineStageResult[]) ?? [];
      stages.push(result);
      const errors = (run?.errors as unknown as string[]) ?? [];
      errors.push(`[${stage}] ${errorMessage}`);

      await prisma.pipelineRun.update({
        where: { id: pipelineRunId },
        data: {
          stages: JSON.parse(JSON.stringify(stages)),
          errors: JSON.parse(JSON.stringify(errors)),
        },
      });

      // Update content item status to failed
      await prisma.contentItem.update({
        where: { id: contentItemId },
        data: { status: "failed" },
      });

      await this.emit({
        type: "stage_failed",
        contentItemId,
        pipelineRunId,
        stage,
        timestamp: completedAt,
        data: { error: errorMessage },
      });

      return result;
    }
  }

  /**
   * Run the full content pipeline for a content item.
   * Creates a pipeline run record, executes each stage in sequence,
   * and handles the overall lifecycle.
   */
  async runPipeline(
    contentItemId: string,
    stages: { stage: PipelineStage; executor: () => Promise<Record<string, unknown>> }[],
  ): Promise<string> {
    // Create the pipeline run record
    const pipelineRun = await prisma.pipelineRun.create({
      data: {
        contentItemId,
        stages: [],
        errors: [],
      },
    });

    for (const { stage, executor } of stages) {
      const result = await this.executeStage(
        contentItemId,
        pipelineRun.id,
        stage,
        executor,
      );

      if (!result.success) {
        await prisma.pipelineRun.update({
          where: { id: pipelineRun.id },
          data: { completedAt: new Date() },
        });

        await this.emit({
          type: "pipeline_failed",
          contentItemId,
          pipelineRunId: pipelineRun.id,
          stage,
          timestamp: new Date(),
          data: { error: result.error },
        });

        return pipelineRun.id;
      }
    }

    await prisma.pipelineRun.update({
      where: { id: pipelineRun.id },
      data: { completedAt: new Date(), currentStage: null },
    });

    await this.emit({
      type: "pipeline_completed",
      contentItemId,
      pipelineRunId: pipelineRun.id,
      stage: "publishing",
      timestamp: new Date(),
    });

    return pipelineRun.id;
  }
}

/**
 * Validate that a content status transition is allowed.
 */
export function canTransition(from: ContentStatusType, to: ContentStatusType): boolean {
  return CONTENT_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Transition a content item to a new status with validation.
 */
export async function transitionContentStatus(
  contentItemId: string,
  newStatus: ContentStatusType,
): Promise<void> {
  const item = await prisma.contentItem.findUnique({
    where: { id: contentItemId },
  });

  if (!item) {
    throw new Error(`Content item ${contentItemId} not found`);
  }

  const currentStatus = item.status as ContentStatusType;
  if (!canTransition(currentStatus, newStatus)) {
    throw new Error(
      `Invalid status transition: ${currentStatus} → ${newStatus}`,
    );
  }

  await prisma.contentItem.update({
    where: { id: contentItemId },
    data: { status: newStatus },
  });
}

// Singleton pipeline engine instance
export const pipelineEngine = new PipelineEngine();
