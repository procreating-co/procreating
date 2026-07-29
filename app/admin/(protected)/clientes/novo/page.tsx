import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Novo Cliente | Painel Procreating" };

/**
 * Cliente é uma entidade simples (só nome, por enquanto) — não precisa de assistente. O botão
 * fica desabilitado porque o fluxo de criação real (gravar em algum lugar) ainda não existe;
 * ver `docs/supabase.md` pro desenho da tabela `clients` que vai receber isso.
 */
export default function AdminNovoClientePage() {
  return (
    <main className="mx-auto max-w-lg px-6 py-10 lg:px-10">
      <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Clientes</p>
      <h1 className="mt-1 mb-8 font-display text-3xl">Novo Cliente</h1>

      <Card className="border-border/60 bg-card/40">
        <CardHeader>
          <CardTitle>Dados do cliente</CardTitle>
          <CardDescription>Só o nome por enquanto — mais campos entram quando houver uso real pra eles.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nome do cliente</Label>
              <Input id="name" name="name" placeholder="Ex.: Pascoal Bombas" />
            </div>
            <Button type="button" disabled title="Em breve" className="mt-2">
              Criar Cliente
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
