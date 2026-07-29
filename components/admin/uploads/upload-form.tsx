"use client";

import { useActionState, useRef } from "react";
import { UploadCloud } from "lucide-react";
import { uploadFileAction, type UploadFormState } from "@/app/admin/(protected)/uploads/actions";
import { STORAGE_CATEGORIES } from "@/lib/storage/path";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { fileInputClass } from "@/components/admin/projects/wizard-steps/shared";

const CATEGORY_LABELS: Record<string, string> = {
  videos: "Vídeos",
  photos: "Fotos",
  logo: "Logo",
  "og-image": "OG Image",
};

const initialState: UploadFormState = undefined;

export function UploadForm({ projectSlug }: { projectSlug: string }) {
  const [state, formAction, isPending] = useActionState(uploadFileAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formAction(formData);
        formRef.current?.reset();
      }}
      className="flex flex-wrap items-end gap-4 rounded-lg border border-border/60 bg-card/40 p-5"
    >
      <input type="hidden" name="projectSlug" value={projectSlug} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="category">Categoria</Label>
        <select
          id="category"
          name="category"
          defaultValue={STORAGE_CATEGORIES[0]}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {STORAGE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category] ?? category}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="file">Arquivo</Label>
        <input id="file" name="file" type="file" required className={fileInputClass} />
      </div>

      <Button type="submit" disabled={isPending} className="gap-2">
        <UploadCloud className="size-4" />
        {isPending ? "Enviando..." : "Enviar"}
      </Button>

      {state && "error" in state && (
        <p role="alert" className="w-full text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state && "success" in state && <p className="w-full text-sm text-emerald-400">{state.success}</p>}
    </form>
  );
}
