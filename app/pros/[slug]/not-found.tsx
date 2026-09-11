import { ProcreatingMark } from "@/components/dashboard/procreating-mark";

/**
 * Fallback pra slug inexistente (`notFound()` em `page.tsx`) — mantém a mesma identidade visual
 * mínima do resto de `/pros` (preto, Procreating mark) em vez do 404 genérico do Next, sem virar
 * uma seção nova da página (é o estado de erro, não o conteúdo).
 */
export default function ProsNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
      <ProcreatingMark className="size-8 text-white/50" />
      <p className="font-display text-2xl font-light tracking-wide">Esta página ainda não existe.</p>
    </main>
  );
}
