import type { StatusTone } from "@/components/dashboard/status-dot";

export type DemoClient = {
  key: string;
  name: string;
};

export type DemoTeamMember = {
  key: string;
  name: string;
  role: string;
};

export type DemoProject = {
  key: string;
  name: string;
  clientKey: string;
  teamKey: string;
  status: string;
  tone: StatusTone;
  /** Prazo mockado — não há planejamento real ainda, só ilustra o campo na tela de detalhe. */
  deadline: string;
};

export type DemoProductionItem = {
  key: string;
  title: string;
  projectKey: string;
  status: string;
  tone: StatusTone;
};

export type DemoDelivery = {
  key: string;
  title: string;
  projectKey: string;
  status: string;
  tone: StatusTone;
};

/**
 * Fonte única dos dados demo do ERP — Projetos, Produção e Entregas leem daqui em vez de
 * manter arrays próprios, para que o relacionamento entre módulos (via `clientKey`,
 * `teamKey`, `projectKey`) seja real dentro do mock, não só texto solto repetido em cada
 * página. Tudo aqui é dado de demonstração, sem backend.
 */
export const DEMO_CLIENTS: DemoClient[] = [
  { key: "pascoal", name: "Pascoal Bombas" },
  { key: "elenita", name: "Dra. Elenita" },
];

export const DEMO_TEAM: DemoTeamMember[] = [
  { key: "cristiano", name: "Cristiano", role: "Editor" },
  { key: "eduardo", name: "Eduardo", role: "Gestor Operacional" },
  { key: "santiago", name: "Santiago", role: "CEO" },
];

export const DEMO_PROJECTS: DemoProject[] = [
  {
    key: "pascoal",
    name: "Pascoal Bombas",
    clientKey: "pascoal",
    teamKey: "cristiano",
    status: "Em produção",
    tone: "active",
    deadline: "20 de agosto",
  },
  {
    key: "elenita",
    name: "Dra. Elenita",
    clientKey: "elenita",
    teamKey: "eduardo",
    status: "Planejamento",
    tone: "pending",
    deadline: "10 de setembro",
  },
];

export const DEMO_PRODUCTIONS: DemoProductionItem[] = [
  { key: "video-institucional-pascoal", title: "Vídeo institucional Pascoal", projectKey: "pascoal", status: "Edição", tone: "active" },
  { key: "making-of-pascoal", title: "Making of Pascoal Bombas", projectKey: "pascoal", status: "Roteiro", tone: "pending" },
  { key: "conteudo-posicionamentopro", title: "Conteúdo PosicionamentoPRO", projectKey: "elenita", status: "Roteiro", tone: "pending" },
];

export const DEMO_DELIVERIES: DemoDelivery[] = [
  { key: "landing-page-pascoal", title: "Landing Page Pascoal", projectKey: "pascoal", status: "Aguardando aprovação", tone: "pending" },
  { key: "apresentacao-elenita", title: "Apresentação Dra. Elenita", projectKey: "elenita", status: "Em revisão", tone: "active" },
  { key: "identidade-visual-elenita", title: "Identidade visual Dra. Elenita", projectKey: "elenita", status: "Aguardando aprovação", tone: "pending" },
];

export function getClient(clientKey: string) {
  return DEMO_CLIENTS.find((client) => client.key === clientKey);
}

export function getTeamMember(teamKey: string) {
  return DEMO_TEAM.find((member) => member.key === teamKey);
}

export function getProject(projectKey: string) {
  return DEMO_PROJECTS.find((project) => project.key === projectKey);
}
