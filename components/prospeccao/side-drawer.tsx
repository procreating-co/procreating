"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Drawer lateral local à Central de Prospecção — mesma base (`@radix-ui/react-dialog`, já
 * dependência do projeto) que `components/ui/dialog.tsx`, só que deslizando da direita em vez
 * de centralizado. Ficha de lead e importação de CSV usam esse padrão em vez de modal central.
 */
function SideDrawer({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="side-drawer" {...props} />;
}

function SideDrawerContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { showCloseButton?: boolean }) {
  return (
    <DialogPrimitive.Portal data-slot="side-drawer-portal">
      <DialogPrimitive.Overlay
        data-slot="side-drawer-overlay"
        className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      />
      <DialogPrimitive.Content
        data-slot="side-drawer-content"
        className={cn(
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col gap-6 overflow-y-auto border-l border-white/10 bg-[#0c0c0c] p-6 text-white shadow-2xl duration-200 sm:max-w-lg",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close className="absolute top-5 right-5 rounded-md text-white/50 transition-opacity hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30">
            <XIcon className="size-4" />
            <span className="sr-only">Fechar</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function SideDrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="side-drawer-header" className={cn("flex flex-col gap-1.5 pr-6", className)} {...props} />;
}

function SideDrawerTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="side-drawer-title"
      className={cn("font-display text-xl text-white", className)}
      {...props}
    />
  );
}

function SideDrawerDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description data-slot="side-drawer-description" className={cn("text-sm text-white/50", className)} {...props} />;
}

export { SideDrawer, SideDrawerContent, SideDrawerHeader, SideDrawerTitle, SideDrawerDescription };
