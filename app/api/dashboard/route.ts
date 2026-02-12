import { NextResponse } from "next/server";
import { getDashboardStats, getRecentActivity, getPipelineOverview } from "@/lib/db/mock-store";

// GET /api/dashboard
export async function GET() {
  const stats = getDashboardStats();
  const recentActivity = getRecentActivity(10);
  const pipelineOverview = getPipelineOverview();

  return NextResponse.json({ stats, recentActivity, pipelineOverview });
}
