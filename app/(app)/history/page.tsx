"use client";

import { useState, useEffect, useCallback } from "react";
import { History, Search, Filter, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";

interface HistoryEvent {
  id: string;
  type: "pipeline_run" | "published" | "ingested" | "approved" | "rejected" | "failed";
  contentItemId: string;
  title: string;
  stage: string | null;
  status: string;
  channel: string | null;
  timestamp: string;
  details: string | null;
}

function getTypeBadge(type: string) {
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

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function HistoryPage() {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [daysFilter, setDaysFilter] = useState("0");

  const fetchEvents = useCallback(async () => {
    const params = new URLSearchParams();
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (search) params.set("search", search);
    if (daysFilter !== "0") params.set("days", daysFilter);
    const res = await fetch(`/api/history?${params.toString()}`);
    const data = await res.json();
    setEvents(data);
  }, [typeFilter, search, daysFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchEvents]);

  return (
    <div>
      <PageHeader
        title="History"
        description="Audit trail of pipeline runs, published content, and system events."
      />

      {/* Search & Filter */}
      <div className="mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search by title, URL, or ID..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        >
          <option value="all">All Events</option>
          <option value="pipeline_run">Pipeline Runs</option>
          <option value="published">Published</option>
          <option value="failed">Failed</option>
          <option value="ingested">Ingested</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={daysFilter}
          onChange={(e) => setDaysFilter(e.target.value)}
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        >
          <option value="0">All time</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />
              Event Log
            </CardTitle>
            <span className="text-xs text-zinc-400">{events.length} events</span>
          </div>
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div className="mb-2 grid grid-cols-12 gap-4 border-b border-zinc-100 pb-2 text-xs font-medium text-zinc-500 dark:border-zinc-800">
            <div className="col-span-2">Type</div>
            <div className="col-span-4">Content</div>
            <div className="col-span-2">Stage</div>
            <div className="col-span-2">Details</div>
            <div className="col-span-2">When</div>
          </div>

          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <History className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
              <p className="mt-3 text-sm font-medium text-zinc-500">
                {search || typeFilter !== "all" ? "No matching events" : "No history yet"}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                {search || typeFilter !== "all"
                  ? "Try adjusting your filters."
                  : "Pipeline run history, publishing logs, and system events will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="grid grid-cols-12 items-center gap-4 rounded-md py-2.5 px-1 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                >
                  <div className="col-span-2">
                    {getTypeBadge(event.type)}
                  </div>
                  <div className="col-span-4 min-w-0">
                    <p className="truncate font-medium text-sm">{event.title}</p>
                    <p className="truncate text-xs text-zinc-400">ID: {event.contentItemId}</p>
                  </div>
                  <div className="col-span-2 text-xs text-zinc-500">
                    {event.stage || "—"}
                    {event.channel && (
                      <span className="block text-zinc-400">{event.channel}</span>
                    )}
                  </div>
                  <div className="col-span-2 text-xs text-zinc-400 truncate">
                    {event.details || "—"}
                  </div>
                  <div className="col-span-2 text-xs text-zinc-400">
                    {formatTimestamp(event.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
