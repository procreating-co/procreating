export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[1400px] flex-col items-center justify-center gap-2 px-6 py-24 text-center lg:px-10">
      <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Em construção</p>
      <h1 className="font-display text-3xl">{title}</h1>
      {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
    </main>
  );
}
