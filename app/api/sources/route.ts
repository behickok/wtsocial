import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

const CreateSourceSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["rss", "manual"]),
  url: z.string().url(),
  organizationId: z.string().min(1),
  schedule: z.string().optional(),
});

// GET /api/sources - List all sources
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("organizationId");

  const where: Record<string, unknown> = {};
  if (orgId) where.organizationId = orgId;

  const sources = await prisma.source.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { contentItems: true } },
    },
  });

  return NextResponse.json(sources);
}

// POST /api/sources - Create a new source
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreateSourceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const source = await prisma.source.create({
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      url: parsed.data.url,
      organizationId: parsed.data.organizationId,
      schedule: parsed.data.schedule ?? null,
    },
  });

  return NextResponse.json(source, { status: 201 });
}
