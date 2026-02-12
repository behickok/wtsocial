"use client";

import { Send, Plus, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

interface PublishChannel {
  id: string;
  name: string;
  type: "wix" | "linkedin" | "hubspot";
  connected: boolean;
  lastPublished: string | null;
  publishCount: number;
}

// Placeholder data
const channels: PublishChannel[] = [
  {
    id: "1",
    name: "Wix Blog",
    type: "wix",
    connected: false,
    lastPublished: null,
    publishCount: 0,
  },
  {
    id: "2",
    name: "LinkedIn",
    type: "linkedin",
    connected: false,
    lastPublished: null,
    publishCount: 0,
  },
  {
    id: "3",
    name: "HubSpot",
    type: "hubspot",
    connected: false,
    lastPublished: null,
    publishCount: 0,
  },
];

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

export default function PublishingPage() {
  return (
    <div>
      <PageHeader
        title="Publishing"
        description="Manage output channels and view publishing history."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add Channel
          </Button>
        }
      />

      {/* Connected Channels */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {channels.map((channel) => (
          <Card key={channel.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${
                    channelColors[channel.type]
                  }`}
                >
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
                  <span className="font-medium">{channel.publishCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Last published</span>
                  <span className="font-medium">
                    {channel.lastPublished ?? "Never"}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {channel.connected ? (
                  <>
                    <Button size="sm" variant="outline" className="flex-1">
                      <RefreshCw className="h-3 w-3" />
                      Test
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Settings
                    </Button>
                  </>
                ) : (
                  <Button size="sm" className="flex-1">
                    Connect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Publishing Activity */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Send className="h-4 w-4" />
              Publishing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <Send className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
              <p className="mt-2 text-sm text-zinc-500">No publishing history</p>
              <p className="text-xs text-zinc-400">
                Published content will appear here with status and links.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
