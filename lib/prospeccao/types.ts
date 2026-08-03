/** Status de uma oficina no funil de prospecção da Pascoal Bombas. */
export type OficinaStatus = "nao_iniciado" | "contato_realizado" | "respondeu" | "interessado" | "cliente" | "perdido";

export type Oficina = {
  id: string;
  nome: string;
  cidade: string;
  responsavel: string;
  whatsapp: string;
  observacoes: string;
  status: OficinaStatus;
  updatedAt: string;
};

/** Payload de criação/edição — tudo exceto o que o store controla (`id`, `updatedAt`). */
export type OficinaInput = Omit<Oficina, "id" | "updatedAt">;
