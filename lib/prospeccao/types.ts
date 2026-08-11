/**
 * Etapas do funil comercial da Central de Prospecção. Único enum de status — Oficinas e
 * Gestão (Kanban) leem e escrevem o mesmo campo `Oficina.status`, nunca duas fontes de verdade.
 */
export type OficinaStage =
  | "contato"
  | "abordado"
  | "em_conversa"
  | "follow_up"
  | "oportunidade"
  | "parceiro"
  | "sem_interesse"
  | "perdido";

/** Um evento no histórico do lead — trilha simples de auditoria, não um sistema de logs. */
export type HistoryEntry = {
  id: string;
  message: string;
  at: string;
};

/**
 * Aderência ao ICP (perfil de cliente ideal da Pascoal Bombas — oficina que REPARA veículos,
 * não revenda/estacionamento). "nao_classificado" é só o fallback pra registros criados
 * manualmente antes de alguém classificar — a carga importada da planilha vem 100% classificada.
 */
export type AderenciaIcp = "alta" | "media" | "baixa" | "nao_classificado";

/** Origem do lead — de onde ele entrou na base. */
export type OficinaFonte = "Receita Federal (CNPJ)" | "Google Maps" | "Manual";

export type Oficina = {
  id: string;
  nome: string;
  cidade: string;
  bairro: string;
  endereco: string;
  /** Ramo de atividade (ex.: "Serviços de manutenção e reparação mecânica..."). Texto livre. */
  segmento: string;
  responsavel: string;
  /** Só dígitos ou formatado — normalizado na hora de montar o link do WhatsApp. */
  whatsapp: string;
  /** Link wa.me pronto quando o número já foi validado como celular/WhatsApp; "" quando não. */
  whatsappLink: string;
  aderenciaIcp: AderenciaIcp;
  fonte: OficinaFonte;
  observacoes: string;
  status: OficinaStage;
  createdAt: string;
  updatedAt: string;
  lastContactAt: string | null;
  nextFollowUpAt: string | null;
  history: HistoryEntry[];
};

/** Payload do formulário básico de criação/edição — o resto (id, datas, histórico) o store controla. */
export type OficinaInput = {
  nome: string;
  cidade: string;
  responsavel: string;
  whatsapp: string;
  observacoes: string;
  status: OficinaStage;
  aderenciaIcp: AderenciaIcp;
};

/** Payload do drawer de detalhe — edição parcial de campos operacionais do CRM. */
export type OficinaPatch = Partial<{
  responsavel: string;
  whatsapp: string;
  observacoes: string;
  status: OficinaStage;
  nextFollowUpAt: string | null;
  aderenciaIcp: AderenciaIcp;
}>;

// ---------------------------------------------------------------------------------------------
// Scripts
// ---------------------------------------------------------------------------------------------

export type ScriptCategory = "primeiro_contato" | "follow_up" | "reativacao" | "parceiros" | "oportunidades" | "outros";

export type Script = {
  id: string;
  title: string;
  category: ScriptCategory;
  objective: string;
  channel: "whatsapp";
  body: string;
  updatedAt: string;
};

export type ScriptInput = Omit<Script, "id" | "updatedAt">;

// ---------------------------------------------------------------------------------------------
// Estratégias
// ---------------------------------------------------------------------------------------------

export type StrategyCategory = "abordagem" | "follow_up" | "reativacao" | "comerciais" | "parcerias" | "objecoes";

export type Strategy = {
  id: string;
  category: StrategyCategory;
  title: string;
  objective: string;
  context: string;
  steps: string[];
  relatedScriptIds: string[];
  notes: string;
};

export type StrategyInput = Omit<Strategy, "id">;

// ---------------------------------------------------------------------------------------------
// Importação CSV
// ---------------------------------------------------------------------------------------------

export type ParsedOficinaRow = {
  nome: string;
  whatsapp: string;
  responsavel: string;
  /** Campos opcionais — presentes quando o CSV traz as colunas correspondentes (ex.: exportação da Central). */
  cidade: string;
  bairro: string;
  endereco: string;
  segmento: string;
  whatsappLink: string;
  aderenciaIcp: AderenciaIcp;
  fonte: OficinaFonte;
  observacoes: string;
  /** Já existe uma oficina com esse WhatsApp (ou nome, na ausência de WhatsApp) na base atual. */
  duplicate: boolean;
  /** Linha sem nome — não pode ser importada. */
  invalid: boolean;
};
