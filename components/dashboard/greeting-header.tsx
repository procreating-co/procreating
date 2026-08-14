"use client";

import { useEffect, useState } from "react";
import { useAdminUser } from "@/lib/admin/auth/auth-context";

function greetingForHour(hour: number) {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

/** Primeiro nome só — "Santiago Martins" vira "Santiago" no cumprimento. */
function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

/**
 * Saudação calculada no cliente (hora local de quem abre a página), personalizada com o nome
 * real desde a Fase 1 (Foundation) — antes disso não havia autenticação, então não personalizava
 * (comentário antigo). Renderiza "Bem-vindo" (sem nome) até o primeiro mount, só pra evitar
 * mismatch de hidratação entre servidor e cliente na hora do dia — o nome em si já vem pronto do
 * servidor via `useAdminUser()`. Sem subtítulo — "Visão geral da operação" não dizia nada; o
 * conteúdo real da página (seção "Atenção agora") começa logo abaixo.
 */
export function GreetingHeader() {
  const user = useAdminUser();
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()));
  }, []);

  return <h1 className="font-display text-3xl">{greeting ? `${greeting}, ${firstName(user.name)}.` : "Bem-vindo."}</h1>;
}
