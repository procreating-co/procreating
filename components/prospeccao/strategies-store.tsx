"use client";

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { INITIAL_STRATEGIES } from "@/lib/prospeccao/strategies-data";
import type { Strategy, StrategyInput } from "@/lib/prospeccao/types";

type Action =
  | { type: "add"; input: StrategyInput }
  | { type: "update"; id: string; input: StrategyInput }
  | { type: "remove"; id: string };

function reducer(state: Strategy[], action: Action): Strategy[] {
  switch (action.type) {
    case "add":
      return [{ ...action.input, id: `strategy-${crypto.randomUUID()}` }, ...state];
    case "update":
      return state.map((strategy) => (strategy.id === action.id ? { ...strategy, ...action.input } : strategy));
    case "remove":
      return state.filter((strategy) => strategy.id !== action.id);
    default:
      return state;
  }
}

type StrategiesContextValue = {
  strategies: Strategy[];
  addStrategy: (input: StrategyInput) => void;
  updateStrategy: (id: string, input: StrategyInput) => void;
  removeStrategy: (id: string) => void;
};

const StrategiesContext = createContext<StrategiesContextValue | null>(null);

/** Biblioteca de estratégias — mesmo padrão de store mock em memória do `OficinasProvider`. */
export function StrategiesProvider({ children }: { children: ReactNode }) {
  const [strategies, dispatch] = useReducer(reducer, INITIAL_STRATEGIES);

  const value = useMemo<StrategiesContextValue>(
    () => ({
      strategies,
      addStrategy: (input) => dispatch({ type: "add", input }),
      updateStrategy: (id, input) => dispatch({ type: "update", id, input }),
      removeStrategy: (id) => dispatch({ type: "remove", id }),
    }),
    [strategies],
  );

  return <StrategiesContext.Provider value={value}>{children}</StrategiesContext.Provider>;
}

export function useStrategies() {
  const context = useContext(StrategiesContext);
  if (!context) throw new Error("useStrategies precisa estar dentro de StrategiesProvider");
  return context;
}
