/**
 * Home da plataforma — placeholder. Antes disto redirecionava direto pra `/clients/pascoal`;
 * agora que o projeto é multi-cliente (`/clients/<slug>`, ver `app/clients/[client]/`), a raiz
 * deixa de pertencer a um cliente específico. Conteúdo real desta página (listagem de clientes,
 * marketing da Procreating, o que fizer sentido) é decisão de produto separada, não feita aqui.
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center text-foreground">
      <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Procreating</p>
      <h1 className="font-display text-3xl">Plataforma de Projetos</h1>
      <p className="max-w-md text-sm text-muted-foreground">Em construção.</p>
    </main>
  );
}
