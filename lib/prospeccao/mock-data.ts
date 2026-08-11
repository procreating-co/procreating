import type { Oficina } from "@/lib/prospeccao/types";

/**
 * Fonte única dos dados mock da Central de Prospecção — a UI lê `INITIAL_OFICINAS` só pra
 * semear o estado inicial (via `OficinasProvider`); nenhuma mutação acontece aqui. Quando a
 * Fase 2 trocar isso por Supabase, é este arquivo (e só ele) que muda de "array fixo" pra
 * "query real", sem tocar em nenhum componente.
 */
function seedHistory(message: string, at: string) {
  return [{ id: `hist-seed-${at}`, message, at }];
}

export const INITIAL_OFICINAS: Oficina[] = [
  {
    id: "oficina-1",
    nome: "Auto Center Silva",
    cidade: "Caxias do Sul, RS",
    responsavel: "Marcos Silva",
    whatsapp: "5554999112233",
    observacoes: "Já revende bombas de outra marca, pode topar trocar de fornecedor.",
    status: "oportunidade",
    createdAt: "2026-07-20T09:00:00-03:00",
    updatedAt: "2026-08-01T14:20:00-03:00",
    lastContactAt: "2026-08-01T14:20:00-03:00",
    nextFollowUpAt: "2026-08-12T10:00:00-03:00",
    history: [
      ...seedHistory("Lead criado", "2026-07-20T09:00:00-03:00"),
      { id: "hist-1-2", message: "Lead movido para Abordado", at: "2026-07-22T11:00:00-03:00" },
      { id: "hist-1-3", message: "Lead movido para Em conversa", at: "2026-07-26T15:30:00-03:00" },
      { id: "hist-1-4", message: "Lead movido para Oportunidade", at: "2026-08-01T14:20:00-03:00" },
    ],
  },
  {
    id: "oficina-2",
    nome: "Oficina do Zé",
    cidade: "Bento Gonçalves, RS",
    responsavel: "José Fagundes",
    whatsapp: "5554998877665",
    observacoes: "Atende bastante propriedade rural, bom encaixe pro produto.",
    status: "abordado",
    createdAt: "2026-07-25T09:00:00-03:00",
    updatedAt: "2026-07-29T09:00:00-03:00",
    lastContactAt: "2026-07-29T09:00:00-03:00",
    nextFollowUpAt: "2026-08-14T09:00:00-03:00",
    history: [
      ...seedHistory("Lead criado", "2026-07-25T09:00:00-03:00"),
      { id: "hist-2-2", message: "Lead movido para Abordado", at: "2026-07-29T09:00:00-03:00" },
    ],
  },
  {
    id: "oficina-3",
    nome: "Bombas & Cia Peças",
    cidade: "Farroupilha, RS",
    responsavel: "Cíntia Bordin",
    whatsapp: "5554997654321",
    observacoes: "",
    status: "parceiro",
    createdAt: "2026-06-10T09:00:00-03:00",
    updatedAt: "2026-07-15T11:10:00-03:00",
    lastContactAt: "2026-07-15T11:10:00-03:00",
    nextFollowUpAt: null,
    history: [
      ...seedHistory("Lead criado", "2026-06-10T09:00:00-03:00"),
      { id: "hist-3-2", message: "Lead movido para Oportunidade", at: "2026-07-01T10:00:00-03:00" },
      { id: "hist-3-3", message: "Lead movido para Parceiro", at: "2026-07-15T11:10:00-03:00" },
    ],
  },
  {
    id: "oficina-4",
    nome: "Mecânica Rio Branco",
    cidade: "Flores da Cunha, RS",
    responsavel: "Diego Rossi",
    whatsapp: "5554996541234",
    observacoes: "Pediu retorno depois da colheita.",
    status: "follow_up",
    createdAt: "2026-07-18T09:00:00-03:00",
    updatedAt: "2026-07-30T16:45:00-03:00",
    lastContactAt: "2026-07-30T16:45:00-03:00",
    nextFollowUpAt: "2026-08-20T09:00:00-03:00",
    history: [
      ...seedHistory("Lead criado", "2026-07-18T09:00:00-03:00"),
      { id: "hist-4-2", message: "Lead movido para Em conversa", at: "2026-07-28T10:00:00-03:00" },
      { id: "hist-4-3", message: "Lead movido para Follow-up", at: "2026-07-30T16:45:00-03:00" },
    ],
  },
  {
    id: "oficina-5",
    nome: "Center Peças Garibaldi",
    cidade: "Garibaldi, RS",
    responsavel: "Anderson Luz",
    whatsapp: "5554995551122",
    observacoes: "",
    status: "contato",
    createdAt: "2026-06-20T08:30:00-03:00",
    updatedAt: "2026-06-20T08:30:00-03:00",
    lastContactAt: null,
    nextFollowUpAt: null,
    history: seedHistory("Lead criado", "2026-06-20T08:30:00-03:00"),
  },
  {
    id: "oficina-6",
    nome: "Irmãos Tonet Auto Peças",
    cidade: "Veranópolis, RS",
    responsavel: "Luciane Tonet",
    whatsapp: "5554994443322",
    observacoes: "Já trabalhou com a Pascoal antes, boa relação.",
    status: "oportunidade",
    createdAt: "2026-07-10T09:00:00-03:00",
    updatedAt: "2026-08-02T10:05:00-03:00",
    lastContactAt: "2026-08-02T10:05:00-03:00",
    nextFollowUpAt: "2026-08-09T09:00:00-03:00",
    history: [
      ...seedHistory("Lead criado", "2026-07-10T09:00:00-03:00"),
      { id: "hist-6-2", message: "Lead movido para Em conversa", at: "2026-07-18T09:00:00-03:00" },
      { id: "hist-6-3", message: "Lead movido para Oportunidade", at: "2026-08-02T10:05:00-03:00" },
    ],
  },
  {
    id: "oficina-7",
    nome: "Oficina Nova Prata",
    cidade: "Nova Prata, RS",
    responsavel: "Everton Dal Bó",
    whatsapp: "5554993332211",
    observacoes: "Sem interesse no momento, focado em outro fornecedor.",
    status: "sem_interesse",
    createdAt: "2026-06-25T09:00:00-03:00",
    updatedAt: "2026-07-10T13:00:00-03:00",
    lastContactAt: "2026-07-10T13:00:00-03:00",
    nextFollowUpAt: null,
    history: [
      ...seedHistory("Lead criado", "2026-06-25T09:00:00-03:00"),
      { id: "hist-7-2", message: "Lead movido para Sem interesse", at: "2026-07-10T13:00:00-03:00" },
    ],
  },
  {
    id: "oficina-8",
    nome: "Peças & Serviços Guaporé",
    cidade: "Guaporé, RS",
    responsavel: "",
    whatsapp: "5554992221100",
    observacoes: "",
    status: "contato",
    createdAt: "2026-06-05T09:15:00-03:00",
    updatedAt: "2026-06-05T09:15:00-03:00",
    lastContactAt: null,
    nextFollowUpAt: null,
    history: seedHistory("Lead criado", "2026-06-05T09:15:00-03:00"),
  },
  {
    id: "oficina-9",
    nome: "Auto Mecânica Antônio Prado",
    cidade: "Antônio Prado, RS",
    responsavel: "Sandra Piccoli",
    whatsapp: "5554991110099",
    observacoes: "Reunião marcada pra próxima semana.",
    status: "parceiro",
    createdAt: "2026-06-15T09:00:00-03:00",
    updatedAt: "2026-07-25T15:30:00-03:00",
    lastContactAt: "2026-07-25T15:30:00-03:00",
    nextFollowUpAt: null,
    history: [
      ...seedHistory("Lead criado", "2026-06-15T09:00:00-03:00"),
      { id: "hist-9-2", message: "Lead movido para Parceiro", at: "2026-07-25T15:30:00-03:00" },
    ],
  },
  {
    id: "oficina-10",
    nome: "Oficina Central Vacaria",
    cidade: "Vacaria, RS",
    responsavel: "Paulo Menezes",
    whatsapp: "5554990009988",
    observacoes: "Não atendeu as duas últimas ligações.",
    status: "abordado",
    createdAt: "2026-07-15T09:00:00-03:00",
    updatedAt: "2026-07-28T17:00:00-03:00",
    lastContactAt: "2026-07-28T17:00:00-03:00",
    nextFollowUpAt: "2026-08-13T09:00:00-03:00",
    history: [
      ...seedHistory("Lead criado", "2026-07-15T09:00:00-03:00"),
      { id: "hist-10-2", message: "Lead movido para Abordado", at: "2026-07-28T17:00:00-03:00" },
    ],
  },
];

/** Mensagem padrão de abordagem — usada nas ações rápidas da tabela (fora do fluxo de Scripts). */
export function buildProspeccaoMessage(oficina: Pick<Oficina, "nome" | "cidade" | "responsavel">) {
  const saudacao = oficina.responsavel.trim() || `pessoal da ${oficina.nome}`;
  return `Olá, ${saudacao}! Aqui é da Pascoal Bombas. Vi que a ${oficina.nome} atua em ${oficina.cidade} e queria apresentar nossa linha de bombas — parceria com condições especiais pra revenda e instalação. Podemos conversar 5 minutinhos?`;
}

export { buildWhatsAppUrl } from "@/lib/prospeccao/template";
