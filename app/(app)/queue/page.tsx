"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Plus,
  Filter,
  Eye,
  Check,
  X,
  RotateCcw,
  ExternalLink,
  Loader2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";
import type { ContentStatusType } from "@/lib/types";

interface QueueItem {
  id: string;
  title: string | null;
  sourceDomain: string | null;
  status: ContentStatusType;
  createdAt: string;
  originalUrl: string;
  summaries: { id: string; body: string; knote: string | null; version: number }[];
  source: { name: string; type: string } | null;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" }> = {
  ingested: { label: "Ingested", variant: "secondary" },
  summarizing: { label: "Summarizing", variant: "default" },
  summarized: { label: "Summarized", variant: "secondary" },
  generating_image: { label: "Generating Image", variant: "default" },
  ready_for_review: { label: "Ready for Review", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  publishing: { label: "Publishing", variant: "default" },
  published: { label: "Published", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
  failed: { label: "Failed", variant: "destructive" },
};

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function QueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [ingestUrl, setIngestUrl] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [knoteValue, setKnoteValue] = useState("");
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const showFeedback = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const fetchItems = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterStatus !== "all") params.set("status", filterStatus);
    const res = await fetch(`/api/content?${params.toString()}`);
    const data = await res.json();
    setItems(data.items ?? []);
  }, [filterStatus]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (selectedItem?.summaries?.[0]?.knote) {
      setKnoteValue(selectedItem.summaries[0].knote);
    } else {
      setKnoteValue("");
    }
  }, [selectedItem]);

  const handleIngest = async () => {
    if (!ingestUrl) return;
    setIngesting(true);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: ingestUrl }),
      });
      if (res.ok) {
        setIngestUrl("");
        showFeedback("Article ingested and processed!");
        await fetchItems();
      } else {
        const err = await res.json();
        showFeedback(err.error || "Failed to ingest", "error");
      }
    } catch {
      showFeedback("Network error", "error");
    } finally {
      setIngesting(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    setActionLoading(status);
    try {
      const res = await fetch(`/api/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showFeedback(
          status === "approved" ? "Content approved!" :
          status === "rejected" ? "Content rejected" :
          `Status changed to ${status}`
        );
        setSelectedItem(null);
        await fetchItems();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveKnote = async () => {
    if (!selectedItem) return;
    setActionLoading("knote");
    try {
      await fetch(`/api/content/${selectedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ knote: knoteValue }),
      });
      showFeedback("Knote saved!");
      await fetchItems();
      const res = await fetch(`/api/content/${selectedItem.id}`);
      if (res.ok) {
        const updated = await res.json();
        setSelectedItem(updated);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReprocess = async (id: string) => {
    setActionLoading("reprocess");
    try {
      await fetch(`/api/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ingested" }),
      });
      const res = await fetch(`/api/pipeline/${id}`, { method: "POST" });
      if (res.ok) {
        showFeedback("Re-summarized successfully!");
        setSelectedItem(null);
        await fetchItems();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublish = async (id: string) => {
    setActionLoading("publish");
    try {
      const targetsRes = await fetch("/api/publishing");
      const targets = await targetsRes.json();
      const connected = targets.filter((t: { connected: boolean }) => t.connected);

      for (const target of connected) {
        await fetch("/api/publishing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "publish", contentItemId: id, targetId: target.id }),
        });
      }

      showFeedback(`Published to ${connected.length} channel(s)!`);
      setSelectedItem(null);
      await fetchItems();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Content Queue"
        description="Review, edit, and approve content for publishing."
        actions={
          <div className="flex items-center gap-2">
            <Input
              placeholder="Paste article URL..."
              value={ingestUrl}
              onChange={(e) => setIngestUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleIngest()}
              className="w-72"
            />
            <Button size="sm" disabled={!ingestUrl || ingesting} onClick={handleIngest}>
              {ingesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {ingesting ? "Processing..." : "Ingest"}
            </Button>
          </div>
        }
      />

      {feedback && (
        <div className={`mb-4 rounded-md px-4 py-2 text-sm font-medium ${
          feedback.type === "success"
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
            : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
        }`}>
          {feedback.message}
        </div>
      )}

      <div className="flex gap-6">
        {/* Queue List */}
        <div className="w-full lg:w-1/2">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700"
            >
              <option value="all">All Statuses</option>
              <option value="ready_for_review">Ready for Review</option>
              <option value="ingested">Ingested</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
              <option value="failed">Failed</option>
            </select>
            <span className="text-xs text-zinc-400">{items.length} items</span>
          </div>

          {items.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
                <p className="mt-3 text-sm font-medium text-zinc-500">No content items</p>
                <p className="mt-1 text-xs text-zinc-400">
                  Paste a URL above to ingest your first article, or configure RSS sources.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {items.map((item) => {
                const config = statusConfig[item.status];
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full rounded-lg border p-4 text-left transition-colors ${
                      selectedItem?.id === item.id
                        ? "border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-950/20"
                        : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.title || "Untitled"}</p>
                        <p className="mt-0.5 text-xs text-zinc-400">
                          {item.sourceDomain} · {timeAgo(item.createdAt)}
                          {item.source && ` · via ${item.source.name}`}
                        </p>
                      </div>
                      <Badge variant={config?.variant ?? "secondary"}>
                        {config?.label ?? item.status}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Review Panel */}
        <div className="hidden lg:block lg:w-1/2">
          {selectedItem ? (
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base">{selectedItem.title || "Untitled"}</CardTitle>
                    <p className="mt-1 text-xs text-zinc-400">
                      {selectedItem.sourceDomain} · {statusConfig[selectedItem.status]?.label}
                    </p>
                  </div>
                  <a
                    href={selectedItem.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-zinc-600"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-500">AI Summary</label>
                  {selectedItem.summaries?.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm whitespace-pre-wrap dark:border-zinc-800 dark:bg-zinc-900">
                      {selectedItem.summaries[0].body}
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-400 dark:border-zinc-700">
                      {selectedItem.status === "ingested" ? "Click 'Process' to run the pipeline." : "No summary available."}
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-500">Editorial Note (Knote)</label>
                  <Textarea
                    value={knoteValue}
                    onChange={(e) => setKnoteValue(e.target.value)}
                    rows={3}
                    placeholder="Add your editorial commentary here..."
                  />
                  {knoteValue !== (selectedItem.summaries?.[0]?.knote ?? "") && (
                    <Button size="sm" variant="outline" className="mt-2" onClick={handleSaveKnote} disabled={actionLoading === "knote"}>
                      {actionLoading === "knote" ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                      Save Knote
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  {selectedItem.status === "ready_for_review" && (
                    <>
                      <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusChange(selectedItem.id, "approved")} disabled={!!actionLoading}>
                        {actionLoading === "approved" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleStatusChange(selectedItem.id, "rejected")} disabled={!!actionLoading}>
                        {actionLoading === "rejected" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                        Reject
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReprocess(selectedItem.id)} disabled={!!actionLoading}>
                        <RotateCcw className="h-4 w-4" />
                        Re-summarize
                      </Button>
                    </>
                  )}
                  {selectedItem.status === "approved" && (
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => handlePublish(selectedItem.id)} disabled={!!actionLoading}>
                      {actionLoading === "publish" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Publish to Connected Channels
                    </Button>
                  )}
                  {(selectedItem.status === "failed" || selectedItem.status === "ingested" || selectedItem.status === "rejected") && (
                    <Button size="sm" variant="outline" onClick={() => handleReprocess(selectedItem.id)} disabled={!!actionLoading}>
                      {actionLoading === "reprocess" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                      {selectedItem.status === "failed" ? "Retry Pipeline" : "Process / Re-summarize"}
                    </Button>
                  )}
                  {selectedItem.status === "published" && (
                    <p className="text-xs text-emerald-600">This content has been published.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Eye className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                <p className="mt-2 text-sm text-zinc-500">Select an item to review</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
