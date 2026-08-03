import type { LucideIcon } from "lucide-react";

/** Painel compartilhado pelas abas do Workspace ainda sem conteúdo real (Projetos/Conteúdos/Fotos/Vídeos/Entregas/Configurações). */
export function WorkspaceComingSoon({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 px-6 py-20 text-center">
      <Icon className="size-6 text-muted-foreground/60" />
      <p className="font-display text-lg text-foreground">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
