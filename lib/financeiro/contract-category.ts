import type { ContractCategory } from "@/lib/supabase/types/database";
import type { StatusTone } from "@/components/dashboard/status-dot";

/** Rótulo/cor únicos pra `contracts.category` — compartilhado entre o detalhe do cliente
 *  (badge por contrato) e o filtro de `/clientes` (badge por cliente, deduplicado). "Pipeline"
 *  não é um valor de `category` (nunca é um contrato, ver `database.ts`) — vive só no lado
 *  Comercial/Financeiro (`leads` em estágio "negociação"), por isso não aparece aqui. */
export const CONTRACT_CATEGORY_LABEL: Record<ContractCategory, string> = {
  recorrente_ativo: "Recorrente Ativo",
  pontual_concluido: "Pontual Concluído",
  pontual_em_andamento: "Pontual em Andamento",
  recorrente_churn: "Churn",
  recorrente_renovado: "Renovado",
};

export const CONTRACT_CATEGORY_TONE: Record<ContractCategory, StatusTone> = {
  recorrente_ativo: "active",
  pontual_em_andamento: "pending",
  pontual_concluido: "neutral",
  recorrente_churn: "danger",
  // Neutro, não "active" — é um contrato ENCERRADO (só o cliente continuou, num contrato novo);
  // usar o mesmo verde do recorrente ativo sugeriria que este contrato específico ainda vale.
  recorrente_renovado: "neutral",
};

export const CONTRACT_CATEGORIES: ContractCategory[] = ["recorrente_ativo", "pontual_em_andamento", "pontual_concluido", "recorrente_renovado", "recorrente_churn"];
