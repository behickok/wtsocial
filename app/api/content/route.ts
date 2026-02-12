import { NextRequest, NextResponse } from "next/server";
import { getContentItems, createContentItem, executeMockPipeline } from "@/lib/db/mock-store";

// GET /api/content - List content items with optional status filter
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  const result = getContentItems({ status, limit, offset });
  return NextResponse.json(result);
}

// POST /api/content - Ingest a new content item from a URL
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url, sourceId, autoProcess } = body;

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const item = createContentItem({
    url,
    organizationId: "org_1",
    sourceId,
  });

  // Auto-run the mock pipeline if requested
  if (autoProcess !== false) {
    executeMockPipeline(item.id);
  }

  return NextResponse.json(item, { status: 201 });
}
