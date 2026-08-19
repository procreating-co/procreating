"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ClientCard } from "@/components/clientes/client-card";
import { cn } from "@/lib/utils";
import type { ClientCardData } from "@/lib/clientes/queries";

type Bucket = "recorrentes" | "projetos" | "inativos";
type SortKey = "value" | "recent" | "oldest" | "most_projects" | "name";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigos" },
  { value: "most_projects", label: "Mais projetos" },
  { value: "name", label: "Nome A–Z" },
];

/** Divide a lista completa nos 3 buckets — cliente entra em UM só, nunca duplicado entre eles:
 *  `recorrentes` (tem contrato `recorrente_ativo`, seja qual for o `client.status`) vence
 *  `projetos` (tem contrato pontual ATIVO — `pontual_em_andamento`, nunca `pontual_concluido`;
 *  achado real: a versão anterior contava os dois, o que trazia projeto já entregue/encerrado
 *  pra dentro do bloco "Projetos" — pedido explícito: só ativo. Quem é só recorrente E pontual
 *  continua contado em recorrentes, é a relação principal); `inativos` é `client.status ===
 *  "churn"`, independente de categoria (mesmo pedido — "aí devem aparecer os ex-clientes").
 *  Cliente sem contrato nenhum e sem `status='churn'` (ex.: lead/onboarding ainda sem contrato
 *  fechado) não entra em nenhum bucket — não é "cliente" operacional ainda.
 *
 *  Conceito de negócio (registrado — "guarde isso"): Projetos é a PORTA DE ENTRADA de um cliente
 *  pontual até virar recorrente (ex.: Elenita era projeto, virou recorrente; Pascoal está em
 *  negociação pra virar recorrente). O funil de estágios do projeto em si (Planejamento →
 *  Roteirização → Captação Realizada → Edição → Entregue → Em negociação → Fechado, "Fechado"
 *  convertendo o cliente pra recorrente) AINDA NÃO tem campo/UI própria — é a próxima extensão
 *  natural deste bucket, não implementada nesta rodada (fora de escopo do pedido "só ativos"). */
function bucketOf(row: ClientCardData): Bucket | null {
  if (row.categories.includes("recorrente_ativo")) return "recorrentes";
  if (row.categories.includes("pontual_em_andamento")) return "projetos";
  if (row.client.status === "churn") return "inativos";
  return null;
}

/**
 * Grid + busca + ordenação — a Central de Clientes em si. Clicar num card navega em tela cheia
 * pra `/clientes/[id]` (era um drawer lateral, trocado por pedido explícito — ver
 * `client-card.tsx`).
 *
 * Pedido explícito: os blocos do topo SÃO o filtro (Clientes Recorrentes/Projetos, clicáveis —
 * clicar mostra a lista daquele bucket abaixo) — substituem os chips Todos/Ativos/Em atenção que
 * existiam antes. "Inativos" (ex-clientes) não ganhou bloco próprio — menos comum, entrou como
 * mais uma opção no dropdown de ordenação (que aqui funciona também como seletor de bucket
 * quando o valor é "Inativos").
 *
 * "Quem paga mais" NÃO é uma opção do dropdown — pedido explícito ("isso deve ser implícito, ao
 * selecionar qualquer filtro aparece antes quem paga mais"): é a ordem SEMPRE aplicada por baixo
 * (`totalValue` — mensalidade dos recorrentes + valor total dos pontuais — decrescente), o ponto
 * de partida em qualquer bucket, nunca uma escolha manual. O dropdown continua deixando escolher
 * uma ordem DIFERENTE (Mais recentes/antigos/Mais projetos/Nome A–Z) quando fizer sentido — só
 * não expõe "voltar pra quem paga mais" como opção, porque é o padrão implícito, não precisa de
 * botão pra isso.
 */
export function ClientsGrid({ rows }: { rows: ClientCardData[] }) {
  const [query, setQuery] = useState("");
  const [bucket, setBucket] = useState<Bucket>("recorrentes");
  const [sort, setSort] = useState<SortKey>("value");

  const buckets = useMemo(() => {
    const grouped: Record<Bucket, ClientCardData[]> = { recorrentes: [], projetos: [], inativos: [] };
    for (const row of rows) {
      const key = bucketOf(row);
      if (key) grouped[key].push(row);
    }
    return grouped;
  }, [rows]);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = buckets[bucket].filter(
      (row) =>
        !normalized ||
        row.client.name.toLowerCase().includes(normalized) ||
        row.client.slug.toLowerCase().includes(normalized) ||
        (row.client.segment ?? "").toLowerCase().includes(normalized)
    );

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "value":
          return b.totalValue - a.totalValue;
        case "recent":
          return new Date(b.client.created_at).getTime() - new Date(a.client.created_at).getTime();
        case "oldest":
          return new Date(a.client.created_at).getTime() - new Date(b.client.created_at).getTime();
        case "most_projects":
          return b.contractCount - a.contractCount;
        case "name":
          return a.client.name.localeCompare(b.client.name, "pt-BR");
        default:
          return 0;
      }
    });
  }, [buckets, bucket, query, sort]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            setBucket("recorrentes");
            setSort("value");
          }}
          className={cn(
            "rounded-xl border p-4 text-left transition-colors",
            bucket === "recorrentes" ? "border-brand bg-brand/5" : "border-border/60 bg-card/40 hover:border-border"
          )}
        >
          <p className="font-mono text-2xl tabular-nums">{buckets.recorrentes.length}</p>
          <p className="text-sm text-muted-foreground">Clientes Recorrentes</p>
        </button>
        <button
          type="button"
          onClick={() => {
            setBucket("projetos");
            setSort("value");
          }}
          className={cn(
            "rounded-xl border p-4 text-left transition-colors",
            bucket === "projetos" ? "border-brand bg-brand/5" : "border-border/60 bg-card/40 hover:border-border"
          )}
        >
          <p className="font-mono text-2xl tabular-nums">{buckets.projetos.length}</p>
          <p className="text-sm text-muted-foreground">Projetos</p>
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar cliente, projeto ou segmento..." className="pl-9" />
        </div>
        <select
          value={bucket === "inativos" ? "inativos" : sort}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "inativos") {
              setBucket("inativos");
              setSort("value");
            } else {
              setBucket((current) => (current === "inativos" ? "recorrentes" : current));
              setSort(value as SortKey);
            }
          }}
          className="h-9 w-fit rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {/* Sem opção "Quem paga mais" — pedido explícito, é a ordem implícita padrão (`sort`
           *  nasce e volta pra `"value"` a cada troca de bloco), nunca uma escolha manual. Esta
           *  entrada só existe pro `<select>` ter ONDE mostrar esse estado sem cair errado em cima
           *  de "Mais recentes" — some assim que o usuário escolher qualquer opção real. */}
          {sort === "value" && bucket !== "inativos" && (
            <option value="value" disabled hidden>
              Quem paga mais primeiro
            </option>
          )}
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          <option value="inativos">Inativos ({buckets.inativos.length})</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card/20 px-6 py-16 text-center text-muted-foreground">
          {buckets[bucket].length === 0 ? "Nenhum cliente neste grupo ainda." : "Nenhum cliente encontrado."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((row) => (
            <ClientCard key={row.client.id} data={row} />
          ))}
        </div>
      )}
    </div>
  );
}
