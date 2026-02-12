import { Image as ImageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

export default function ImageTemplatesPage() {
  return (
    <div>
      <PageHeader
        title="Image Templates"
        description="Configure branded graphic templates for auto-generated content images."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Template
          </Button>
        }
      />

      {/* Template Grid */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ImageIcon className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
          <p className="mt-3 text-sm font-medium text-zinc-500">
            No image templates configured
          </p>
          <p className="mt-1 max-w-sm text-center text-xs text-zinc-400">
            Create image templates to automatically generate branded banner
            graphics for your content. Templates define the layout, logo
            placement, and color scheme.
          </p>
          <Button size="sm" className="mt-4">
            <Plus className="h-4 w-4" />
            Create First Template
          </Button>
        </CardContent>
      </Card>

      {/* Template Info */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium">Default Size</p>
            <p className="text-2xl font-bold">980 x 515</p>
            <p className="text-xs text-zinc-400">
              Optimized for blog banners and social media
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium">Logo Source</p>
            <p className="text-sm font-semibold">Brandfetch API</p>
            <p className="text-xs text-zinc-400">
              Auto-fetches company logos from domain names
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium">Color Extraction</p>
            <p className="text-sm font-semibold">Auto from Logo</p>
            <p className="text-xs text-zinc-400">
              Dominant brand colors extracted automatically
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
