"use client";

import { useState, useEffect } from "react";
import { Brain, FileText, Palette, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";

interface SettingsData {
  organization: {
    id: string;
    name: string;
    settings: {
      ai: { model: string; temperature: number; maxTokens: number };
    };
    branding: { primaryColor: string; secondaryColor: string; logoUrl: string };
  };
  promptTemplates: {
    id: string;
    name: string;
    systemPrompt: string;
    userPromptTemplate: string;
    model: string;
    temperature: number;
    maxTokens: number;
  }[];
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"ai" | "prompts" | "branding">("ai");
  const [data, setData] = useState<SettingsData | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // AI settings local state
  const [aiModel, setAiModel] = useState("claude-sonnet-4-5-20250514");
  const [aiTemp, setAiTemp] = useState("0.3");
  const [aiMaxTokens, setAiMaxTokens] = useState("1500");

  // Branding local state
  const [brandName, setBrandName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1a365d");
  const [secondaryColor, setSecondaryColor] = useState("#2b6cb0");
  const [logoUrl, setLogoUrl] = useState("");

  // Prompt templates local state
  const [promptData, setPromptData] = useState<Record<string, { system: string; user: string }>>({});

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const fetchSettings = async () => {
    const res = await fetch("/api/settings");
    const json: SettingsData = await res.json();
    setData(json);

    // Populate local state
    setAiModel(json.organization.settings.ai.model);
    setAiTemp(String(json.organization.settings.ai.temperature));
    setAiMaxTokens(String(json.organization.settings.ai.maxTokens));
    setBrandName(json.organization.name);
    setPrimaryColor(json.organization.branding.primaryColor);
    setSecondaryColor(json.organization.branding.secondaryColor);
    setLogoUrl(json.organization.branding.logoUrl);

    const pd: Record<string, { system: string; user: string }> = {};
    for (const pt of json.promptTemplates) {
      pd[pt.id] = { system: pt.systemPrompt, user: pt.userPromptTemplate };
    }
    setPromptData(pd);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveAI = async () => {
    setSaving("ai");
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ai: { model: aiModel, temperature: parseFloat(aiTemp), maxTokens: parseInt(aiMaxTokens) },
      }),
    });
    showFeedback("AI settings saved!");
    setSaving(null);
  };

  const handleSaveBranding = async () => {
    setSaving("branding");
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branding: { name: brandName, primaryColor, secondaryColor, logoUrl },
      }),
    });
    showFeedback("Branding saved!");
    setSaving(null);
  };

  const handleSavePrompt = async (id: string) => {
    setSaving(id);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        promptTemplate: { id, systemPrompt: promptData[id]?.system, userPromptTemplate: promptData[id]?.user },
      }),
    });
    showFeedback("Template saved!");
    setSaving(null);
  };

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

      {feedback && (
        <div className="mb-4 flex items-center gap-2 rounded-md bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4" />
          {feedback}
        </div>
      )}

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
              <CardDescription>Configure the AI model used for content summarization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Model</label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
                >
                  <option value="claude-sonnet-4-5-20250514">Claude Sonnet 4.5 (Recommended)</option>
                  <option value="claude-haiku-3-5-20241022">Claude Haiku 3.5</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Temperature</label>
                  <Input type="number" min="0" max="1" step="0.1" value={aiTemp} onChange={(e) => setAiTemp(e.target.value)} />
                  <p className="mt-1 text-xs text-zinc-400">Lower = more factual, Higher = more creative</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Max Tokens</label>
                  <Input type="number" min="100" max="4000" step="100" value={aiMaxTokens} onChange={(e) => setAiMaxTokens(e.target.value)} />
                  <p className="mt-1 text-xs text-zinc-400">Maximum length of generated summaries</p>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">API Key</label>
                <Input type="password" placeholder="sk-ant-..." defaultValue="sk-ant-***mock***" readOnly />
                <p className="mt-1 text-xs text-zinc-400">Stored encrypted at rest. (Mock mode - no real key needed)</p>
              </div>
              <Button size="sm" onClick={handleSaveAI} disabled={saving === "ai"}>
                {saving === "ai" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save AI Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Prompt Templates */}
      {activeTab === "prompts" && (
        <div className="space-y-6">
          {data?.promptTemplates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>
                  {template.name.includes("Safari")
                    ? "Template for creating weekly roundup entries."
                    : "Template for summarizing single news articles in WTSP format."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">System Prompt</label>
                  <Textarea
                    rows={6}
                    value={promptData[template.id]?.system ?? ""}
                    onChange={(e) => setPromptData((prev) => ({ ...prev, [template.id]: { ...prev[template.id], system: e.target.value } }))}
                    className="font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">User Prompt Template</label>
                  <Textarea
                    rows={6}
                    value={promptData[template.id]?.user ?? ""}
                    onChange={(e) => setPromptData((prev) => ({ ...prev, [template.id]: { ...prev[template.id], user: e.target.value } }))}
                    className="font-mono text-xs"
                  />
                  <p className="mt-1 text-xs text-zinc-400">
                    Available variables: {`{{article_title}}, {{article_body}}, {{source_name}}, {{publication_date}}`}
                  </p>
                </div>
                <Button size="sm" onClick={() => handleSavePrompt(template.id)} disabled={saving === template.id}>
                  {saving === template.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Branding */}
      {activeTab === "branding" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Branding</CardTitle>
              <CardDescription>
                Configure your organization name and brand settings used across generated content and images.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Organization Name</label>
                <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-10 cursor-pointer rounded border border-zinc-300 dark:border-zinc-700"
                    />
                    <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Secondary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-10 w-10 cursor-pointer rounded border border-zinc-300 dark:border-zinc-700"
                    />
                    <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="flex-1" />
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Logo URL</label>
                <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
                <p className="mt-1 text-xs text-zinc-400">URL to your organization logo (PNG or SVG recommended)</p>
              </div>
              <Button size="sm" onClick={handleSaveBranding} disabled={saving === "branding"}>
                {saving === "branding" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Branding
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
