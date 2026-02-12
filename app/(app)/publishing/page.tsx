"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle, XCircle, RefreshCw, Loader2, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

interface PublishChannel {
  id: string;
  name: string;
  type: "wix" | "linkedin" | "hubspot";
  connected: boolean;
  active: boolean;
  _count: { publishRecords: number };
  lastPublished: string | null;
}

const channelIcons: Record<string, string> = {
  wix: "W",
  linkedin: "in",
  hubspot: "H",
};

const channelColors: Record<string, string> = {
  wix: "bg-black text-white dark:bg-white dark:text-black",
  linkedin: "bg-blue-700 text-white",
  hubspot: "bg-orange-500 text-white",
};

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

export default function PublishingPage() {
  const [channels, setChannels] = useState<PublishChannel[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [testResult, setTestResult] = useState<{ channelId: string; success: boolean } | null>(null);

  const showFeedback = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const fetchChannels = async () => {
    const res = await fetch("/api/publishing");
    const data = await res.json();
    setChannels(data);
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleToggleConnection = async (channelId: string, currentlyConnected: boolean) => {
    setLoading(channelId);
    try {
      await fetch("/api/publishing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_connection", targetId: channelId, connected: !currentlyConnected }),
      });
      showFeedback(currentlyConnected ? "Channel disconnected" : "Channel connected!");
      await fetchChannels();
    } finally {
      setLoading(null);
    }
  };

  const handleTest = async (channelId: string) => {
    setLoading(`test-${channelId}`);
    setTestResult(null);
    // Simulate a connection test
    await new Promise((r) => setTimeout(r, 1000));
    setTestResult({ channelId, success: true });
    setLoading(null);
    setTimeout(() => setTestResult(null), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Publishing"
        description="Manage output channels and view publishing history."
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

      {/* Connected Channels */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {channels.map((channel) => (
          <Card key={channel.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${channelColors[channel.type]}`}>
                  {channelIcons[channel.type]}
                </div>
                <div>
                  <CardTitle className="text-base">{channel.name}</CardTitle>
                  <div className="mt-1 flex items-center gap-1">
                    {channel.connected ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                        <span className="text-xs text-emerald-600">Connected</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 text-zinc-400" />
                        <span className="text-xs text-zinc-400">Not connected</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Posts published</span>
                  <span className="font-medium">{channel._count.publishRecords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Last published</span>
                  <span className="font-medium">{timeAgo(channel.lastPublished)}</span>
                </div>
              </div>

              {testResult?.channelId === channel.id && (
                <div className={`mt-3 rounded-md px-3 py-1.5 text-xs font-medium ${
                  testResult.success
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                }`}>
                  {testResult.success ? "Connection test passed!" : "Connection test failed"}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                {channel.connected ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleTest(channel.id)}
                      disabled={loading === `test-${channel.id}`}
                    >
                      {loading === `test-${channel.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                      Test
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleToggleConnection(channel.id, true)}
                      disabled={loading === channel.id}
                    >
                      {loading === channel.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Unplug className="h-3 w-3" />}
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleToggleConnection(channel.id, false)}
                    disabled={loading === channel.id}
                  >
                    {loading === channel.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    Connect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Publishing Stats */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Send className="h-4 w-4" />
              Publishing Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {channels.some((c) => c._count.publishRecords > 0) ? (
              <div className="space-y-3">
                {channels
                  .filter((c) => c._count.publishRecords > 0)
                  .map((channel) => (
                    <div key={channel.id} className="flex items-center justify-between rounded-md border border-zinc-100 p-3 dark:border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded text-xs font-bold ${channelColors[channel.type]}`}>
                          {channelIcons[channel.type]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{channel.name}</p>
                          <p className="text-xs text-zinc-400">Last: {timeAgo(channel.lastPublished)}</p>
                        </div>
                      </div>
                      <Badge variant="success">{channel._count.publishRecords} published</Badge>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Send className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                <p className="mt-2 text-sm text-zinc-500">No publishing history</p>
                <p className="text-xs text-zinc-400">
                  Published content will appear here with status and links.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
