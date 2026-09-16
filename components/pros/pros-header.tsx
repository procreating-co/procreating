"use client";

import { useEffect, useState } from "react";

/**
 * Header — réplica visual do `Navigation` compartilhado (`components/landing/navigation.tsx`,
 * usado pelo site real da Pascoal): fixo, transparente sobre o Hero, vira um pill com blur ao
 * rolar. Componente próprio (não o `Navigation` compartilhado) porque essa página não tem CTA
 * nenhum no header — pedido explícito: excluir o botão "Acessar o Projeto Inicial", e não existe
 * um equivalente pra colocar no lugar. Sem menu mobile: não há nada pra abrir além da marca.
 */
export function ProsHeader({ brandName }: { brandName: string }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 20);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-[19px] z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
      <nav
        className={`mx-auto transition-all duration-500 ${
          isScrolled ? "max-w-[1200px] rounded-2xl border border-white/10 bg-black/70 shadow-lg backdrop-blur-xl" : "max-w-[1400px] bg-transparent"
        }`}
      >
        <div className={`flex items-center px-6 transition-all duration-500 lg:px-12 ${isScrolled ? "h-14" : "h-20"}`}>
          <span className={`font-display tracking-tight text-white transition-all duration-500 ${isScrolled ? "text-xl" : "text-2xl"}`}>{brandName}</span>
        </div>
      </nav>
    </header>
  );
}
