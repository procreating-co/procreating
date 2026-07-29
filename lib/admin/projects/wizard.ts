/**
 * Os passos do assistente de criação de projeto — só dado, nenhuma lógica de estado/validação
 * ainda. Consumido hoje só pra render estático do indicador de passos em
 * `/admin/projetos/novo`; o wizard funcional (navegação entre passos, formulário, submit) é
 * trabalho de uma etapa futura. Ver o fluxo completo, com o que acontece em cada passo, em
 * `docs/project-creation.md`.
 */
export type WizardStepKey =
  | "client"
  | "project"
  | "template"
  | "capabilities"
  | "structure"
  | "assets"
  | "review"
  | "draft"
  | "preview"
  | "deploy"
  | "published";

export type WizardStep = {
  key: WizardStepKey;
  label: string;
};

export const PROJECT_WIZARD_STEPS: WizardStep[] = [
  { key: "client", label: "Cliente" },
  { key: "project", label: "Projeto" },
  { key: "template", label: "Template" },
  { key: "capabilities", label: "Capabilities" },
  { key: "structure", label: "Estrutura" },
  { key: "assets", label: "Assets" },
  { key: "review", label: "Review" },
  { key: "draft", label: "Draft" },
  { key: "preview", label: "Preview" },
  { key: "deploy", label: "Deploy" },
  { key: "published", label: "Publicado" },
];
