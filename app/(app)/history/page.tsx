import { History, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";

export default function HistoryPage() {
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
          <Input placeholder="Search by title, URL, or ID..." className="pl-9" />
        </div>
        <select className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700">
          <option>All Events</option>
          <option>Pipeline Runs</option>
          <option>Published</option>
          <option>Failed</option>
          <option>Ingested</option>
        </select>
        <select className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
          <option>All time</option>
        </select>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Event Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div className="mb-2 grid grid-cols-12 gap-4 border-b border-zinc-100 pb-2 text-xs font-medium text-zinc-500 dark:border-zinc-800">
            <div className="col-span-1">Type</div>
            <div className="col-span-4">Content</div>
            <div className="col-span-2">Stage</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Timestamp</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-12">
            <History className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
            <p className="mt-3 text-sm font-medium text-zinc-500">
              No history yet
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Pipeline run history, publishing logs, and system events will
              appear here as content flows through the system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
