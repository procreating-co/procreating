"use client";

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { INITIAL_SCRIPTS } from "@/lib/prospeccao/scripts-data";
import type { Script, ScriptInput } from "@/lib/prospeccao/types";

type Action =
  | { type: "add"; input: ScriptInput }
  | { type: "update"; id: string; input: ScriptInput }
  | { type: "remove"; id: string };

function reducer(state: Script[], action: Action): Script[] {
  const updatedAt = new Date().toISOString();
  switch (action.type) {
    case "add":
      return [{ ...action.input, id: `script-${crypto.randomUUID()}`, updatedAt }, ...state];
    case "update":
      return state.map((script) => (script.id === action.id ? { ...script, ...action.input, updatedAt } : script));
    case "remove":
      return state.filter((script) => script.id !== action.id);
    default:
      return state;
  }
}

type ScriptsContextValue = {
  scripts: Script[];
  addScript: (input: ScriptInput) => void;
  updateScript: (id: string, input: ScriptInput) => void;
  removeScript: (id: string) => void;
};

const ScriptsContext = createContext<ScriptsContextValue | null>(null);

/** Biblioteca de scripts — mesmo padrão de store mock em memória do `OficinasProvider`. */
export function ScriptsProvider({ children }: { children: ReactNode }) {
  const [scripts, dispatch] = useReducer(reducer, INITIAL_SCRIPTS);

  const value = useMemo<ScriptsContextValue>(
    () => ({
      scripts,
      addScript: (input) => dispatch({ type: "add", input }),
      updateScript: (id, input) => dispatch({ type: "update", id, input }),
      removeScript: (id) => dispatch({ type: "remove", id }),
    }),
    [scripts],
  );

  return <ScriptsContext.Provider value={value}>{children}</ScriptsContext.Provider>;
}

export function useScripts() {
  const context = useContext(ScriptsContext);
  if (!context) throw new Error("useScripts precisa estar dentro de ScriptsProvider");
  return context;
}
