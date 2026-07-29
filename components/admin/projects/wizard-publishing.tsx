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
 * project-creation.md` seção 19) — sequência automática, sem input do usuário. Nesta fase é
 * simulado (delays artificiais + a Server Action `createProjectAction`); quando Supabase/R2/
 * deploy real existirem, os mesmos 4 passos passam a refletir progresso de verdade.
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
        <h2 className="font-display text-2xl">Projeto publicado</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          &quot;{project.name}&quot; foi criado com sucesso. Como o Supabase e o Cloudflare R2 ainda não estão conectados
          (FASES 3–4 do roadmap), isto é uma simulação em memória — <code>/p/{project.slug}</code> ainda não existe de
          verdade.
        </p>
        <div className="mt-2 flex gap-2">
          <Button asChild>
            <Link href={`/admin/projetos/${project.id}`}>Ver projeto</Link>
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
