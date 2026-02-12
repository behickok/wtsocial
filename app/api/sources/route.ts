import { NextRequest, NextResponse } from "next/server";
import { getSources, createSource } from "@/lib/db/mock-store";

// GET /api/sources
export async function GET() {
  const sources = getSources();
  return NextResponse.json(sources);
}

// POST /api/sources
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, type, url } = body;

  if (!name || !type || !url) {
    return NextResponse.json({ error: "name, type, and url are required" }, { status: 400 });
  }

  const source = createSource({
    name,
    type,
    url,
    organizationId: "org_1",
    schedule: body.schedule,
  });

  return NextResponse.json(source, { status: 201 });
}
