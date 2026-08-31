"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { startFocusSessionAction } from "@/lib/tasks/actions";
import { cn } from "@/lib/utils";

type Preset = { label: string; minutes: number | null };
const POMODORO_PRESETS: Preset[] = [
  { label: "25 / 5", minutes: 25 },
  { label: "50 / 10", minutes: 50 },
];

/** Disparado a partir de um item da lista (§15/§16) — "Iniciar timer" pula direto (sem duração
 *  planejada, conta pra cima); "Iniciar Pomodoro" abre este diálogo pra escolher a duração antes.
 *  Minimalista de propósito (§3 do pedido — nada de formulário grande). */
export function StartFocusDialog({
  taskId,
  taskTitle,
  mode,
  open,
  onOpenChange,
  onStarted,
}: {
  taskId: string;
  taskTitle: string;
  mode: "free" | "pomodoro";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStarted: () => void;
}) {
  const router = useRouter();
  const [minutes, setMinutes] = useState<number | null>(25);
  const [customMinutes, setCustomMinutes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function start(plannedMinutes: number | null) {
    setError(null);
    startTransition(async () => {
      const result = await startFocusSessionAction(taskId, mode, plannedMinutes);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      onStarted();
      router.refresh();
    });
  }

  // Timer livre não precisa de diálogo — mas o componente recebe `open` de qualquer forma (mesmo
  // controlador do pai) pra iniciar assim que aberto, sem duplicar a lógica de erro. `useEffect`
  // com guarda de `open` — sem isso, chamar `start()` direto no corpo do componente disparava a
  // Server Action de novo a cada re-render enquanto `open` continuasse `true` (inclusive durante
  // o próprio `isPending`), não só uma vez.
  useEffect(() => {
    if (mode === "free" && open) start(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, open]);

  if (mode === "free") {
    return error ? (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Não foi possível iniciar</DialogTitle>
            <DialogDescription>{error}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ) : null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Iniciar Pomodoro</DialogTitle>
          <DialogDescription>{taskTitle}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            {POMODORO_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setMinutes(preset.minutes);
                  setCustomMinutes("");
                }}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2 text-sm transition-colors",
                  minutes === preset.minutes && !customMinutes ? "border-brand bg-brand/10 text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground",
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="custom-pomodoro">Ou personalizado (minutos)</Label>
            <Input
              id="custom-pomodoro"
              type="number"
              min={1}
              value={customMinutes}
              onChange={(e) => {
                setCustomMinutes(e.target.value);
                setMinutes(null);
              }}
              placeholder="ex.: 45"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" disabled={isPending || (!minutes && !customMinutes)} onClick={() => start(minutes ?? Number(customMinutes))}>
            {isPending ? "Iniciando..." : "Iniciar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
