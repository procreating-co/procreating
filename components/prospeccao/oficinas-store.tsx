"use client";

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { INITIAL_OFICINAS } from "@/lib/prospeccao/mock-data";
import type { Oficina, OficinaInput } from "@/lib/prospeccao/types";

type Action =
  | { type: "add"; input: OficinaInput }
  | { type: "update"; id: string; input: OficinaInput }
  | { type: "remove"; id: string };

function reducer(state: Oficina[], action: Action): Oficina[] {
  const updatedAt = new Date().toISOString();
  switch (action.type) {
    case "add":
      return [{ ...action.input, id: `oficina-${crypto.randomUUID()}`, updatedAt }, ...state];
    case "update":
      return state.map((oficina) => (oficina.id === action.id ? { ...oficina, ...action.input, updatedAt } : oficina));
    case "remove":
      return state.filter((oficina) => oficina.id !== action.id);
    default:
      return state;
  }
}

type OficinasContextValue = {
  oficinas: Oficina[];
  addOficina: (input: OficinaInput) => void;
  updateOficina: (id: string, input: OficinaInput) => void;
  removeOficina: (id: string) => void;
};

const OficinasContext = createContext<OficinasContextValue | null>(null);

/**
 * Store mock em memória (some ao recarregar a página) — único lugar que muta a lista de
 * oficinas. Candidato natural a virar Supabase na Fase 2: as três ações mudam de despachar
 * pro reducer local pra chamar uma Server Action, sem alterar a assinatura de `useOficinas()`
 * pros componentes que consomem.
 */
export function OficinasProvider({ children }: { children: ReactNode }) {
  const [oficinas, dispatch] = useReducer(reducer, INITIAL_OFICINAS);

  const value = useMemo<OficinasContextValue>(
    () => ({
      oficinas,
      addOficina: (input) => dispatch({ type: "add", input }),
      updateOficina: (id, input) => dispatch({ type: "update", id, input }),
      removeOficina: (id) => dispatch({ type: "remove", id }),
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
