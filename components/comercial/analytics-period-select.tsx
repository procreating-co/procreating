"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PERIOD_LABELS, PERIOD_PRESETS, type PeriodPreset } from "@/lib/comercial/period";

/** Master prompt §66 — presets consistentes de período pro analytics do Comercial. Mesmo padrão
 *  de `PeriodSelect` (query string, não estado local — o Server Component refaz a query com o
 *  período certo). `?period=` só existe na aba "Visão Geral"; trocar de aba não perde a escolha
 *  porque fica na URL, mas cada aba lê seus próprios params (mesmo espírito de `CrmFilters`). */
export function AnalyticsPeriodSelect({ current }: { current: PeriodPreset }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      aria-label="Selecionar período do analytics"
      className="h-8 rounded-md border border-input bg-transparent px-2.5 text-xs text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {PERIOD_PRESETS.map((preset) => (
        <option key={preset} value={preset}>
          {PERIOD_LABELS[preset]}
        </option>
      ))}
    </select>
  );
}
