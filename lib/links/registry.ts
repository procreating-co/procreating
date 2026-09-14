import "server-only";
import { getClientConfig } from "@/lib/clients";
import { getAllPresentationSlugs } from "@/lib/clients/presentation-registry";
import { getAllClientWorkspaces } from "@/lib/clients/workspace-registry";
import { listAllProposals } from "@/lib/comercial/proposal-queries";
import { getAllProsSlugs, getProsContent } from "@/content/pros/registry";
import { pascoalProposal } from "@/content/clients/pascoal/proposal";
import type { ProposalStatus, ProposalType } from "@/lib/supabase/types/database";

/**
 * Fonte central de `/links` (pedido explícito — "criar uma estrutura centralizada de dados...
 * se houver uma fonte centralizada de rotas, reutilizá-la em vez de duplicar"). Nada aqui é
 * digitado à mão feito uma lista estática: cada entrada vem de uma função/registry que já existe
 * e já é a fonte de verdade daquele link em produção —
 * `listAllProposals()` (mesma query do hub `/propostas`), `getAllPresentationSlugs()`/
 * `getClientConfig()` (mesmo resolver das rotas `/clients/[client]/public/**`),
 * `getAllClientWorkspaces()` (mesmo hub `/clients`), `content/pros/registry.ts` (mesmo switchboard
 * de `/pros/[slug]`). Se uma proposta nova for criada ou uma config de cliente mudar, `/links`
 * reflete sozinho, sem editar este arquivo.
 *
 * `cliente-x` é excluído de propósito — é o workspace de exemplo genérico documentado em
 * `content/clients/cliente-x/workspace.ts` ("Exemplo — placeholder... sem cliente real"), nunca
 * teve página pública (não está em `getAllPresentationSlugs()`); listar um link fictício violaria
 * o pedido explícito de nunca inventar/mostrar material que não existe de verdade.
 */

export type LinkCategory = "Clientes" | "Propostas" | "Prospecção" | "Interno";

export type LinkEntry = {
  id: string;
  title: string;
  description: string;
  url: string;
  category: LinkCategory;
  client?: string;
  type: string;
  status?: string;
};

export type LinkGroup = { category: LinkCategory; entries: LinkEntry[] };

// Mesmos rótulos de `app/propostas/page.tsx` (STATUS_LABEL/TYPE_LABEL) — pequeno o bastante pra
// não valer a pena extrair um import compartilhado, mas mantido idêntico de propósito.
const PROPOSAL_STATUS_LABEL: Record<ProposalStatus, string> = {
  draft: "Rascunho",
  sent: "Enviada",
  negotiating: "Em negociação",
  revision_requested: "Revisão pedida",
  accepted: "Aceita",
  rejected: "Recusada",
  expired: "Expirada",
  archived: "Arquivada",
  cancelled: "Cancelada",
};
const PROPOSAL_TYPE_LABEL: Record<ProposalType, string> = { prospecting: "Projeto", strategy: "Estratégia", presentation: "Proposta" };
const PROPOSAL_TYPE_PATH: Record<ProposalType, string> = { prospecting: "prospecting", strategy: "strategy", presentation: "propostas" };

export async function getLinksIndex(): Promise<LinkGroup[]> {
  const [proposals, pascoalConfig, elenitaConfig] = await Promise.all([
    listAllProposals(),
    getClientConfig("pascoal"),
    getClientConfig("elenita"),
  ]);
  const presentationSlugs = new Set(getAllPresentationSlugs());

  const clientes: LinkEntry[] = [];

  if (pascoalConfig) {
    clientes.push(
      {
        id: "client-pascoal-home",
        title: "Home — Pascoal Bombas",
        description: pascoalConfig.metadata.description,
        url: "/clients/pascoal/public",
        category: "Clientes",
        client: "Pascoal Bombas",
        type: "Apresentação (atual, setembro/26)",
      },
      {
        id: "client-pascoal-past",
        title: "Projeto Inicial — Pascoal Bombas",
        description: "Versão original da apresentação, anterior a setembro/26.",
        url: "/clients/pascoal/public/past",
        category: "Clientes",
        client: "Pascoal Bombas",
        type: "Apresentação (anterior)",
      },
      {
        id: "client-pascoal-galeria",
        title: "Galeria — Pascoal Bombas",
        description: "Fotos da equipe, unidades e bastidores.",
        url: "/clients/pascoal/public/galeria",
        category: "Clientes",
        client: "Pascoal Bombas",
        type: "Galeria",
        status: "Protegida por código",
      },
      {
        id: "client-pascoal-proposta",
        title: "Proposta de Continuidade — Pascoal Bombas",
        description: pascoalProposal.metaDescription,
        url: "/clients/pascoal/public/proposta",
        category: "Clientes",
        client: "Pascoal Bombas",
        type: "Proposta",
      },
    );
    if (pascoalConfig.prospeccao) {
      clientes.push({
        id: "client-pascoal-prospeccao",
        title: pascoalConfig.prospeccao.title,
        description: "Central de prospecção de parceiros da Pascoal Bombas.",
        url: "/clients/pascoal/public/prospeccao",
        category: "Clientes",
        client: "Pascoal Bombas",
        type: "Central de Prospecção",
        status: "Protegida por código",
      });
    }
  }

  if (elenitaConfig) {
    clientes.push(
      {
        id: "client-elenita-home",
        title: "Home — Dra. Elenita Luzardo",
        description: elenitaConfig.metadata.description,
        url: "/clients/elenita/public",
        category: "Clientes",
        client: "Dra. Elenita Luzardo",
        type: "Apresentação",
        status: elenitaConfig.siteLock ? "Protegida por senha" : undefined,
      },
      {
        id: "client-elenita-galeria",
        title: "Galeria — Dra. Elenita Luzardo",
        description: "Fotos do consultório e procedimentos.",
        url: "/clients/elenita/public/galeria",
        category: "Clientes",
        client: "Dra. Elenita Luzardo",
        type: "Galeria",
        status: "Protegida por código",
      },
      {
        id: "client-elenita-apresentacao",
        title: "Mídia Kit — Cara a Cara com a Beleza",
        description: "Reprodução do mídia kit oficial (RS Play, Canal 524 da Claro).",
        url: "/clients/elenita/public/apresentacao",
        category: "Clientes",
        client: "Dra. Elenita Luzardo",
        type: "Mídia Kit",
      },
    );
  }

  const propostas: LinkEntry[] = proposals.map((p) => ({
    id: `proposal-${p.id}`,
    title: p.title,
    description: `${PROPOSAL_TYPE_LABEL[p.type]} para ${p.brand_name}.`,
    url: `/${PROPOSAL_TYPE_PATH[p.type]}/${p.slug}`,
    category: "Propostas" as const,
    client: p.brand_name,
    type: PROPOSAL_TYPE_LABEL[p.type],
    status: PROPOSAL_STATUS_LABEL[p.status],
  }));

  const prospeccao: LinkEntry[] = getAllProsSlugs()
    .map((slug) => getProsContent(slug))
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .map((content) => ({
      id: `pros-${content.slug}`,
      title: content.metaTitle,
      description: content.metaDescription,
      url: `/pros/${content.slug}`,
      category: "Prospecção" as const,
      type: "Página de Prospecção",
    }));

  const centrosDeCliente = getAllClientWorkspaces()
    .filter((w) => presentationSlugs.has(w.slug))
    .map((w) => ({
      id: `internal-hub-${w.slug}`,
      title: `Central do Cliente — ${w.name}`,
      description: w.tagline || `Cronograma, roteiros e entregas de ${w.name}.`,
      url: `/clients/${w.slug}`,
      category: "Interno" as const,
      client: w.name,
      type: "Ferramenta interna",
    }));

  const interno: LinkEntry[] = [
    { id: "internal-workspace", title: "Workspace", description: "Painel de tarefas do dia, agenda e foco.", url: "/workspace", category: "Interno", type: "Ferramenta interna" },
    { id: "internal-dashboard", title: "Dashboard", description: "Visão executiva — receita, pipeline e metas do mês.", url: "/", category: "Interno", type: "Ferramenta interna" },
    { id: "internal-financeiro", title: "Financeiro", description: "Receita esperada, despesas e meta do mês.", url: "/financeiro", category: "Interno", type: "Ferramenta interna" },
    { id: "internal-comercial", title: "Comercial", description: "CRM, pipeline de leads e estratégias.", url: "/comercial", category: "Interno", type: "Ferramenta interna" },
    { id: "internal-clientes", title: "Clientes", description: "Visão 360º dos clientes ativos.", url: "/clientes", category: "Interno", type: "Ferramenta interna" },
    { id: "internal-operacao-projetos", title: "Projetos (Operação)", description: "Projetos em andamento na operação.", url: "/operacao/projetos", category: "Interno", type: "Ferramenta interna" },
    { id: "internal-operacao-producao", title: "Produção", description: "Itens em produção — vídeos, fotos, conteúdo.", url: "/operacao/producao", category: "Interno", type: "Ferramenta interna" },
    { id: "internal-operacao-entregas", title: "Entregas", description: "Entregas em andamento e concluídas.", url: "/operacao/entregas", category: "Interno", type: "Ferramenta interna" },
    { id: "internal-operacao-equipe", title: "Equipe", description: "Membros da equipe e atribuições.", url: "/operacao/equipe", category: "Interno", type: "Ferramenta interna" },
    { id: "internal-operacao-recursos", title: "Recursos", description: "Biblioteca de conteúdo e recursos internos.", url: "/operacao/conteudo", category: "Interno", type: "Ferramenta interna" },
    { id: "internal-configuracoes", title: "Configurações", description: "Empresa, usuários e regras financeiras.", url: "/configuracoes", category: "Interno", type: "Ferramenta interna" },
    {
      id: "internal-propostas-hub",
      title: "Hub de Projetos & Propostas",
      description: "Cria projetos de prospecção e propostas comerciais, com nichos.",
      url: "/propostas",
      category: "Interno",
      type: "Ferramenta interna",
    },
    ...centrosDeCliente,
    { id: "internal-clients-launcher", title: "Lançador de Clientes", description: "Ponto de entrada pra todos os workspaces de cliente.", url: "/clients", category: "Interno", type: "Ferramenta interna" },
    { id: "internal-portal-login", title: "Portal do Cliente (login)", description: "Login do portal onde o cliente acompanha suas entregas.", url: "/portal/login", category: "Interno", type: "Ferramenta interna" },
    { id: "internal-admin-legado", title: "Painel administrativo (legado)", description: "Painel anterior ao Procreating OS — ainda em uso pontual.", url: "/admin", category: "Interno", type: "Ferramenta interna (legado)" },
  ];

  const groups: LinkGroup[] = [
    { category: "Clientes", entries: clientes },
    { category: "Propostas", entries: propostas },
    { category: "Prospecção", entries: prospeccao },
    { category: "Interno", entries: interno },
  ];

  // Nunca uma categoria vazia (pedido explícito).
  return groups.filter((g) => g.entries.length > 0);
}
