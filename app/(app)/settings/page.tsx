"use client";

import { useState } from "react";
import { Settings, Brain, FileText, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"ai" | "prompts" | "branding">("ai");

  const tabs = [
    { id: "ai" as const, label: "AI Configuration", icon: Brain },
    { id: "prompts" as const, label: "Prompt Templates", icon: FileText },
    { id: "branding" as const, label: "Branding", icon: Palette },
  ];

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure AI models, prompt templates, and branding."
      />

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* AI Configuration */}
      {activeTab === "ai" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>LLM Provider</CardTitle>
              <CardDescription>
                Configure the AI model used for content summarization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Model</label>
                <select className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700">
                  <option>Claude Sonnet 4.5 (Recommended)</option>
                  <option>Claude Haiku 3.5</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Temperature</label>
                  <Input type="number" min="0" max="1" step="0.1" defaultValue="0.3" />
                  <p className="mt-1 text-xs text-zinc-400">
                    Lower = more factual, Higher = more creative
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Max Tokens</label>
                  <Input type="number" min="100" max="4000" step="100" defaultValue="1500" />
                  <p className="mt-1 text-xs text-zinc-400">
                    Maximum length of generated summaries
                  </p>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">API Key</label>
                <Input type="password" placeholder="sk-ant-..." />
                <p className="mt-1 text-xs text-zinc-400">
                  Your Anthropic API key. Stored encrypted at rest.
                </p>
              </div>
              <Button size="sm">Save AI Settings</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Prompt Templates */}
      {activeTab === "prompts" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Individual News Post</CardTitle>
              <CardDescription>
                Template for summarizing single news articles in WTSP format.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">System Prompt</label>
                <Textarea
                  rows={6}
                  defaultValue="You are a professional financial technology content writer for WealthTech Strategy Partners (WTSP)..."
                  className="font-mono text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">User Prompt Template</label>
                <Textarea
                  rows={6}
                  defaultValue="Please summarize the following article into a WealthTech Strategy Partners blog post format:&#10;&#10;Title: {{article_title}}&#10;Source: {{source_name}}&#10;Date: {{publication_date}}&#10;&#10;Article content:&#10;{{article_body}}"
                  className="font-mono text-xs"
                />
                <p className="mt-1 text-xs text-zinc-400">
                  Available variables: {`{{article_title}}, {{article_body}}, {{source_name}}, {{publication_date}}, {{content_type}}, {{tone}}, {{length}}`}
                </p>
              </div>
              <Button size="sm">Save Template</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>WealthTech Safari (Weekly Roundup)</CardTitle>
              <CardDescription>
                Template for creating weekly roundup entries.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">System Prompt</label>
                <Textarea
                  rows={4}
                  defaultValue="You are a professional financial technology content writer for WealthTech Strategy Partners (WTSP). Your task is to create entries for the WealthTech Safari weekly roundup format..."
                  className="font-mono text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">User Prompt Template</label>
                <Textarea
                  rows={4}
                  defaultValue="Create a WealthTech Safari roundup entry for the following article:&#10;&#10;Title: {{article_title}}&#10;Source: {{source_name}}&#10;Date: {{publication_date}}&#10;&#10;Article content:&#10;{{article_body}}"
                  className="font-mono text-xs"
                />
              </div>
              <Button size="sm">Save Template</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Branding */}
      {activeTab === "branding" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Branding</CardTitle>
              <CardDescription>
                Configure your organization name and brand settings used across
                generated content and images.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Organization Name</label>
                <Input defaultValue="WealthTech Strategy Partners" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      defaultValue="#1a365d"
                      className="h-10 w-10 cursor-pointer rounded border border-zinc-300 dark:border-zinc-700"
                    />
                    <Input defaultValue="#1a365d" className="flex-1" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Secondary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      defaultValue="#2b6cb0"
                      className="h-10 w-10 cursor-pointer rounded border border-zinc-300 dark:border-zinc-700"
                    />
                    <Input defaultValue="#2b6cb0" className="flex-1" />
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Logo URL</label>
                <Input placeholder="https://..." />
                <p className="mt-1 text-xs text-zinc-400">
                  URL to your organization logo (PNG or SVG recommended)
                </p>
              </div>
              <Button size="sm">Save Branding</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
