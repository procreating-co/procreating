import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[1400px] flex-col items-center justify-center gap-3 px-6 py-24 text-center lg:px-10">
      <div className="flex size-12 items-center justify-center rounded-xl bg-foreground/10 text-foreground">
        <Icon className="size-6" />
      </div>
      <h1 className="font-display text-3xl">{title}</h1>
      {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
    </main>
  );
}
