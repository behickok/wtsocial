"use client";

import { useState, useEffect } from "react";
import { Rss, Plus, Globe, Pause, Play, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";

interface SourceItem {
  id: string;
  name: string;
  type: "rss" | "manual";
  url: string;
  active: boolean;
  lastPolledAt: string | null;
  _count: { contentItems: number };
  createdAt: string;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function SourcesPage() {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newSourceType, setNewSourceType] = useState<"rss" | "manual">("rss");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showFeedbackMsg = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const fetchSources = async () => {
    const res = await fetch("/api/sources");
    const data = await res.json();
    setSources(data);
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleAddSource = async () => {
    if (!newSourceName || !newSourceUrl) return;
    setSaving(true);
    try {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSourceName, type: newSourceType, url: newSourceUrl }),
      });
      if (res.ok) {
        showFeedbackMsg("Source added!");
        setNewSourceName("");
        setNewSourceUrl("");
        setShowAddForm(false);
        await fetchSources();
      } else {
        const err = await res.json();
        showFeedbackMsg(err.error || "Failed to add source", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    await fetch(`/api/sources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !currentActive }),
    });
    showFeedbackMsg(currentActive ? "Source paused" : "Source activated");
    await fetchSources();
  };

  const handleDelete = async (id: string, name: string) => {
    await fetch(`/api/sources/${id}`, { method: "DELETE" });
    showFeedbackMsg(`"${name}" deleted`);
    await fetchSources();
  };

  return (
    <div>
      <PageHeader
        title="Sources"
        description="Manage news input sources for content ingestion."
        actions={
          <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4" />
            Add Source
          </Button>
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

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Add New Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <Input
                placeholder="Source name"
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
              />
              <Input
                placeholder="Feed or website URL"
                value={newSourceUrl}
                onChange={(e) => setNewSourceUrl(e.target.value)}
              />
              <select
                value={newSourceType}
                onChange={(e) => setNewSourceType(e.target.value as "rss" | "manual")}
                className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
              >
                <option value="rss">RSS Feed</option>
                <option value="manual">Manual URL</option>
              </select>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={handleAddSource} disabled={saving || !newSourceName || !newSourceUrl}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {sources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Rss className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
            <p className="mt-3 text-sm font-medium text-zinc-500">No sources configured</p>
            <p className="mt-1 text-xs text-zinc-400">
              Add RSS feeds or manual sources to start ingesting content.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sources.map((source) => (
            <Card key={source.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  source.type === "rss"
                    ? "bg-orange-100 dark:bg-orange-900/30"
                    : "bg-blue-100 dark:bg-blue-900/30"
                }`}>
                  {source.type === "rss" ? (
                    <Rss className="h-5 w-5 text-orange-600" />
                  ) : (
                    <Globe className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{source.name}</p>
                    <Badge variant={source.active ? "success" : "secondary"}>
                      {source.active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-zinc-400">{source.url}</p>
                  <p className="text-xs text-zinc-400">
                    {source._count.contentItems} items ingested
                    {source.lastPolledAt && ` · Last polled: ${timeAgo(source.lastPolledAt)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => handleToggleActive(source.id, source.active)} title={source.active ? "Pause" : "Activate"}>
                    {source.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(source.id, source.name)} title="Delete source">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
