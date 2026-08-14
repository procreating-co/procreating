"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { usePortalContainer } from "@/lib/theme/portal-container";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

/** `container` mantém o portal DENTRO de `.os-shell` — mesmo raciocínio de `dialog.tsx` (ver
 *  `portal-container.tsx`); foi exatamente aqui que o bug apareceu primeiro (item ativo do
 *  drawer mobile saindo dourado, o `:root` antigo, em vez do monocromático novo). */
function SheetPortal({ container, ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  const osShellContainer = usePortalContainer();
  return <SheetPrimitive.Portal data-slot="sheet-portal" container={container ?? osShellContainer} {...props} />;
}

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

/** Painel deslizante — mesma base do `Dialog` (`@radix-ui/react-dialog`), só a posição/animação
 *  mudam (`side`: de qual borda entra). Usado hoje só pela sidebar em telas pequenas
 *  (`dashboard-sidebar.tsx`), mas genérico o bastante pra qualquer painel lateral futuro. */
function SheetContent({
  className,
  children,
  side = "left",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: "left" | "right"; showCloseButton?: boolean }) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed inset-y-0 z-50 flex h-full w-72 flex-col border-border/60 bg-sidebar shadow-2xl transition ease-in-out data-[state=closed]:duration-200 data-[state=open]:duration-300",
          side === "left" &&
            "left-0 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
          side === "right" &&
            "right-0 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          "data-[state=closed]:animate-out data-[state=open]:animate-in",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground opacity-70 transition-opacity hover:bg-foreground/5 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <XIcon className="size-4" />
            <span className="sr-only">Fechar</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("font-display text-lg text-foreground", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export { Sheet, SheetPortal, SheetOverlay, SheetContent, SheetTitle, SheetDescription };
