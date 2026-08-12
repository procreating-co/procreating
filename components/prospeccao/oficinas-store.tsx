"use client";

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { INITIAL_OFICINAS } from "@/lib/prospeccao/mock-data";
import { STAGE_LABEL } from "@/lib/prospeccao/stages";
import type { Oficina, OficinaInput, OficinaPatch, OficinaStage, ParsedOficinaRow } from "@/lib/prospeccao/types";

type Action =
  | { type: "add"; input: OficinaInput }
  | { type: "update"; id: string; input: OficinaInput }
  | { type: "patch"; id: string; patch: OficinaPatch }
  | { type: "moveStage"; id: string; status: OficinaStage }
  | { type: "remove"; id: string }
  | { type: "importMany"; rows: ParsedOficinaRow[] }
  | { type: "logEvent"; id: string; message: string; touchLastContact?: boolean };

function pushHistory(oficina: Oficina, message: string, at: string): Oficina {
  return { ...oficina, history: [...oficina.history, { id: `hist-${crypto.randomUUID()}`, message, at }] };
}

function reducer(state: Oficina[], action: Action): Oficina[] {
  const now = new Date().toISOString();
  switch (action.type) {
    case "add": {
      const oficina: Oficina = {
        ...action.input,
        bairro: "",
        endereco: "",
        segmento: "",
        whatsappLink: "",
        fonte: "Manual",
        id: `oficina-${crypto.randomUUID()}`,
        createdAt: now,
        updatedAt: now,
        lastContactAt: null,
        nextFollowUpAt: null,
        history: [{ id: `hist-${crypto.randomUUID()}`, message: "Lead criado", at: now }],
      };
      return [oficina, ...state];
    }

    case "update":
      return state.map((oficina) => {
        if (oficina.id !== action.id) return oficina;
        let next: Oficina = { ...oficina, ...action.input, updatedAt: now };
        next = pushHistory(next, "Dados da oficina atualizados", now);
        if (action.input.status !== oficina.status) {
          next = pushHistory(next, `Status alterado para ${STAGE_LABEL[action.input.status]}`, now);
        }
        return next;
      });

    case "patch":
      return state.map((oficina) => {
        if (oficina.id !== action.id) return oficina;
        let next: Oficina = { ...oficina, ...action.patch, updatedAt: now };

        const { status, ...rest } = action.patch;
        const otherFieldChanged = (Object.keys(rest) as (keyof typeof rest)[]).some((key) => rest[key] !== oficina[key]);
        if (otherFieldChanged) next = pushHistory(next, "Ficha do lead atualizada", now);
        if (status && status !== oficina.status) {
          next = pushHistory(next, `Status alterado para ${STAGE_LABEL[status]}`, now);
        }
        return next;
      });

    case "moveStage":
      return state.map((oficina) => {
        if (oficina.id !== action.id || oficina.status === action.status) return oficina;
        const next: Oficina = { ...oficina, status: action.status, updatedAt: now };
        return pushHistory(next, `Lead movido para ${STAGE_LABEL[action.status]}`, now);
      });

    case "logEvent":
      return state.map((oficina) => {
        if (oficina.id !== action.id) return oficina;
        const next: Oficina = { ...oficina, updatedAt: now, lastContactAt: action.touchLastContact ? now : oficina.lastContactAt };
        return pushHistory(next, action.message, now);
      });

    case "remove":
      return state.filter((oficina) => oficina.id !== action.id);

    case "importMany": {
      // Baixa aderência ao ICP não é motivo pra excluir — só não prioriza; todo mundo entra como "Contato".
      const toImport = action.rows.filter((row) => !row.invalid && !row.duplicate);
      const created: Oficina[] = toImport.map((row) => ({
        id: `oficina-${crypto.randomUUID()}`,
        nome: row.nome,
        cidade: row.cidade,
        bairro: row.bairro,
        endereco: row.endereco,
        segmento: row.segmento,
        responsavel: row.responsavel,
        whatsapp: row.whatsapp,
        whatsappLink: row.whatsappLink,
        instagram: row.instagram,
        aderenciaIcp: row.aderenciaIcp,
        fonte: row.fonte,
        observacoes: row.observacoes,
        status: "contato",
        createdAt: now,
        updatedAt: now,
        lastContactAt: null,
        nextFollowUpAt: null,
        history: [{ id: `hist-${crypto.randomUUID()}`, message: "Lead importado via CSV", at: now }],
      }));
      return [...created, ...state];
    }

    default:
      return state;
  }
}

type OficinasContextValue = {
  oficinas: Oficina[];
  addOficina: (input: OficinaInput) => void;
  updateOficina: (id: string, input: OficinaInput) => void;
  patchOficina: (id: string, patch: OficinaPatch) => void;
  moveOficinaStage: (id: string, status: OficinaStage) => void;
  removeOficina: (id: string) => void;
  importOficinas: (rows: ParsedOficinaRow[]) => void;
  logOficinaEvent: (id: string, message: string, touchLastContact?: boolean) => void;
};

const OficinasContext = createContext<OficinasContextValue | null>(null);

/**
 * Store mock em memória (some ao recarregar a página) — único lugar que muta a lista de
 * oficinas. Oficinas e Gestão (Kanban) leem do mesmo `useOficinas()`, então mover um card no
 * Kanban e editar na tabela de Oficinas alteram o MESMO registro — nunca duas cópias do lead.
 * Candidato natural a virar Supabase na Fase 2: as ações mudam de despachar pro reducer local
 * pra chamar uma Server Action, sem alterar a assinatura de `useOficinas()` pros consumidores.
 */
export function OficinasProvider({ children }: { children: ReactNode }) {
  const [oficinas, dispatch] = useReducer(reducer, INITIAL_OFICINAS);

  const value = useMemo<OficinasContextValue>(
    () => ({
      oficinas,
      addOficina: (input) => dispatch({ type: "add", input }),
      updateOficina: (id, input) => dispatch({ type: "update", id, input }),
      patchOficina: (id, patch) => dispatch({ type: "patch", id, patch }),
      moveOficinaStage: (id, status) => dispatch({ type: "moveStage", id, status }),
      removeOficina: (id) => dispatch({ type: "remove", id }),
      importOficinas: (rows) => dispatch({ type: "importMany", rows }),
      logOficinaEvent: (id, message, touchLastContact) => dispatch({ type: "logEvent", id, message, touchLastContact }),
    }),
    [oficinas],
  );

  return <OficinasContext.Provider value={value}>{children}</OficinasContext.Provider>;
}

export function useOficinas() {
  const context = useContext(OficinasContext);
  if (!context) throw new Error("useOficinas precisa estar dentro de OficinasProvider");
  return context;
}
