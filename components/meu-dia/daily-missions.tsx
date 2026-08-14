import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TodaySummary } from "@/lib/gamification/queries";

const MISSIONS: { key: keyof TodaySummary; label: string }[] = [
  { key: "taskCompletedToday", label: "Concluir 1 tarefa hoje" },
  { key: "focusLoggedToday", label: "Registrar uma sessão de foco hoje" },
  { key: "streakActive", label: "Manter a sequência ativa" },
];

/**
 * 3 checks computados ao vivo a partir do estado real do dia (`getTodaySummary`) — display
 * motivacional sobre dado que já existe, não um sistema de recompensa paralelo (não há "resgatar
 * prêmio" aqui, o XP já foi concedido pela ação real por trás de cada item).
 */
export function DailyMissions({ summary }: { summary: TodaySummary }) {
  return (
    <ul className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/60 bg-card">
      {MISSIONS.map((mission) => {
        const done = summary[mission.key];
        return (
          <li key={mission.key} className="flex items-center gap-3 px-4 py-3">
            {done ? <CheckCircle2 className="size-4 shrink-0 text-success" /> : <Circle className="size-4 shrink-0 text-muted-foreground/50" />}
            <span className={cn("text-sm", done && "text-muted-foreground line-through")}>{mission.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
