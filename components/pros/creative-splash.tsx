import Link from "next/link";
import { Instagram, Mail } from "lucide-react";
import { ProcreatingMark } from "@/components/dashboard/procreating-mark";

/**
 * `/pros/03` — splash mínima no estilo portfólio (duplicata de layout do sisko.cc, pedido), mas
 * SEM o vídeo de fundo e SEM o módulo de vídeo de baixo: fica só a tipografia centrada sobre fundo
 * preto. Conteúdo é do próprio Procreating (marca no topo, frase de posicionamento, atalhos).
 *
 * Estrutura (de cima pra baixo): marca → frase em 3 linhas → navegação (Cases / Sobre / Contato)
 * → ícones sociais. Página estática, sem interatividade — Server Component puro.
 *
 * Links a confirmar: Cases aponta pra vitrine `/pros/02`; Contato abre o WhatsApp real do
 * Procreating; "Sobre", Instagram e e-mail estão como placeholders (`#`) até virem os destinos.
 */
const WHATSAPP_URL = "https://wa.me/5551982205917";

/** Ícone do WhatsApp (lucide não traz marcas) — glifo simples, herda `currentColor`. */
function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.82c2.17 0 4.21.85 5.74 2.38a8.08 8.08 0 0 1 2.38 5.73c0 4.47-3.64 8.1-8.11 8.1a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.07.81.82-3-.19-.31a8.07 8.07 0 0 1-1.24-4.32c0-4.47 3.64-8.1 8.1-8.1Zm-2.8 4.38c-.15 0-.39.06-.6.28-.2.22-.78.76-.78 1.86s.8 2.16.91 2.31c.11.15 1.57 2.39 3.8 3.35.53.23.95.37 1.27.47.53.17 1.02.15 1.4.09.43-.06 1.32-.54 1.5-1.06.19-.52.19-.97.13-1.06-.05-.09-.2-.15-.42-.26-.22-.11-1.32-.65-1.52-.72-.2-.08-.35-.11-.5.11-.14.22-.57.72-.7.87-.13.15-.26.17-.48.06-.22-.11-.93-.34-1.77-1.09-.65-.58-1.1-1.3-1.22-1.52-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.14-.22.22-.37.07-.15.04-.28-.02-.39-.06-.11-.5-1.2-.68-1.64-.18-.43-.36-.37-.5-.38-.13 0-.28-.01-.43-.01Z" />
    </svg>
  );
}

const SOCIALS = [
  { label: "Instagram", href: "#", icon: Instagram, external: true },
  { label: "E-mail", href: "#", icon: Mail, external: false },
  { label: "WhatsApp", href: WHATSAPP_URL, icon: WhatsappIcon, external: true },
] as const;

const NAV = [
  { label: "Cases", href: "/pros/02", external: false },
  { label: "Sobre", href: "#", external: false },
  { label: "Contato", href: WHATSAPP_URL, external: true },
] as const;

export function CreativeSplash() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0b0b0b] px-6 text-white">
      {/* Marca no topo */}
      <div className="absolute left-1/2 top-8 flex -translate-x-1/2 items-center gap-2 text-white/80">
        <ProcreatingMark className="size-6" />
        <span className="text-xs font-medium uppercase tracking-[0.35em]">Procreating</span>
      </div>

      {/* Frase de posicionamento (3 linhas, mesma ordem pedida) */}
      <h1 className="text-center font-light uppercase leading-[1.04] tracking-tight text-[clamp(2.25rem,8vw,5.5rem)]">
        Marketing Criativo
        <br />
        Para Negócios
        <br />E Marcas
      </h1>

      {/* Navegação */}
      <nav className="mt-12 flex items-center gap-6 text-[0.7rem] uppercase tracking-[0.3em] text-white/70 sm:gap-10 sm:text-xs">
        {NAV.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
            className="transition-colors hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Sociais */}
      <ul className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-6">
        {SOCIALS.map(({ label, href, icon: Icon, external }) => (
          <li key={label}>
            <a
              href={href}
              aria-label={label}
              {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="flex size-5 items-center justify-center text-white/60 transition-colors hover:text-white"
            >
              <Icon className="size-5" />
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
