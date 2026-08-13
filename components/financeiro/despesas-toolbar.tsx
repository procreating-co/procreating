"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseFormDialog } from "@/components/financeiro/expense-form-dialog";

export function DespesasToolbar() {
  const [creating, setCreating] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setCreating(true)} className="ml-auto gap-2 self-start">
        <Plus className="size-4" />
        Nova despesa
      </Button>
      <ExpenseFormDialog open={creating} onOpenChange={setCreating} />
    </>
  );
}
