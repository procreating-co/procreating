"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  GraduationCap,
  MapPin,
  MessageCircle,
  Phone,
  Mail,
  Instagram,
  ShieldCheck,
  Clock,
  Scale,
  Gavel,
} from "lucide-react";

/**
 * `/lp/brunamachado` — Página de vendas de advocacia CRIMINAL (Bruna Montenegro), no mesmo
 * modelo/estrutura do template da Fysilab (página da Thaís Machado): 8 seções, paleta
 * preto/dourado/bege, foco em conversão por WhatsApp e urgência 24h.
 *
 * NÃO é cópia do conteúdo de outra advogada: a copy é original/genérica do nicho criminal e os
 * dados específicos da cliente são placeholders editáveis em `LP`. Preencha com os dados REAIS da
 * Bruna (nome, OAB, WhatsApp, bio, credenciais, depoimentos reais, endereço). Enquanto `whatsapp`
 * estiver vazio, os CTAs rolam até a seção de contato.
 */
const LP = {
  name: "Bruna Montenegro",
  role: "Advogada Criminalista",
  oab: "OAB/UF 000.000", // placeholder — informar
  whatsapp: "", // placeholder — só dígitos com DDI, ex.: "5531999999999"
  instagram: "", // placeholder
  email: "", // placeholder
  city: "", // placeholder — cidade/UF do escritório
  // Áreas de atuação (criminal) — placeholders editáveis.
  areas: [
    { title: "Prisão em flagrante", desc: "Atuação imediata em flagrantes e audiência de custódia, buscando a liberdade do cliente." },
    { title: "Inquérito e investigações", desc: "Acompanhamento desde a fase policial, protegendo seus direitos antes mesmo da denúncia." },
    { title: "Tribunal do Júri", desc: "Defesa técnica e estratégica em crimes dolosos contra a vida, da pronúncia ao plenário." },
    { title: "Habeas corpus", desc: "Medidas urgentes contra prisões e constrangimentos ilegais em qualquer instância." },
    { title: "Crimes de trânsito", desc: "Defesa em embriaguez ao volante, lesões e demais infrações penais de trânsito." },
    { title: "Recursos e revisão", desc: "Recursos, relaxamento de prisão e revisão criminal em busca da reversão de decisões." },
  ],
  // Fases do processo criminal (genéricas/factuais) — ajuste se necessário.
  fases: [
    "Inquérito policial",
    "Oferecimento da denúncia",
    "Resposta à acusação",
    "Instrução e audiências",
    "Alegações finais",
    "Sentença",
    "Recursos",
    "Execução penal",
  ],
  // Depoimentos: só com avaliações REAIS (ex.: Google), com autorização. Não invente.
  depoimentos: [] as { nome: string; texto: string }[],
};

const ACCENT = "#c6a35a"; // dourado
const INK = "#14110b";
const BEIGE = "#f4efe6";

function digits(s: string) {
  return s.replace(/\D/g, "");
}
function ctaHref() {
  const d = digits(LP.whatsapp);
  return d ? `https://wa.me/${d}?text=${encodeURIComponent("Olá! Preciso de uma orientação com urgência.")}` : "#contato";
}
function ctaExternal() {
  return digits(LP.whatsapp).length > 0;
}

function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!ref) return;
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setShown(true), { threshold: 0.15 });
    obs.observe(ref);
    return () => obs.disconnect();
  }, [ref]);
  return (
    <div
      ref={setRef}
      className={`transition-all duration-700 ease-out ${shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

function Cta({ children, className }: { children: ReactNode; className?: string }) {
  const external = ctaExternal();
  return (
    <a
      href={ctaHref()}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[var(--lp-accent)] px-7 py-3.5 text-sm font-semibold text-[#14110b] transition-all hover:brightness-105 hover:shadow-[0_8px_30px_rgba(198,163,90,0.35)] ${className ?? ""}`}
    >
      <MessageCircle className="size-4" />
      {children}
    </a>
  );
}

const NAV = [
  { label: "Atuação", href: "#atuacao" },
  { label: "Método", href: "#metodo" },
  { label: "Sobre", href: "#sobre" },
  { label: "Fases", href: "#fases" },
  { label: "Contato", href: "#contato" },
];

export function BrunaLp() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const serif: CSSProperties = { fontFamily: "var(--lp-serif, Georgia, serif)" };
  const firstName = LP.name.split(" ")[0];

  return (
    <div
      className="min-h-screen scroll-smooth font-sans antialiased"
      style={{ ["--lp-accent" as string]: ACCENT, backgroundColor: BEIGE, color: INK } as CSSProperties}
    >
      {/* ───────── Header fixo ───────── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "border-b border-white/5 bg-[#0d0d0d]/95 text-[#f4efe6] backdrop-blur-md" : "bg-transparent text-[#14110b]"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:h-20 lg:px-8">
          <a href="#top" className="flex items-baseline gap-2" style={serif}>
            <span className="text-lg font-semibold tracking-tight lg:text-xl">{LP.name}</span>
            <span className="hidden text-[11px] uppercase tracking-[0.25em] text-[var(--lp-accent)] sm:inline">{LP.role}</span>
          </a>
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="text-sm opacity-70 transition-opacity hover:opacity-100">
                {n.label}
              </a>
            ))}
          </nav>
          <Cta className="!px-5 !py-2.5 text-xs">Falar agora</Cta>
        </div>
      </header>

      {/* ───────── Hero (preto) ───────── */}
      <section id="top" className="relative overflow-hidden bg-[#0d0d0d] px-5 pb-20 pt-32 text-[#f4efe6] lg:px-8 lg:pb-28 lg:pt-44">
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-32 h-[32rem] w-[32rem] rounded-full bg-[var(--lp-accent)]/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "36px 36px" }} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--lp-accent)]/40 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-[var(--lp-accent)]">
              <Gavel className="size-3.5" /> Defesa criminal · Atendimento 24h
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.75rem]" style={serif}>
              Defesa criminal firme, técnica e ao seu lado em cada etapa.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#f4efe6]/70">
              Atuação imediata para quem foi preso em flagrante, responde a inquérito ou está sob investigação — com
              estratégia, discrição e acompanhamento humano para você e sua família.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Cta>Falar com a advogada agora</Cta>
              <a href="#atuacao" className="inline-flex items-center gap-2 text-sm font-medium text-[#f4efe6]/80 transition-colors hover:text-[var(--lp-accent)]">
                Ver áreas de atuação <ArrowRight className="size-4" />
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#f4efe6]/60">
              {[
                { icon: Clock, t: "Atendimento 24h" },
                { icon: MapPin, t: "Em todo o Brasil" },
                { icon: ShieldCheck, t: "Sigilo absoluto" },
              ].map(({ icon: Icon, t }) => (
                <span key={t} className="inline-flex items-center gap-2">
                  <Icon className="size-4 text-[var(--lp-accent)]" /> {t}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal className="lg:justify-self-end">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--lp-accent)]/20 bg-gradient-to-b from-white/10 to-white/0">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#f4efe6]/25">
                <Scale className="size-10" />
                <span className="font-mono text-[11px] uppercase tracking-widest">Foto da advogada</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── Método (bege) ───────── */}
      <section id="metodo" className="px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--lp-accent)]">Como funciona</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl" style={serif}>
              Atuação rápida em 3 passos.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              { t: "Contato imediato", d: "Fale pelo WhatsApp a qualquer hora. Em um caso criminal, cada minuto conta." },
              { t: "Análise da situação", d: "Entendimento rápido do caso e das medidas cabíveis naquele momento." },
              { t: "Defesa e acompanhamento", d: "Atuação técnica em cada fase, com você e sua família sempre informados." },
            ].map((s, i) => (
              <Reveal key={s.t}>
                <div>
                  <span className="text-5xl font-light text-[var(--lp-accent)]/50" style={serif}>{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 text-xl font-semibold" style={serif}>{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#14110b]/65">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Áreas de atuação (preto) ───────── */}
      <section id="atuacao" className="bg-[#0d0d0d] px-5 py-20 text-[#f4efe6] lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--lp-accent)]">Áreas de atuação</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl" style={serif}>
              Em que posso te defender.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LP.areas.map((a, i) => (
              <Reveal key={a.title}>
                <div className="group h-full rounded-xl border border-white/10 bg-white/[0.03] p-7 transition-all hover:-translate-y-1 hover:border-[var(--lp-accent)]/40">
                  <span className="font-mono text-xs text-[var(--lp-accent)]">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 text-xl font-semibold" style={serif}>{a.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#f4efe6]/60">{a.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Sobre (bege) ───────── */}
      <section id="sobre" className="px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-b from-[#ece6dc] to-[#ddd3c4]">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#14110b]/30">
                <Scale className="size-10" />
                <span className="font-mono text-[11px] uppercase tracking-widest">Foto / retrato</span>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--lp-accent)]">Sobre</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl" style={serif}>{LP.name}</h2>
            <p className="mt-2 text-sm uppercase tracking-wide text-[#14110b]/50">{LP.role} · {LP.oab}</p>
            <p className="mt-6 max-w-xl leading-relaxed text-[#14110b]/75">
              {/* Placeholder — substitua pela bio real da Bruna. */}
              Advogada dedicada à defesa criminal, com atuação próxima, estratégica e sem julgamentos. Acredito que toda
              pessoa tem direito a uma defesa técnica e digna — e acompanho cada cliente e sua família com seriedade do
              início ao fim.
            </p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                "Atuação de urgência, 24 horas",
                "Comunicação clara, sem juridiquês",
                "Discrição e sigilo absoluto",
                "Acompanhamento em todas as fases",
              ].map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm text-[#14110b]/80">
                  <Check className="mt-0.5 size-4 shrink-0 text-[var(--lp-accent)]" /> {c}
                </li>
              ))}
            </ul>
            <div className="mt-8"><Cta>Falar com {firstName}</Cta></div>
          </Reveal>
        </div>
      </section>

      {/* ───────── Formação e credenciais (preto) ───────── */}
      <section className="bg-[#0d0d0d] px-5 py-20 text-[#f4efe6] lg:px-8 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--lp-accent)]">Formação e credenciais</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl" style={serif}>Preparo para defender você.</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {[
              "Graduação em Direito — [instituição]",
              "Pós-graduação em Ciências Criminais — [instituição]",
              "Inscrição ativa na OAB",
              "Atuação com foco exclusivo em Direito Penal",
            ].map((c) => (
              <Reveal key={c}>
                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <GraduationCap className="mt-0.5 size-5 shrink-0 text-[var(--lp-accent)]" />
                  <span className="text-sm text-[#f4efe6]/80">{c}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-wide text-[#f4efe6]/35">
            Credenciais são placeholders — substituir pelas reais da Bruna.
          </p>
        </div>
      </section>

      {/* ───────── Depoimentos (só com avaliações REAIS) ───────── */}
      {LP.depoimentos.length > 0 && (
        <section className="px-5 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--lp-accent)]">Depoimentos</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl" style={serif}>Quem já foi atendido.</h2>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {LP.depoimentos.map((d) => (
                <Reveal key={d.nome}>
                  <figure className="h-full rounded-xl border border-black/5 bg-white p-7">
                    <blockquote className="text-sm leading-relaxed text-[#14110b]/75">“{d.texto}”</blockquote>
                    <figcaption className="mt-4 text-sm font-medium">{d.nome}</figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────── Fases do processo criminal (bege, timeline) ───────── */}
      <section id="fases" className="px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--lp-accent)]">Entenda o caminho</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl" style={serif}>Fases do processo criminal.</h2>
          </Reveal>
          <ol className="mt-12">
            {LP.fases.map((step, i, arr) => (
              <Reveal key={step}>
                <li className="flex gap-5 pb-8 last:pb-0">
                  <div className="flex flex-col items-center">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--lp-accent)]/50 bg-white font-mono text-sm text-[var(--lp-accent)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {i < arr.length - 1 && <span className="mt-1 w-px flex-1 bg-[var(--lp-accent)]/25" />}
                  </div>
                  <p className="pt-2 text-lg text-[#14110b]/80" style={serif}>{step}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── Atuação nacional + localização (preto) ───────── */}
      <section className="bg-[#0d0d0d] px-5 py-20 text-[#f4efe6] lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--lp-accent)]">Onde atuo</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl" style={serif}>Atendimento em todo o Brasil.</h2>
            <p className="mt-6 max-w-lg leading-relaxed text-[#f4efe6]/70">
              Atendimento online para clientes de qualquer lugar do país, com a mesma atenção e agilidade de um
              acompanhamento presencial.{LP.city ? ` Escritório em ${LP.city}.` : ""}
            </p>
            <div className="mt-8"><Cta>Falar no WhatsApp</Cta></div>
          </Reveal>
          <Reveal>
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#f4efe6]/25">
                <MapPin className="size-9" />
                <span className="font-mono text-[11px] uppercase tracking-widest">Mapa / localização</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── CTA final (bege) ───────── */}
      <section id="contato" className="px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-4xl rounded-3xl bg-[#0d0d0d] px-6 py-16 text-center text-[#f4efe6] lg:px-12 lg:py-20">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl" style={serif}>
              Precisa de uma defesa agora?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[#f4efe6]/80">
              Não enfrente um processo criminal sozinho. Fale comigo pelo WhatsApp e entenda, com urgência e sigilo,
              como posso te ajudar.
            </p>
            <div className="mt-8 flex justify-center">
              <a
                href={ctaHref()}
                {...(ctaExternal() ? { target: "_blank", rel: "noreferrer" } : {})}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--lp-accent)] px-8 py-4 text-sm font-semibold text-[#14110b] transition-transform hover:scale-[1.03]"
              >
                <MessageCircle className="size-5" /> Falar com a advogada agora
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── Rodapé ───────── */}
      <footer className="bg-[#0d0d0d] px-5 py-14 text-[#f4efe6]/70 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-[#f4efe6]" style={serif}>{LP.name}</p>
            <p className="mt-1 text-sm uppercase tracking-wide text-[var(--lp-accent)]">{LP.role} · {LP.oab}</p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            {LP.whatsapp && (
              <a className="inline-flex items-center gap-2 hover:text-white" href={ctaHref()} target="_blank" rel="noreferrer">
                <Phone className="size-4" /> WhatsApp
              </a>
            )}
            {LP.email && (
              <a className="inline-flex items-center gap-2 hover:text-white" href={`mailto:${LP.email}`}>
                <Mail className="size-4" /> {LP.email}
              </a>
            )}
            {LP.instagram && (
              <a className="inline-flex items-center gap-2 hover:text-white" href={LP.instagram.startsWith("http") ? LP.instagram : `https://instagram.com/${LP.instagram.replace("@", "")}`} target="_blank" rel="noreferrer">
                <Instagram className="size-4" /> Instagram
              </a>
            )}
            {LP.city && (<span className="inline-flex items-center gap-2"><MapPin className="size-4" /> {LP.city}</span>)}
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-xs text-[#f4efe6]/40">
          © {new Date().getFullYear()} {LP.name} · {LP.role}. Todos os direitos reservados.
        </div>
      </footer>

      {/* ───────── Botão flutuante WhatsApp ───────── */}
      <a
        href={ctaHref()}
        {...(ctaExternal() ? { target: "_blank", rel: "noreferrer" } : {})}
        aria-label="Falar no WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-[var(--lp-accent)] text-[#14110b] shadow-lg transition-transform hover:scale-110"
      >
        <MessageCircle className="size-7" />
      </a>
    </div>
  );
}
