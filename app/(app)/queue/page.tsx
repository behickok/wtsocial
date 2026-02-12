"use client";

import { useState } from "react";
import {
  FileText,
  Plus,
  Filter,
  Eye,
  Check,
  X,
  RotateCcw,
  ExternalLink,
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
  title: string;
  sourceDomain: string;
  status: ContentStatusType;
  createdAt: string;
  originalUrl: string;
  summary?: string;
  knote?: string;
  imageUrl?: string;
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

// Placeholder data - will be replaced with real data from API
const queueItems: QueueItem[] = [];

export default function QueuePage() {
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [ingestUrl, setIngestUrl] = useState("");

  const filteredItems =
    filterStatus === "all"
      ? queueItems
      : queueItems.filter((item) => item.status === filterStatus);

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
              className="w-72"
            />
            <Button size="sm" disabled={!ingestUrl}>
              <Plus className="h-4 w-4" />
              Ingest
            </Button>
          </div>
        }
      />

      <div className="flex gap-6">
        {/* Queue List */}
        <div className="w-full lg:w-1/2">
          {/* Filters */}
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
              <option value="summarized">Summarized</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="failed">Failed</option>
            </select>
            <span className="text-xs text-zinc-400">
              {filteredItems.length} items
            </span>
          </div>

          {/* Items */}
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
                <p className="mt-3 text-sm font-medium text-zinc-500">
                  No content items
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Paste a URL above to ingest your first article, or configure
                  RSS sources.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => {
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
                        <p className="truncate text-sm font-medium">
                          {item.title || "Untitled"}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-400">
                          {item.sourceDomain} · {item.createdAt}
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
                  <CardTitle className="text-base">
                    {selectedItem.title || "Untitled"}
                  </CardTitle>
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
                {/* Summary */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-500">
                    AI Summary
                  </label>
                  <Textarea
                    value={selectedItem.summary ?? ""}
                    rows={8}
                    placeholder="Summary will appear here after AI processing..."
                    readOnly
                  />
                </div>

                {/* Knote */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-500">
                    Editorial Note (Knote)
                  </label>
                  <Textarea
                    value={selectedItem.knote ?? ""}
                    rows={3}
                    placeholder="Add your editorial commentary here..."
                  />
                </div>

                {/* Image Preview */}
                {selectedItem.imageUrl && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-500">
                      Generated Image
                    </label>
                    <div className="aspect-[980/515] rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    <Check className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1">
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button size="sm" variant="outline">
                    <RotateCcw className="h-4 w-4" />
                    Re-summarize
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Eye className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                <p className="mt-2 text-sm text-zinc-500">
                  Select an item to review
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
