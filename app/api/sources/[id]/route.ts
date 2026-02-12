import { NextRequest, NextResponse } from "next/server";
import { getSource, updateSource, deleteSource } from "@/lib/db/mock-store";

// GET /api/sources/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const source = getSource(id);

  if (!source) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  return NextResponse.json(source);
}

// PATCH /api/sources/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  const updated = updateSource(id, body);
  if (!updated) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// DELETE /api/sources/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const deleted = deleteSource(id);

  if (!deleted) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
