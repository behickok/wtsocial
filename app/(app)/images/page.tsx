"use client";

import { useState } from "react";
import { Image as ImageIcon, Plus, Palette, Layout, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";

interface MockTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  active: boolean;
  description: string;
}

export default function ImageTemplatesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [templates, setTemplates] = useState<MockTemplate[]>([
    {
      id: "tmpl_1",
      name: "WTSP Blog Banner",
      width: 980,
      height: 515,
      active: true,
      description: "Standard blog header image with headline overlay and company logo",
    },
    {
      id: "tmpl_2",
      name: "LinkedIn Share Card",
      width: 1200,
      height: 627,
      active: true,
      description: "Optimized for LinkedIn feed sharing with brand colors",
    },
  ]);

  const handleCreate = () => {
    if (!templateName) return;
    const newTemplate: MockTemplate = {
      id: `tmpl_${Date.now()}`,
      name: templateName,
      width: 980,
      height: 515,
      active: true,
      description: "Custom template",
    };
    setTemplates([...templates, newTemplate]);
    setTemplateName("");
    setShowCreateForm(false);
    setFeedback("Template created!");
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleToggle = (id: string) => {
    setTemplates(templates.map((t) => (t.id === id ? { ...t, active: !t.active } : t)));
  };

  const handleDelete = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
    setFeedback("Template deleted");
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Image Templates"
        description="Configure branded graphic templates for auto-generated content images."
        actions={
          <Button size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-4 w-4" />
            New Template
          </Button>
        }
      />

      {feedback && (
        <div className="mb-4 rounded-md bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
          {feedback}
        </div>
      )}

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Create New Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Template name..."
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" onClick={handleCreate} disabled={!templateName}>
                Create
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Grid */}
      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
            <p className="mt-3 text-sm font-medium text-zinc-500">No image templates configured</p>
            <p className="mt-1 max-w-sm text-center text-xs text-zinc-400">
              Create image templates to automatically generate branded banner graphics for your content.
            </p>
            <Button size="sm" className="mt-4" onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4" />
              Create First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardContent className="p-0">
                {/* Preview Area */}
                <div className="flex h-40 items-center justify-center rounded-t-lg bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
                  <div className="text-center">
                    <Layout className="mx-auto h-8 w-8 text-zinc-400" />
                    <p className="mt-1 text-xs text-zinc-400">{template.width} x {template.height}</p>
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{template.name}</h3>
                    <Badge variant={template.active ? "success" : "secondary"}>
                      {template.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">{template.description}</p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleToggle(template.id)}
                    >
                      {template.active ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(template.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Template Info */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Layout className="h-4 w-4 text-zinc-400" />
              <p className="text-sm font-medium">Default Size</p>
            </div>
            <p className="mt-1 text-2xl font-bold">980 x 515</p>
            <p className="text-xs text-zinc-400">Optimized for blog banners and social media</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-zinc-400" />
              <p className="text-sm font-medium">Logo Source</p>
            </div>
            <p className="mt-1 text-sm font-semibold">Brandfetch API</p>
            <p className="text-xs text-zinc-400">Auto-fetches company logos from domain names</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-zinc-400" />
              <p className="text-sm font-medium">Color Extraction</p>
            </div>
            <p className="mt-1 text-sm font-semibold">Auto from Logo</p>
            <p className="text-xs text-zinc-400">Dominant brand colors extracted automatically</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
