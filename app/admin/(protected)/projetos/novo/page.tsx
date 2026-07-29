import type { Metadata } from "next";
import { WizardStepper } from "@/components/admin/projects/wizard-stepper";

export const metadata: Metadata = { title: "Novo Projeto | Painel Procreating" };

/**
 * Casca do assistente de criação — só o indicador de passos. O formulário funcional de cada
 * passo (Cliente, Projeto, Template, Produtos vendidos, Estrutura, Fotos, Vídeos, Revisão,
 * Criar Projeto) é trabalho de uma etapa futura; ver o documento de arquitetura da conversa
 * pro fluxo completo previsto.
 */
export default function AdminNovoProjetoPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
      <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Projetos</p>
      <h1 className="mt-1 mb-8 font-display text-3xl">Novo Projeto</h1>

      <WizardStepper />

      <div className="mt-10 flex min-h-[40vh] items-center justify-center rounded-lg border border-dashed border-border/60 px-6 py-16 text-center">
        <p className="max-w-sm text-sm text-muted-foreground">
          O formulário de cada passo do assistente ainda não foi implementado — esta página mostra só a estrutura dos 9 passos
          previstos.
        </p>
      </div>
    </main>
  );
}
