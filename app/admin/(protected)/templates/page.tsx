import type { Metadata } from "next";
import { LayoutTemplate } from "lucide-react";
import { Card } from "@/components/ui/card";
import { mockTemplates } from "@/lib/admin/templates/mock-data";

export const metadata: Metadata = { title: "Templates | Painel Procreating" };

export default function AdminTemplatesPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Moldes de projeto</p>
        <h1 className="mt-1 font-display text-3xl">Templates</h1>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockTemplates.map((template) => (
          <Card key={template.id} className="gap-3 border-border/60 bg-card/40 p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-md bg-foreground/10">
                <LayoutTemplate className="size-4" />
              </div>
              <h3 className="font-display text-lg">{template.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{template.description}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {template.blocks.map((block) => (
                <span key={block} className="rounded-full border border-border/60 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {block}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </section>
    </main>
  );
}
