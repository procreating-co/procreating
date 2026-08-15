"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteTaskAction, updateTaskAction } from "@/lib/tasks/actions";
import type { Task, User } from "@/lib/supabase/types/database";

/** Edição precisa (campos explícitos) — diferente da criação por linha única (`parseQuickTask`),
 *  que é pra capturar rápido, não corrigir. Editar é o momento de "quero mudar exatamente isto",
 *  cabe melhor um formulário direto do que reescrever a frase inteira e torcer pro parser
 *  entender igual da primeira vez. */
export function TaskEditDialog({ task, teamMembers, open, onOpenChange }: { task: Task; teamMembers: User[]; open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState(task.due_date ?? "");
  const [dueTime, setDueTime] = useState(task.due_time?.slice(0, 5) ?? "");
  const [assigneeId, setAssigneeId] = useState(task.assignee_id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateTaskAction(task.id, {
        title,
        assigneeId: assigneeId || null,
        dueDate: dueDate || null,
        dueTime: dueTime || null,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteTaskAction(task.id);
      setConfirmingDelete(false);
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md gap-5">
          <DialogHeader>
            <DialogTitle>Editar tarefa</DialogTitle>
            <DialogDescription>Título, prazo e responsável.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="task-edit-title">Título</Label>
              <Input id="task-edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="task-edit-date">Prazo</Label>
                <Input id="task-edit-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="task-edit-time">Hora</Label>
                <Input id="task-edit-time" type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="task-edit-assignee">Responsável</Label>
              <select
                id="task-edit-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="h-9 rounded-md border border-input bg-input-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="">—</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <DialogFooter className="sm:justify-between">
              <Button type="button" variant="ghost" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}>
                <Trash2 className="size-3.5" />
                Excluir
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title="Excluir tarefa?"
        description={`"${task.title}" some pra sempre — não dá pra desfazer.`}
        isPending={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
