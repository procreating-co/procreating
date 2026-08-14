import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Estado vazio de página inteira — Fase B (redesign): antes era só ícone cinza + título, sem
 * explicar o que fazer a seguir. Agora carrega o selo com wash de marca (mesmo tratamento visual
 * de "isto é importante", não um cinza genérico) e, quando fizer sentido, uma ação primária
 * embutida — reduz o "crie o quê, onde?" de quem chega numa tela zerada.
 *
 * `action` recebe um elemento já renderizado (mesmo padrão de `SectionCard`/`ModuleCard`), não
 * um `{label, href}` — muita tela deste produto cria via Dialog (Nova estratégia, Novo lead),
 * não navegação; deixar o caller montar o botão (Link ou trigger de Dialog) evita este
 * componente ter que saber qual dos dois casos está lidando.
 *
 * Pra estados vazios pequenos (uma coluna de Kanban, uma seção dentro de uma tela maior), use
 * `EmptyInline` (`components/dashboard/empty-inline.tsx`) em vez deste.
 *
 * Não inclui `<main>` — é um bloco pra encaixar dentro do `<main>` que a própria página já
 * declara (às vezes é o único conteúdo da página, às vezes divide espaço com outra coisa acima).
 * `fullBleed` (default `true`) aplica o respiro vertical de "isto é o conteúdo inteiro da tela";
 * passe `false` quando for só uma seção dentro de uma página que já tem outra coisa acima.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  fullBleed = true,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  fullBleed?: boolean;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-4 text-center", fullBleed ? "min-h-[60vh] justify-center py-24" : "py-16")}>
      <div className="flex size-12 items-center justify-center rounded-xl border border-brand-subtle-border bg-brand-subtle text-brand">
        <Icon className="size-6" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl">{title}</h1>
        {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
