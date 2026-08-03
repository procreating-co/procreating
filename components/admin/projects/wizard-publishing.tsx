import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PublishingPhase = "publishing" | "done" | "failed";

const PUBLISH_SUBSTEPS = [
  { index: 7, label: "Gerando versão (Draft)" },
  { index: 8, label: "Gerando link de Preview" },
  { index: 9, label: "Publicando (Deploy)" },
  { index: 10, label: "Publicado" },
];

/**
 * Painel dos últimos 4 passos do Wizard (Draft/Preview/Deploy/Publicado, `docs/
 * project-creation.md` seção 19) — sequência automática, sem input do usuário. Etapa 4: só
 * interface, puramente uma animação client-side (delays artificiais, sem Server Action, sem
 * gravar nada) — a gravação mock volta na Etapa 7 (Publicação); deploy/analytics de verdade só
 * depois de Supabase/R2 conectados.
 */
export function WizardPublishing({
  phase,
  publishIndex,
  error,
  project,
  onRetry,
}: {
  phase: PublishingPhase;
  publishIndex: number;
  error: string | null;
  project: { id: string; name: string; slug: string } | null;
  onRetry: () => void;
}) {
  if (phase === "done" && project) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 p-3">
          <Check className="size-6 text-emerald-400" />
        </div>
        <h2 className="font-display text-2xl">Fim do fluxo</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Esta é a demonstração completa da interface do Wizard para &quot;{project.name}&quot; — <b>nada foi salvo</b>.
          A gravação mock chega na Etapa 7 (Publicação); <code>/clients/{project.slug}</code> não existe de verdade.
        </p>
        <div className="mt-2 flex gap-2">
          <Button asChild>
            <Link href="/admin/projetos/novo">Recomeçar</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/projetos">Voltar pra lista</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "failed") {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="max-w-sm text-sm text-destructive">{error}</p>
        <Button onClick={onRetry}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3 py-6">
      {PUBLISH_SUBSTEPS.map((step) => {
        const done = publishIndex > step.index;
        const current = publishIndex === step.index;
        return (
          <li key={step.index} className="flex items-center gap-3 text-sm">
            {done ? (
              <Check className="size-4 text-emerald-400" />
            ) : current ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <span className="size-4 rounded-full border border-border/60" />
            )}
            <span className={done || current ? "text-foreground" : "text-muted-foreground"}>{step.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
