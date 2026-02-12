import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

// GET /api/pipeline/[contentItemId] - Get pipeline runs for a content item
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ contentItemId: string }> },
) {
  const { contentItemId } = await params;

  const runs = await prisma.pipelineRun.findMany({
    where: { contentItemId },
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json(runs);
}

// POST /api/pipeline/[contentItemId] - Trigger a pipeline run for a content item
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ contentItemId: string }> },
) {
  const { contentItemId } = await params;

  const item = await prisma.contentItem.findUnique({
    where: { id: contentItemId },
  });

  if (!item) {
    return NextResponse.json(
      { error: "Content item not found" },
      { status: 404 },
    );
  }

  if (item.status !== "ingested" && item.status !== "failed") {
    return NextResponse.json(
      {
        error: `Cannot start pipeline for item in '${item.status}' status. Item must be in 'ingested' or 'failed' status.`,
      },
      { status: 400 },
    );
  }

  // Create a pipeline run record
  const run = await prisma.pipelineRun.create({
    data: {
      contentItemId,
      stages: [],
      errors: [],
    },
  });

  // Update content item to summarizing
  await prisma.contentItem.update({
    where: { id: contentItemId },
    data: { status: "summarizing" },
  });

  // In production, this would trigger async pipeline execution via a job queue
  // (Inngest/Trigger.dev/BullMQ). For now, we return the run ID.

  return NextResponse.json(
    { pipelineRunId: run.id, status: "started" },
    { status: 202 },
  );
}
