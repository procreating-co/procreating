"use client";

import { useEffect, useState } from "react";

function greetingForHour(hour: number) {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

/**
 * Saudação calculada no cliente (hora local de quem abre a página) — não há autenticação
 * ainda, então não personaliza por nome. Renderiza "Bem-vindo" até o primeiro mount pra
 * evitar mismatch de hidratação entre servidor e cliente.
 */
export function GreetingHeader() {
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()));
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-display text-3xl">{greeting ?? "Bem-vindo"}</h1>
      <p className="text-sm text-muted-foreground">Visão geral da operação</p>
    </div>
  );
}
