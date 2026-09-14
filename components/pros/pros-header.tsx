"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

type NavItem = { label: string; href: string };

/**
 * Header — minimalista, pedido explícito: logo/nome + navegação simples (âncoras pra seção) +
 * CTA. Não fixo (`sticky`) — a página já é cinematográfica o bastante com o bloco de scroll
 * reveal logo abaixo; um header fixo por cima disputaria atenção com exatamente o momento que
 * devia ser o mais forte da página. Fica só no topo, rola junto com o resto.
 */
export function ProsHeader({ brandName, nav, ctaLabel, ctaHref }: { brandName: string; nav: NavItem[]; ctaLabel: string; ctaHref: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative z-30 bg-black text-white">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-10">
        <a href="#" className="font-display text-lg tracking-wide">
          {brandName}
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="text-sm text-white/60 transition-colors hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href={ctaHref}
          className="hidden rounded-full border border-white/30 px-4 py-2 text-sm text-white transition-colors hover:border-white/70 md:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {ctaLabel}
        </a>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileOpen}
          className="flex size-9 items-center justify-center text-white md:hidden"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-black px-6 py-6 md:hidden">
          <nav className="flex flex-col gap-4">
            {nav.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="text-base text-white/80">
                {item.label}
              </a>
            ))}
            <a href={ctaHref} onClick={() => setMobileOpen(false)} className="mt-2 rounded-full border border-white/30 px-4 py-3 text-center text-base text-white">
              {ctaLabel}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
