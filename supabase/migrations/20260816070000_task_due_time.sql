-- Continuação do master prompt ("evolução profunda"), §49/§50 — Quick Task Input + Smart Parser:
-- criar tarefa por uma linha só ("Editar vídeo amanhã às 15h" → ENTER), sem abrir campos
-- separados de data/responsável. `due_date` (date, sem hora) já existia; faltava onde guardar a
-- hora quando o texto menciona uma ("às 15h") — nullable, omitido quando o texto não tem hora
-- (nunca inventado).
alter table public.tasks add column due_time time;
