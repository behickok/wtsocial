import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

const UpdateSchema = z.object({
  status: z.string().optional(),
  knote: z.string().optional(),
  title: z.string().optional(),
});

// GET /api/content/[id] - Get a single content item with all relations
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const item = await prisma.contentItem.findUnique({
    where: { id },
    include: {
      summaries: { orderBy: { version: "desc" } },
      generatedImages: true,
      publishRecords: {
        include: { publishTarget: { select: { name: true, type: true } } },
      },
      pipelineRuns: { orderBy: { startedAt: "desc" }, take: 5 },
      source: true,
    },
  });

  if (!item) {
    return NextResponse.json({ error: "Content item not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

// PATCH /api/content/[id] - Update a content item (status, knote, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = UpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const item = await prisma.contentItem.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ error: "Content item not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status) updateData.status = parsed.data.status;
  if (parsed.data.title) updateData.title = parsed.data.title;

  // If knote is provided, update the latest summary
  if (parsed.data.knote !== undefined) {
    const latestSummary = await prisma.summary.findFirst({
      where: { contentItemId: id },
      orderBy: { version: "desc" },
    });
    if (latestSummary) {
      await prisma.summary.update({
        where: { id: latestSummary.id },
        data: { knote: parsed.data.knote },
      });
    }
  }

  const updated = await prisma.contentItem.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updated);
}

// DELETE /api/content/[id] - Delete a content item
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const item = await prisma.contentItem.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ error: "Content item not found" }, { status: 404 });
  }

  await prisma.contentItem.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
