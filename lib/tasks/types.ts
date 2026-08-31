import type { TaskPriority } from "@/lib/supabase/types/database";

export type { Task, TaskStatus, TaskPriority, TaskGroup, TimeBlock, TimeBlockStatus, FocusSession, FocusSessionMode } from "@/lib/supabase/types/database";

/** `contextType`/`contextId` nulos = tarefa pessoal solta (Meu Dia). Ver a tabela `tasks`
 *  (migration `20260814000000_navigation_simulation_financeiro.sql`) pro raciocínio completo.
 *  Campos de Task Intelligence (`clientId`/`estimatedMinutes`/`priority`/`groupId`) — todos
 *  opcionais, `undefined` significa "não mexe" nas Server Actions de update. */
export type TaskInput = {
  title: string;
  assigneeId: string | null;
  dueDate: string | null;
  dueTime?: string | null;
  contextType?: string | null;
  contextId?: string | null;
  clientId?: string | null;
  estimatedMinutes?: number | null;
  priority?: TaskPriority | null;
  groupId?: string | null;
};
