import type { Metadata } from "next";
import { mockClients } from "@/lib/admin/clients/mock-data";
import { mockTemplates } from "@/lib/admin/templates/mock-data";
import { getMockProjectSlugs } from "@/lib/admin/projects/mock-data";
import { ProjectWizard } from "@/components/admin/projects/project-wizard";

export const metadata: Metadata = { title: "Novo Projeto | Painel Procreating" };

/**
 * Wizard funcional (11 passos, ver `docs/project-creation.md` seção 19): navegação + formulário
 * real em cada passo, validação, e ao final uma Server Action mock (`./actions.ts`) que grava o
 * projeto em memória — nada disso é Supabase/R2 de verdade ainda (FASES 3–4 do roadmap).
 */
export default function AdminNovoProjetoPage() {
  return (
    <main className="mx-auto max-w-[1000px] px-6 py-10 lg:px-10">
      <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Projetos</p>
      <h1 className="mt-1 mb-8 font-display text-3xl">Novo Projeto</h1>

      <ProjectWizard clients={mockClients} templates={mockTemplates} existingSlugs={getMockProjectSlugs()} />
    </main>
  );
}
