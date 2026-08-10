"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Handshake, Images, Menu, X } from "lucide-react";

export type NavigationProps = {
  brandName: string;
  homeHref: string;
  galleryHref: string;
  galleryLabel: string;
  prospeccaoCtaLabel: string;
  showProspeccaoCta: boolean;
  /** Opcional — item extra no menu (ex.: link pra uma proposta comercial). Ausente = menu igual a sempre foi. */
  extraLink?: { label: string; href: string };
};

export function Navigation({ brandName, homeHref, galleryHref, galleryLabel, prospeccaoCtaLabel, showProspeccaoCta, extraLink }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        setIsScrolled(currentScrollY > 20);
        if (currentScrollY > lastScrollY.current && currentScrollY > 150) {
          setIsHidden(true);
        } else if (currentScrollY < lastScrollY.current) {
          setIsHidden(false);
        }
        lastScrollY.current = currentScrollY;
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hidden = isHidden && !isMobileMenuOpen;

  return (
    <>
      {/* Faixa invisível: passar o mouse aqui traz o menu de volta mesmo escondido */}
      <div
        className="fixed inset-x-0 top-0 z-40 h-6"
        onMouseEnter={() => setIsHidden(false)}
        aria-hidden="true"
      />
      <header
        onMouseEnter={() => setIsHidden(false)}
        className={`fixed z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          hidden ? "-translate-y-[150%] opacity-0" : "translate-y-0 opacity-100"
        } ${
          isScrolled
            ? "top-4 left-4 right-4"
            : "top-[19px] left-0 right-0"
        }`}
      >
        <nav
          className={`mx-auto transition-all duration-500 ${
            isScrolled || isMobileMenuOpen
              ? "bg-background/80 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-lg max-w-[1200px]"
              : "bg-transparent max-w-[1400px]"
          }`}
        >
          <div
            className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-12 ${
              isScrolled ? "h-14" : "h-20"
            }`}
          >
            {/* Logo */}
            <a href={homeHref} className="group flex items-center">
              <span className={`font-display tracking-tight transition-all duration-500 ${isScrolled ? "text-xl text-foreground" : "text-2xl text-white"}`}>{brandName}</span>
            </a>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                asChild
                size="sm"
                className={`rounded-full transition-all duration-500 ${isScrolled ? "bg-foreground hover:bg-foreground/90 text-background px-4 h-8 text-xs" : "bg-white hover:bg-white/90 text-black px-6"}`}
              >
                <a href={galleryHref} className="inline-flex items-center gap-2">
                  <Images className="size-3.5" />
                  {galleryLabel}
                </a>
              </Button>
              {showProspeccaoCta && (
                <Button
                  asChild
                  size="sm"
                  className={`rounded-full bg-[var(--client-accent)] text-black transition-all duration-500 hover:bg-[#e0bd7d] ${isScrolled ? "h-8 px-4 text-xs" : "px-6"}`}
                >
                  <a href="#estrategia-aquisicao" className="inline-flex items-center gap-2">
                    <Handshake className="size-3.5" />
                    {prospeccaoCtaLabel}
                  </a>
                </Button>
              )}
              {extraLink && (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className={`rounded-full border-current transition-all duration-500 ${isScrolled ? "h-8 px-4 text-xs text-foreground" : "px-6 text-white"}`}
                >
                  <a href={extraLink.href} className="inline-flex items-center gap-2">
                    <FileText className="size-3.5" />
                    {extraLink.label}
                  </a>
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 transition-colors duration-500 ${isScrolled || isMobileMenuOpen ? "text-foreground" : "text-white"}`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

        </nav>

        {/* Mobile Menu - Full Screen Overlay */}
        <div
          className={`md:hidden fixed inset-0 bg-background z-40 transition-all duration-500 ${
            isMobileMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          style={{ top: 0 }}
        >
          <div className="flex h-full flex-col justify-center gap-3 px-8">
            <Button
              asChild
              className="bg-foreground text-background rounded-full h-14 text-base"
            >
              <a href={galleryHref} onClick={() => setIsMobileMenuOpen(false)} className="inline-flex items-center justify-center gap-2">
                <Images className="size-4" />
                {galleryLabel}
              </a>
            </Button>
            {showProspeccaoCta && (
              <Button
                asChild
                className="bg-[var(--client-accent)] text-black rounded-full h-14 text-base hover:bg-[#e0bd7d]"
              >
                <a href="#estrategia-aquisicao" onClick={() => setIsMobileMenuOpen(false)} className="inline-flex items-center justify-center gap-2">
                  <Handshake className="size-4" />
                  {prospeccaoCtaLabel}
                </a>
              </Button>
            )}
            {extraLink && (
              <Button asChild variant="outline" className="rounded-full h-14 text-base">
                <a href={extraLink.href} onClick={() => setIsMobileMenuOpen(false)} className="inline-flex items-center justify-center gap-2">
                  <FileText className="size-4" />
                  {extraLink.label}
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
