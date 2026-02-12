import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/db/mock-store";

// GET /api/settings
export async function GET() {
  const settings = getSettings();
  return NextResponse.json(settings);
}

// PATCH /api/settings
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const updated = updateSettings(body);
  return NextResponse.json(updated);
}
