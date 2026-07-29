/**
 * Os passos do assistente de criação de projeto — só dado, nenhuma lógica de estado/validação
 * ainda. Consumido hoje só pra render estático do indicador de passos em
 * `/admin/projetos/novo`; o wizard funcional (navegação entre passos, formulário, submit) é
 * trabalho de uma etapa futura.
 */
export type WizardStepKey =
  | "client"
  | "project"
  | "template"
  | "services"
  | "structure"
  | "photos"
  | "videos"
  | "review"
  | "create";

export type WizardStep = {
  key: WizardStepKey;
  label: string;
};

export const PROJECT_WIZARD_STEPS: WizardStep[] = [
  { key: "client", label: "Cliente" },
  { key: "project", label: "Projeto" },
  { key: "template", label: "Template" },
  { key: "services", label: "Produtos vendidos" },
  { key: "structure", label: "Estrutura" },
  { key: "photos", label: "Fotos" },
  { key: "videos", label: "Vídeos" },
  { key: "review", label: "Revisão" },
  { key: "create", label: "Criar Projeto" },
];
