"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const PRESETS = [
  { value: "3", label: "3 meses" },
  { value: "6", label: "6 meses" },
  { value: "12", label: "12 meses" },
];

/**
 * Seletor de período pra gráficos de série temporal (ex.: "Cash Flow" / "Evolução") — controla
 * via query string (`?months=N`), não estado local: o Server Component da página lê
 * `searchParams` e refaz a query com a janela escolhida, então o gráfico sempre mostra dado
 * fresco, sem duplicar lógica de fetch no cliente. `paramKey` deixa mais de um seletor
 * coexistir na mesma página (não é o caso hoje, mas evita colisão se um dia for).
 */
export function PeriodSelect({ paramKey = "months", defaultValue = "6" }: { paramKey?: string; defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramKey) ?? defaultValue;

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramKey, value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    // BUG REAL corrigido (achado revisando o mesmo sintoma em month-kpi-navigator.tsx: "tela não
    // atualiza" ao trocar de período) — `push()` sozinho numa navegação só-de-search-param não
    // garante Server Component com dado novo; todo outro lugar do produto que precisa de dado
    // fresco depois de ação do cliente já pareia push+refresh, este era a única exceção.
    router.refresh();
  }

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      // BUG REAL corrigido (reportado: "não abre quando clico pra abrir 12/6 meses, abre
      // completo") — este `<select>` sempre viveu dentro do botão clicável de
      // `ChartExpandDialog` (o card inteiro abre o modal ampliado ao clicar). Sem
      // `stopPropagation`, o clique pra abrir o dropdown nativo borbulhava pro botão ancestral e
      // abria o modal no mesmo gesto, antes da escolha de período realmente se registrar.
      onClick={(e) => e.stopPropagation()}
      aria-label="Selecionar período"
      className="h-8 rounded-md border border-input bg-transparent px-2.5 text-xs text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {PRESETS.map((preset) => (
        <option key={preset.value} value={preset.value}>
          {preset.label}
        </option>
      ))}
    </select>
  );
}
