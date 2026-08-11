"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

/**
 * Modal em página inteira — mesma base radix-dialog de `side-drawer.tsx`, só que cobrindo o
 * viewport inteiro em vez de deslizar de um lado. Usado pela ficha do lead em Oficinas, onde
 * o pedido foi explicitamente "não lateral".
 */
function FullPageModal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="full-page-modal" {...props} />;
}

function FullPageModalContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal data-slot="full-page-modal-portal">
      <DialogPrimitive.Content
        data-slot="full-page-modal-content"
        className={cn(
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 overflow-y-auto bg-[#0a0a0a] text-white duration-200",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export { FullPageModal, FullPageModalContent };
