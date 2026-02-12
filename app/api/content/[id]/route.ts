import { NextRequest, NextResponse } from "next/server";
import { getContentItem, updateContentItem, deleteContentItem } from "@/lib/db/mock-store";

// GET /api/content/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const item = getContentItem(id);

  if (!item) {
    return NextResponse.json({ error: "Content item not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

// PATCH /api/content/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  const updated = updateContentItem(id, body);
  if (!updated) {
    return NextResponse.json({ error: "Content item not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// DELETE /api/content/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const deleted = deleteContentItem(id);

  if (!deleted) {
    return NextResponse.json({ error: "Content item not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
