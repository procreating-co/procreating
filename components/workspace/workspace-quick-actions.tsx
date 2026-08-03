import Link from "next/link";
import { ExternalLink, FileText, UploadCloud } from "lucide-react";

/**
 * Ações rápidas do Overview — cada uma abre uma rota real do Workspace (não são botões mortos).
 * "Editar conteúdo" e "Adicionar material" levam pras abas Conteúdos/Fotos, que hoje mostram
 * `WorkspaceComingSoon` — honesto: a ação existe, o editor por trás ainda não.
 */
export function WorkspaceQuickActions({ slug }: { slug: string }) {
  const base = `/clients/${slug}`;

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`${base}/conteudos`}
        className="inline-flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm text-foreground transition-colors hover:bg-foreground/5"
      >
        <FileText className="size-4" />
        Editar conteúdo
      </Link>

      <Link
        href={`${base}/public`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm text-foreground transition-colors hover:bg-foreground/5"
      >
        <ExternalLink className="size-4" />
        Visualizar apresentação pública
      </Link>

      <Link
        href={`${base}/fotos`}
        className="inline-flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm text-foreground transition-colors hover:bg-foreground/5"
      >
        <UploadCloud className="size-4" />
        Adicionar material
      </Link>
    </div>
  );
}
