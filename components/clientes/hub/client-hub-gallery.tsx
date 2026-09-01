"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { optimizedGallerySrc } from "@/lib/gallery";
import type { RecentGalleryFile } from "@/lib/gallery-server";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

/**
 * Galeria do Client Hub — mesma fonte de dados da galeria pública (`getGalleryFolders`/
 * `getRecentGalleryFiles`, `public/gallery/<slug>/**`), só numa experiência interna sem tela de
 * senha (o staff já está autenticado pelo ERP). Filtro por pasta (categoria) client-side — a
 * lista inteira já vem do server, não precisa de nova query por clique.
 */
export function ClientHubGallery({ files, folderLabels }: { files: RecentGalleryFile[]; folderLabels: string[] }) {
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  const visible = useMemo(() => (activeFolder ? files.filter((file) => file.folderLabel === activeFolder) : files), [files, activeFolder]);

  if (files.length === 0) {
    return <EmptyState icon={ImageIcon} title="Nenhum material na galeria ainda." description="Solte arquivos em public/gallery/<cliente>/<pasta>/ para eles aparecerem aqui." fullBleed={false} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveFolder(null)}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${activeFolder === null ? "border-brand bg-brand/10 text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"}`}
        >
          Tudo
        </button>
        {folderLabels.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setActiveFolder(label)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${activeFolder === label ? "border-brand bg-brand/10 text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((file) => (
          <a
            key={file.src}
            href={file.src}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-1.5 overflow-hidden rounded-xl border border-border/60 bg-card/40 transition-colors hover:border-brand/40"
          >
            <div className="relative aspect-square overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element -- mesmo padrão de gallery-experience.tsx */}
              <img src={optimizedGallerySrc(file.src, 320)} alt={file.fileName} className="size-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
              <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <ArrowUpRight className="size-3.5" />
              </span>
            </div>
            <div className="flex flex-col gap-0.5 px-2.5 pb-2.5">
              <span className="truncate text-xs font-medium">{file.fileName}</span>
              <span className="text-[11px] text-muted-foreground">
                {file.folderLabel} · {dateFormatter.format(new Date(file.modifiedAt))}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
