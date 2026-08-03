"use client";

import { CommandInput } from "@/components/ui/command";

/** Fininho de propósito — só existe pra dar um nome próprio ao input dentro do Command (pedido explícito). */
export function SearchBar({ value, onValueChange }: { value: string; onValueChange: (value: string) => void }) {
  return <CommandInput value={value} onValueChange={onValueChange} placeholder="Search clients..." autoFocus />;
}
