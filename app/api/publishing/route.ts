import { NextRequest, NextResponse } from "next/server";
import { getPublishTargets, updatePublishTarget, publishContent } from "@/lib/db/mock-store";

// GET /api/publishing
export async function GET() {
  const targets = getPublishTargets();
  return NextResponse.json(targets);
}

// POST /api/publishing - Publish content to a target, or update target settings
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Publish content to target
  if (body.action === "publish" && body.contentItemId && body.targetId) {
    const record = publishContent(body.contentItemId, body.targetId);
    if (!record) {
      return NextResponse.json({ error: "Content item or target not found" }, { status: 404 });
    }
    return NextResponse.json(record, { status: 201 });
  }

  // Toggle connection status
  if (body.action === "toggle_connection" && body.targetId) {
    const target = updatePublishTarget(body.targetId, { connected: body.connected });
    if (!target) {
      return NextResponse.json({ error: "Target not found" }, { status: 404 });
    }
    return NextResponse.json(target);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
