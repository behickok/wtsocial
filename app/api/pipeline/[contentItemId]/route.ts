import { NextRequest, NextResponse } from "next/server";
import { getPipelineRuns, executeMockPipeline } from "@/lib/db/mock-store";

// GET /api/pipeline/[contentItemId] - Get pipeline runs for a content item
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ contentItemId: string }> },
) {
  const { contentItemId } = await params;
  const runs = getPipelineRuns(contentItemId);
  return NextResponse.json(runs);
}

// POST /api/pipeline/[contentItemId] - Trigger a pipeline run
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ contentItemId: string }> },
) {
  const { contentItemId } = await params;
  const result = executeMockPipeline(contentItemId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ status: "completed", contentItemId }, { status: 200 });
}
