export type { Task, TaskStatus } from "@/lib/supabase/types/database";

/** `contextType`/`contextId` nulos = tarefa pessoal solta (Meu Dia). Ver a tabela `tasks`
 *  (migration `20260814000000_navigation_simulation_financeiro.sql`) pro raciocínio completo. */
export type TaskInput = {
  title: string;
  assigneeId: string | null;
  dueDate: string | null;
  contextType?: string | null;
  contextId?: string | null;
};
