import { ListChecks } from "lucide-react";

/** Lista "Próximos passos" do Overview — vem de `content/clients/<slug>/workspace.ts`. */
export function WorkspaceNextSteps({ steps, accent }: { steps: string[]; accent: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-5">
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        <ListChecks className="size-4" />
        <p className="font-mono text-xs uppercase tracking-wide">Próximos passos</p>
      </div>
      <ul className="flex flex-col gap-2.5">
        {steps.map((step) => (
          <li key={step} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="mt-1.5 size-1 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
}
