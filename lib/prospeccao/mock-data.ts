import type { Oficina, OficinaStatus } from "@/lib/prospeccao/types";

/**
 * Fonte única dos dados mock da Central de Prospecção — a UI lê `INITIAL_OFICINAS` só pra
 * semear o estado inicial (via `OficinasProvider`); nenhuma mutação acontece aqui. Quando a
 * Fase 2 trocar isso por Supabase, é este arquivo (e só ele) que muda de "array fixo" pra
 * "query real", sem tocar em nenhum componente.
 */
export const STATUS_OPTIONS: { value: OficinaStatus; label: string }[] = [
  { value: "nao_iniciado", label: "Não iniciado" },
  { value: "contato_realizado", label: "Contato realizado" },
  { value: "respondeu", label: "Respondeu" },
  { value: "interessado", label: "Interessado" },
  { value: "cliente", label: "Cliente" },
  { value: "perdido", label: "Perdido" },
];

export const STATUS_LABEL: Record<OficinaStatus, string> = Object.fromEntries(
  STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<OficinaStatus, string>;

export const STATUS_TONE_CLASSES: Record<OficinaStatus, string> = {
  nao_iniciado: "border-white/15 bg-white/[0.04] text-white/50",
  contato_realizado: "border-sky-500/25 bg-sky-500/10 text-sky-400",
  respondeu: "border-violet-500/25 bg-violet-500/10 text-violet-400",
  interessado: "border-[var(--client-accent)]/30 bg-[var(--client-accent)]/10 text-[var(--client-accent)]",
  cliente: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
  perdido: "border-red-500/25 bg-red-500/10 text-red-400",
};

export const INITIAL_OFICINAS: Oficina[] = [
  {
    id: "oficina-1",
    nome: "Auto Center Silva",
    cidade: "Caxias do Sul, RS",
    responsavel: "Marcos Silva",
    whatsapp: "5554999112233",
    observacoes: "Já revende bombas de outra marca, pode topar trocar de fornecedor.",
    status: "interessado",
    updatedAt: "2026-08-01T14:20:00-03:00",
  },
  {
    id: "oficina-2",
    nome: "Oficina do Zé",
    cidade: "Bento Gonçalves, RS",
    responsavel: "José Fagundes",
    whatsapp: "5554998877665",
    observacoes: "Atende bastante propriedade rural, bom encaixe pro produto.",
    status: "contato_realizado",
    updatedAt: "2026-07-29T09:00:00-03:00",
  },
  {
    id: "oficina-3",
    nome: "Bombas & Cia Peças",
    cidade: "Farroupilha, RS",
    responsavel: "Cíntia Bordin",
    whatsapp: "5554997654321",
    observacoes: "",
    status: "cliente",
    updatedAt: "2026-07-15T11:10:00-03:00",
  },
  {
    id: "oficina-4",
    nome: "Mecânica Rio Branco",
    cidade: "Flores da Cunha, RS",
    responsavel: "Diego Rossi",
    whatsapp: "5554996541234",
    observacoes: "Pediu retorno depois da colheita.",
    status: "respondeu",
    updatedAt: "2026-07-30T16:45:00-03:00",
  },
  {
    id: "oficina-5",
    nome: "Center Peças Garibaldi",
    cidade: "Garibaldi, RS",
    responsavel: "Anderson Luz",
    whatsapp: "5554995551122",
    observacoes: "",
    status: "nao_iniciado",
    updatedAt: "2026-06-20T08:30:00-03:00",
  },
  {
    id: "oficina-6",
    nome: "Irmãos Tonet Auto Peças",
    cidade: "Veranópolis, RS",
    responsavel: "Luciane Tonet",
    whatsapp: "5554994443322",
    observacoes: "Já trabalhou com a Pascoal antes, boa relação.",
    status: "interessado",
    updatedAt: "2026-08-02T10:05:00-03:00",
  },
  {
    id: "oficina-7",
    nome: "Oficina Nova Prata",
    cidade: "Nova Prata, RS",
    responsavel: "Everton Dal Bó",
    whatsapp: "5554993332211",
    observacoes: "Sem interesse no momento, focado em outro fornecedor.",
    status: "perdido",
    updatedAt: "2026-07-10T13:00:00-03:00",
  },
  {
    id: "oficina-8",
    nome: "Peças & Serviços Guaporé",
    cidade: "Guaporé, RS",
    responsavel: "Rafael Menegat",
    whatsapp: "5554992221100",
    observacoes: "",
    status: "nao_iniciado",
    updatedAt: "2026-06-05T09:15:00-03:00",
  },
  {
    id: "oficina-9",
    nome: "Auto Mecânica Antônio Prado",
    cidade: "Antônio Prado, RS",
    responsavel: "Sandra Piccoli",
    whatsapp: "5554991110099",
    observacoes: "Reunião marcada pra próxima semana.",
    status: "cliente",
    updatedAt: "2026-07-25T15:30:00-03:00",
  },
  {
    id: "oficina-10",
    nome: "Oficina Central Vacaria",
    cidade: "Vacaria, RS",
    responsavel: "Paulo Menezes",
    whatsapp: "5554990009988",
    observacoes: "Não atendeu as duas últimas ligações.",
    status: "contato_realizado",
    updatedAt: "2026-07-28T17:00:00-03:00",
  },
];

/** Link direto pro WhatsApp já com a mensagem preenchida — só dígitos no telefone. */
export function buildWhatsAppUrl(whatsapp: string, message: string) {
  const digits = whatsapp.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Mensagem padrão de abordagem — mesma copiada pro clipboard e usada no link do WhatsApp. */
export function buildProspeccaoMessage(oficina: Oficina) {
  return `Olá, ${oficina.responsavel}! Aqui é da Pascoal Bombas. Vi que a ${oficina.nome} atua em ${oficina.cidade} e queria apresentar nossa linha de bombas — parceria com condições especiais pra revenda e instalação. Podemos conversar 5 minutinhos?`;
}
