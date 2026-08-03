"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { slugify } from "@/lib/admin/format";

const TEMPLATE_OPTIONS = [
  { value: "presentation", label: "Presentation" },
  { value: "portfolio", label: "Portfolio" },
  { value: "landing-page", label: "Landing Page" },
] as const;

/**
 * Só UI — "Create" não grava nada (sem backend, pedido explícito). Quando isso virar real, o
 * candidato natural é uma Server Action no mesmo espírito da que já existe pro Wizard de
 * projeto (`app/admin/(protected)/projetos/novo/actions.ts`), só que pra Cliente.
 */
export function NewClientDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [template, setTemplate] = useState<string>(TEMPLATE_OPTIONS[0].value);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setName("");
      setSlug("");
      setSlugTouched(false);
      setTemplate(TEMPLATE_OPTIONS[0].value);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 px-4 py-3 text-sm text-muted-foreground transition-colors duration-150 hover:border-border hover:bg-foreground/[0.03] hover:text-foreground"
        >
          <Plus className="size-4" />
          New Client
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New client</DialogTitle>
          <DialogDescription>Create a new client project. You can fill in the details later.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-client-name">Client Name</Label>
            <Input
              id="new-client-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Acme Inc."
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-client-slug">Slug</Label>
            <Input
              id="new-client-slug"
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value));
                setSlugTouched(true);
              }}
              placeholder="acme-inc"
            />
            <p className="font-mono text-xs text-muted-foreground">/clients/{slug || "..."}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-client-template">Template</Label>
            <select
              id="new-client-template"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {TEMPLATE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => handleOpenChange(false)}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
