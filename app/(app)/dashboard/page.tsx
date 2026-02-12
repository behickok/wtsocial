"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Send,
  AlertCircle,
  Rss,
  TrendingUp,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";

interface DashboardData {
  stats: {
    queueCount: number;
    publishedToday: number;
    failedCount: number;
    sourceCount: number;
  };
  recentActivity: {
    id: string;
    type: "published" | "ingested" | "failed" | "approved" | "rejected" | "pipeline_run";
    title: string;
    timestamp: string;
    channel: string | null;
    details: string | null;
  }[];
  pipelineOverview: {
    ingested: number;
    summarizing: number;
    readyForReview: number;
    approved: number;
    published: number;
    failed: number;
  };
}

function getActivityBadge(type: string) {
  switch (type) {
    case "published":
      return <Badge variant="success">Published</Badge>;
    case "ingested":
      return <Badge variant="secondary">Ingested</Badge>;
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
    case "approved":
      return <Badge variant="warning">Approved</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "pipeline_run":
      return <Badge variant="default">Pipeline</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = [
    {
      name: "Queue",
      value: data?.stats.queueCount ?? 0,
      description: "Items pending review",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      name: "Published Today",
      value: data?.stats.publishedToday ?? 0,
      description: "Posts sent to channels",
      icon: Send,
      color: "text-emerald-600",
    },
    {
      name: "Failed",
      value: data?.stats.failedCount ?? 0,
      description: "Items needing attention",
      icon: AlertCircle,
      color: "text-red-600",
    },
    {
      name: "Active Sources",
      value: data?.stats.sourceCount ?? 0,
      description: "RSS feeds & manual inputs",
      icon: Rss,
      color: "text-amber-600",
    },
  ];

  const pipelineStages = data
    ? [
        { stage: "Ingested", count: data.pipelineOverview.ingested, color: "bg-zinc-300 dark:bg-zinc-600" },
        { stage: "Summarizing", count: data.pipelineOverview.summarizing, color: "bg-blue-400" },
        { stage: "Ready for Review", count: data.pipelineOverview.readyForReview, color: "bg-amber-400" },
        { stage: "Approved", count: data.pipelineOverview.approved, color: "bg-emerald-400" },
        { stage: "Published", count: data.pipelineOverview.published, color: "bg-emerald-600" },
        { stage: "Failed", count: data.pipelineOverview.failed, color: "bg-red-400" },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your content pipeline activity."
        actions={
          <Button size="sm" variant="outline" onClick={() => { setLoading(true); fetchData(); }}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {stat.name}
                  </p>
                  <p className="mt-1 text-3xl font-bold">{stat.value}</p>
                  <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                    {stat.description}
                  </p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity & Pipeline */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!data || data.recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  No recent activity
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentActivity.slice(0, 8).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between rounded-md border border-zinc-100 p-3 dark:border-zinc-800"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {activity.title}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {timeAgo(activity.timestamp)}
                        {activity.channel && ` · ${activity.channel}`}
                      </p>
                    </div>
                    {getActivityBadge(activity.type)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Pipeline Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelineStages.map((item) => (
                <div key={item.stage} className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  <span className="flex-1 text-sm">{item.stage}</span>
                  <span className="text-sm font-medium text-zinc-500">{item.count}</span>
                </div>
              ))}
            </div>
            {data && (
              <div className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <p className="text-xs text-zinc-400">
                  Total items: {Object.values(data.pipelineOverview).reduce((a, b) => a + b, 0)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
