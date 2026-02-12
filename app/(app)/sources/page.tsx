"use client";

import { useState } from "react";
import { Rss, Plus, Globe, Pause, Play, Trash2 } from "lucide-react";
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
  itemCount: number;
}

// Placeholder data - will be replaced with real data from API
const sources: SourceItem[] = [];

export default function SourcesPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newSourceType, setNewSourceType] = useState<"rss" | "manual">("rss");

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

      {/* Add Source Form */}
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
                onChange={(e) =>
                  setNewSourceType(e.target.value as "rss" | "manual")
                }
                className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
              >
                <option value="rss">RSS Feed</option>
                <option value="manual">Manual URL</option>
              </select>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sources List */}
      {sources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Rss className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
            <p className="mt-3 text-sm font-medium text-zinc-500">
              No sources configured
            </p>
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
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    source.type === "rss"
                      ? "bg-orange-100 dark:bg-orange-900/30"
                      : "bg-blue-100 dark:bg-blue-900/30"
                  }`}
                >
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
                    {source.itemCount} items ingested
                    {source.lastPolledAt && ` · Last polled: ${source.lastPolledAt}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost">
                    {source.active ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button size="icon" variant="ghost">
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
