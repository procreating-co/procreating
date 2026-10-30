"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Menu,
  X,
  MapPin,
  MessageCircle,
  Phone,
  Mail,
  Instagram,
  ShieldCheck,
  Scale,
} from "lucide-react";

/**
 * `/lp/brunamachado` — Landing page da advogada TRABALHISTA Bruna Montenegro.
 *
 * O HERO recria a COMPOSIÇÃO do template de referência da Fysilab (duas colunas: texto à esquerda,
 * retrato à direita, fundo escuro cinematográfico, CTA dourado, WhatsApp flutuante) — mas com a
 * identidade/ marca PRÓPRIA da Bruna (logo em `public/lp/bruna-logo.png`), foto dela (placeholder —
 * nunca a foto de outra advogada) e copy original de advocacia trabalhista. Nada de conteúdo,
 * credenciais ou depoimentos de terceiros. Dados específicos são placeholders editáveis em `LP`.
 */
const LP = {
  name: "Bruna Montenegro",
  brand: "Advocacia & Consultoria Jurídica",
  role: "Advogada Trabalhista",
  oab: "OAB/RS 000.000", // placeholder — informar o número oficial
  state: "Rio Grande do Sul",
  whatsapp: "", // só dígitos com DDI, ex.: "5551999999999" (vazio → CTAs rolam até contato)
  phone: "", // ex.: "5551999999999" (vazio → rola até contato)
  instagram: "", // @handle ou URL
  email: "",
  city: "", // cidade/UF do escritório
  especialidades: [
    { title: "Assédio moral e psicológico", desc: "Orientação e defesa diante de situações de humilhação, perseguição e constrangimento no trabalho." },
    { title: "Burnout e adoecimento", desc: "Reconhecimento de doenças ocupacionais e dos direitos de quem adoeceu em razão do trabalho." },
    { title: "Demissão e verbas rescisórias", desc: "Conferência da rescisão, verbas devidas e reversão de demissões irregulares." },
    { title: "Horas extras e jornada", desc: "Cobrança de horas extras, intervalos e adicionais não pagos corretamente." },
    { title: "Reconhecimento de vínculo", desc: "Comprovação de vínculo empregatício e registro em carteira negado." },
    { title: "Acordos e negociações", desc: "Condução de acordos trabalhistas de forma segura, equilibrada e vantajosa para você." },
  ],
  faq: [
    { q: "Como funciona a primeira conversa?", a: "O primeiro contato é pelo WhatsApp. Você relata sua situação, entendemos o caso e explicamos os próximos passos com clareza, sem compromisso." },
    { q: "O atendimento é presencial ou online?", a: "O atendimento pode ser feito de forma online para todo o Rio Grande do Sul, com a mesma atenção e segurança de um acompanhamento presencial." },
    { q: "Como são combinados os honorários?", a: "Os honorários são apresentados de forma transparente desde o início, conforme a complexidade do caso e as normas da OAB." },
    { q: "Tenho direito mesmo sem ter sido registrado?", a: "Em muitos casos sim. A ausência de registro em carteira não afasta direitos — é possível buscar o reconhecimento do vínculo e as verbas devidas." },
  ],
};

const ACCENT = "#a88c5e"; // dourado da marca da Bruna (amostrado do logo)
const INK = "#14110b";
const CREAM = "#f4efe6";
const DARK = "#0c0b0a";

function digits(s: string) {
  return s.replace(/\D/g, "");
}
function waHref() {
  const d = digits(LP.whatsapp);
  return d ? `https://wa.me/${d}?text=${encodeURIComponent("Olá! Gostaria de uma orientação trabalhista.")}` : "#contato";
}
function waExternal() {
  return digits(LP.whatsapp).length > 0;
}
function telHref() {
  const d = digits(LP.phone);
  return d ? `tel:+${d}` : "#contato";
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
    <div ref={setRef} className={`transition-all duration-700 ease-out ${shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"} ${className ?? ""}`}>
      {children}
    </div>
  );
}

const NAV = [
  { label: "Método", href: "#metodo" },
  { label: "Especialidades", href: "#especialidades" },
  { label: "Sobre", href: "#sobre" },
  { label: "Dúvidas frequentes", href: "#faq" },
];

/** Logo da Bruna (gold em fundo transparente — funciona no escuro e no claro). */
function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/lp/bruna-logo.png"
      alt={`${LP.name} — ${LP.brand}`}
      width={1667}
      height={258}
      priority
      className={className}
    />
  );
}

export function BrunaLp() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const serif: CSSProperties = { fontFamily: "var(--lp-serif, Georgia, serif)" };
  const firstName = LP.name.split(" ")[0];

  return (
    <div className="min-h-screen scroll-smooth font-sans antialiased" style={{ ["--lp-accent" as string]: ACCENT, backgroundColor: CREAM, color: INK } as CSSProperties}>
      {/* ───────────────── NAVBAR ───────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 lg:px-4 lg:pt-4">
        <div
          className={`mx-auto flex max-w-[1195px] items-center justify-between gap-4 rounded-2xl border border-white/10 px-4 py-2.5 transition-all duration-300 lg:px-5 ${
            scrolled ? "bg-black/70 shadow-lg backdrop-blur-xl" : "bg-black/40 backdrop-blur-md"
          }`}
        >
          <a href="#top" aria-label={LP.name} className="flex shrink-0 items-center">
            <Logo className="h-8 w-auto lg:h-9" />
          </a>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="text-sm text-white/75 transition-colors hover:text-white">
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={telHref()}
              aria-label="Telefone"
              className="hidden size-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-[var(--lp-accent)] hover:text-[var(--lp-accent)] sm:flex"
            >
              <Phone className="size-4" />
            </a>
            <a
              href={waHref()}
              {...(waExternal() ? { target: "_blank", rel: "noreferrer" } : {})}
              aria-label="WhatsApp"
              className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-[var(--lp-accent)] hover:text-[var(--lp-accent)]"
            >
              <MessageCircle className="size-4" />
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white/80 lg:hidden"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="mx-auto mt-2 max-w-[1195px] overflow-hidden rounded-2xl border border-white/10 bg-black/90 p-2 backdrop-blur-xl lg:hidden">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)} className="block rounded-lg px-4 py-3 text-sm text-white/80 hover:bg-white/5">
                {n.label}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* ───────────────── HERO ───────────────── */}
      <section id="top" className="relative overflow-hidden" style={{ backgroundColor: DARK }}>
        {/* Fundo cinematográfico: grafite + glow quente discreto + vinheta */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 78% 30%, rgba(168,140,94,0.18) 0%, rgba(12,11,10,0) 55%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, #0c0b0a 0%, rgba(12,11,10,0.85) 42%, rgba(12,11,10,0.2) 100%)" }} />
          <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 220px 60px rgba(0,0,0,0.75)" }} />
        </div>

        <div className="relative mx-auto grid min-h-[100svh] max-w-[1440px] grid-cols-1 items-center gap-10 px-6 pb-16 pt-28 lg:grid-cols-[1fr_0.92fr] lg:gap-6 lg:px-[130px] lg:pb-0 lg:pt-24">
          {/* COLUNA ESQUERDA */}
          <div className="relative z-10 max-w-xl text-[#f4efe6]">
            <Reveal>
              <span className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#f4efe6]/85 sm:text-xs">
                Advocacia Trabalhista&nbsp;&nbsp;|&nbsp;&nbsp;{LP.oab}
              </span>
            </Reveal>
            <Reveal>
              <h1 className="mt-6 text-[clamp(2.4rem,6vw,4rem)] font-medium leading-[1.04] tracking-tight" style={serif}>
                Seus direitos no trabalho
                <br />
                merecem ser
                <br />
                respeitados.
              </h1>
            </Reveal>
            <Reveal>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-[#f4efe6]/70 sm:text-lg">
                Assédio moral, burnout, demissão e outros conflitos trabalhistas. Receba orientação jurídica para
                compreender seus direitos e as medidas cabíveis ao seu caso.
              </p>
            </Reveal>
            <Reveal>
              <a
                href={waHref()}
                {...(waExternal() ? { target: "_blank", rel: "noreferrer" } : {})}
                className="group mt-8 flex h-[72px] w-full max-w-[445px] items-center justify-between gap-3 rounded-xl bg-[var(--lp-accent)] pl-7 pr-3 text-[#1a1509] shadow-[0_10px_40px_-8px_rgba(168,140,94,0.5)] transition-all hover:brightness-105 active:scale-[0.99] sm:h-[80px]"
              >
                <span className="text-sm font-semibold uppercase tracking-wide sm:text-base">Falar com a advogada agora</span>
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#f4efe6]/90 transition-transform group-hover:scale-105 sm:size-14">
                  <MessageCircle className="size-6 text-[var(--lp-accent)]" />
                </span>
              </a>
            </Reveal>
            <Reveal>
              <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-[#f4efe6]/75">
                <span className="inline-flex items-center gap-2.5">
                  <span className="size-2.5 rounded-full bg-emerald-400" /> Atendimento no {LP.state}
                </span>
                <span className="inline-flex items-center gap-2.5">
                  <span className="size-2.5 rounded-full bg-[var(--lp-accent)]" /> Atendimento com sigilo profissional
                </span>
              </div>
            </Reveal>
          </div>

          {/* COLUNA DIREITA — retrato (placeholder; sem usar foto de terceiros) */}
          <div className="relative z-10 flex h-full items-end justify-center lg:justify-end">
            <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent lg:aspect-auto lg:h-[80vh] lg:max-w-md lg:rounded-none lg:border-0 lg:bg-transparent">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#f4efe6]/25">
                <Scale className="size-10" />
                <span className="font-mono text-[11px] uppercase tracking-widest">Foto da Bruna</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── MÉTODO ───────────────── */}
      <section id="metodo" className="px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--lp-accent)]">Como funciona</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl" style={serif}>Um caminho simples e transparente.</h2>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              { t: "Contato inicial", d: "Você relata sua situação pelo WhatsApp e entendemos juntos o que precisa ser resolvido." },
              { t: "Análise do caso", d: "Estudo dos documentos e das possibilidades, com orientação honesta sobre os caminhos." },
              { t: "Orientação e atuação", d: "Atuação dedicada do início ao fim, com você informado em cada etapa importante." },
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

      {/* ───────────────── ESPECIALIDADES ───────────────── */}
      <section id="especialidades" className="px-6 py-20 lg:px-8 lg:py-28" style={{ backgroundColor: DARK, color: CREAM }}>
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--lp-accent)]">Especialidades</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl" style={serif}>Em que posso te ajudar.</h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LP.especialidades.map((a, i) => (
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

      {/* ───────────────── SOBRE ───────────────── */}
      <section id="sobre" className="px-6 py-20 lg:px-8 lg:py-28">
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
              Advogada dedicada ao Direito do Trabalho, com atuação próxima, humana e estratégica. Acredito que todo
              trabalhador merece ser ouvido e orientado com clareza — e acompanho cada cliente com seriedade do início
              ao fim.
            </p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                "Atendimento humano e personalizado",
                "Comunicação clara, sem juridiquês",
                "Acompanhamento em todas as etapas",
                "Sigilo e ética profissional",
              ].map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm text-[#14110b]/80">
                  <Check className="mt-0.5 size-4 shrink-0 text-[var(--lp-accent)]" /> {c}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <a
                href={waHref()}
                {...(waExternal() ? { target: "_blank", rel: "noreferrer" } : {})}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--lp-accent)] px-7 py-3.5 text-sm font-semibold text-[#1a1509] transition-all hover:brightness-105"
              >
                <MessageCircle className="size-4" /> Falar com {firstName}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────── FAQ (Dúvidas frequentes) ───────────────── */}
      <section id="faq" className="px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--lp-accent)]">Dúvidas frequentes</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl" style={serif}>Perguntas comuns.</h2>
          </Reveal>
          <div className="mt-10 divide-y divide-black/10 border-y border-black/10">
            {LP.faq.map((item, i) => (
              <div key={item.q}>
                <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left" aria-expanded={openFaq === i}>
                  <span className="text-base font-medium sm:text-lg" style={serif}>{item.q}</span>
                  <ChevronDown className={`size-5 shrink-0 text-[var(--lp-accent)] transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all duration-300 ${openFaq === i ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"}`}>
                  <p className="overflow-hidden text-sm leading-relaxed text-[#14110b]/65">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── CTA final ───────────────── */}
      <section id="contato" className="px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-4xl rounded-3xl px-6 py-16 text-center text-[#f4efe6] lg:px-12 lg:py-20" style={{ backgroundColor: DARK }}>
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl" style={serif}>Vamos conversar sobre o seu caso?</h2>
            <p className="mx-auto mt-5 max-w-xl text-[#f4efe6]/80">
              O primeiro passo é uma conversa. Me chame no WhatsApp e entenda, sem compromisso, como posso te ajudar.
            </p>
            <div className="mt-8 flex justify-center">
              <a
                href={waHref()}
                {...(waExternal() ? { target: "_blank", rel: "noreferrer" } : {})}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--lp-accent)] px-8 py-4 text-sm font-semibold text-[#1a1509] transition-transform hover:scale-[1.03]"
              >
                <MessageCircle className="size-5" /> Falar com a advogada agora
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────── RODAPÉ ───────────────── */}
      <footer className="px-6 py-14 lg:px-8" style={{ backgroundColor: DARK, color: "rgba(244,239,230,0.7)" }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Logo className="h-10 w-auto" />
            <p className="mt-3 text-sm uppercase tracking-wide text-[var(--lp-accent)]">{LP.role} · {LP.oab}</p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            {LP.whatsapp && (
              <a className="inline-flex items-center gap-2 hover:text-white" href={waHref()} target="_blank" rel="noreferrer"><Phone className="size-4" /> WhatsApp</a>
            )}
            {LP.email && (<a className="inline-flex items-center gap-2 hover:text-white" href={`mailto:${LP.email}`}><Mail className="size-4" /> {LP.email}</a>)}
            {LP.instagram && (
              <a className="inline-flex items-center gap-2 hover:text-white" href={LP.instagram.startsWith("http") ? LP.instagram : `https://instagram.com/${LP.instagram.replace("@", "")}`} target="_blank" rel="noreferrer"><Instagram className="size-4" /> Instagram</a>
            )}
            {LP.city && (<span className="inline-flex items-center gap-2"><MapPin className="size-4" /> {LP.city}</span>)}
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-xs text-[#f4efe6]/40">
          © {new Date().getFullYear()} {LP.name} · {LP.brand}. Todos os direitos reservados.
        </div>
      </footer>

      {/* ───────────────── WhatsApp flutuante ───────────────── */}
      <a
        href={waHref()}
        {...(waExternal() ? { target: "_blank", rel: "noreferrer" } : {})}
        aria-label="Falar no WhatsApp"
        className="group fixed bottom-5 right-5 z-50 flex items-center gap-3"
      >
        <span className="hidden rounded-xl bg-white px-4 py-2 text-left shadow-xl sm:block">
          <span className="block text-xs font-semibold text-[#14110b]">Fale com {LP.name}</span>
          <span className="block text-[11px] text-[#14110b]/55">Atendimento jurídico trabalhista</span>
        </span>
        <span className="flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform group-hover:scale-110">
          <MessageCircle className="size-7" />
        </span>
      </a>
    </div>
  );
}
