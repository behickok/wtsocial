import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

const IngestSchema = z.object({
  url: z.string().url(),
  organizationId: z.string().min(1),
  sourceId: z.string().optional(),
});

// GET /api/content - List content items with optional status filter
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const orgId = searchParams.get("organizationId");
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (orgId) where.organizationId = orgId;

  const [items, total] = await Promise.all([
    prisma.contentItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        summaries: { orderBy: { version: "desc" }, take: 1 },
        generatedImages: { take: 1 },
        source: { select: { name: true, type: true } },
      },
    }),
    prisma.contentItem.count({ where }),
  ]);

  return NextResponse.json({ items, total, limit, offset });
}

// POST /api/content - Ingest a new content item from a URL
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = IngestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { url, organizationId, sourceId } = parsed.data;

  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const contentItem = await prisma.contentItem.create({
    data: {
      originalUrl: url,
      organizationId,
      sourceId: sourceId ?? null,
      sourceDomain: hostname,
      status: "ingested",
    },
  });

  return NextResponse.json(contentItem, { status: 201 });
}
