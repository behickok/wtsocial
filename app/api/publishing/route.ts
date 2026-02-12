import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

const CreateTargetSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["wix", "linkedin", "hubspot"]),
  organizationId: z.string().min(1),
  settings: z.record(z.string(), z.unknown()).optional(),
});

// GET /api/publishing - List all publish targets
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("organizationId");

  const where: Record<string, unknown> = {};
  if (orgId) where.organizationId = orgId;

  const targets = await prisma.publishTarget.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { publishRecords: true } },
    },
  });

  // Strip credentials from response
  const safe = targets.map(({ credentials: _credentials, ...rest }) => rest);

  return NextResponse.json(safe);
}

// POST /api/publishing - Create a new publish target
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreateTargetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const target = await prisma.publishTarget.create({
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      organizationId: parsed.data.organizationId,
      settings: (parsed.data.settings ?? {}) as Record<string, string>,
    },
  });

  // Strip credentials from response
  const { credentials: _credentials, ...safe } = target;

  return NextResponse.json(safe, { status: 201 });
}
