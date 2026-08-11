import type { Oficina } from "@/lib/prospeccao/types";
import { IMPORTED_OFICINAS } from "@/lib/prospeccao/oficinas-import-seed";

/**
 * Fonte única dos dados mock da Central de Prospecção — a UI lê `INITIAL_OFICINAS` só pra
 * semear o estado inicial (via `OficinasProvider`); nenhuma mutação acontece aqui. Quando a
 * Fase 2 trocar isso por Supabase, é este arquivo (e só ele) que muda de "array fixo" pra
 * "query real", sem tocar em nenhum componente.
 *
 * A carga inicial é a base real de 306 oficinas (`IMPORTED_OFICINAS`, ver
 * `oficinas-import-seed.ts`) — substituiu as 10 oficinas fictícias que existiam aqui antes só
 * pra demonstrar o Kanban em todas as etapas durante a Fase 1.
 */
export const INITIAL_OFICINAS: Oficina[] = IMPORTED_OFICINAS;

/** Mensagem padrão de abordagem — usada nas ações rápidas da tabela (fora do fluxo de Scripts). */
export function buildProspeccaoMessage(oficina: Pick<Oficina, "nome" | "cidade" | "responsavel">) {
  const saudacao = oficina.responsavel.trim() || `pessoal da ${oficina.nome}`;
  const local = oficina.cidade ? ` em ${oficina.cidade}` : "";
  return `Olá, ${saudacao}! Aqui é da Pascoal Bombas. Vi que a ${oficina.nome} atua${local} e queria apresentar nossa linha de bombas — parceria com condições especiais pra revenda e instalação. Podemos conversar 5 minutinhos?`;
}

export { buildWhatsAppUrl } from "@/lib/prospeccao/template";
