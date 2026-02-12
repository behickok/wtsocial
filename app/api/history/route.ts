import { NextRequest, NextResponse } from "next/server";
import { getHistoryEvents } from "@/lib/db/mock-store";

// GET /api/history
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || undefined;
  const search = searchParams.get("search") || undefined;
  const days = searchParams.get("days") ? parseInt(searchParams.get("days")!, 10) : undefined;

  const events = getHistoryEvents({ type, search, days });
  return NextResponse.json(events);
}
