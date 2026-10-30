"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Scale,
  ShieldCheck,
  Clock,
} from "lucide-react";

/**
 * `/lp/brunamachado` — Landing page de advogada (Bruna Machado).
 *
 * Construída do zero no ESTILO/estrutura de uma LP jurídica de conversão (hero + CTA WhatsApp,
 * áreas de atuação, método, sobre, processo, depoimentos, FAQ, contato), NÃO é um clone de nenhum
 * site real: copy é original/genérica e os dados específicos da cliente são placeholders editáveis
 * em `LP` abaixo. Preencha `LP` (nome, WhatsApp, áreas, bio, credenciais, depoimentos reais etc.)
 * para finalizar. Enquanto `whatsapp` estiver vazio, os CTAs rolam até a seção de contato.
 *
 * Paleta e fonte serifada vêm por CSS vars (`--lp-accent`, `--lp-serif`, definidas no wrapper /
 * na page) — trocar a identidade é só mudar essas vars.
 */
const LP = {
  name: "Bruna Montenegro",
  role: "Advogada",
  oab: "OAB/UF 000.000", // placeholder — informar
  whatsapp: "", // placeholder — só dígitos com DDI, ex.: "5551999999999"
  instagram: "", // placeholder — @handle ou URL
  email: "", // placeholder
  city: "", // placeholder — cidade/UF de atuação
  // Áreas de atuação (placeholder — ajuste para as reais da Bruna).
  areas: [
    { title: "Direito de Família", desc: "Divórcio, guarda, pensão e planejamento familiar com acolhimento e estratégia." },
    { title: "Direito do Consumidor", desc: "Defesa contra abusos, cobranças indevidas e falhas na prestação de serviço." },
    { title: "Direito Civil", desc: "Contratos, responsabilidade civil e resolução de conflitos patrimoniais." },
    { title: "Direito Trabalhista", desc: "Orientação e defesa de direitos nas relações de trabalho." },
    { title: "Direito Previdenciário", desc: "Aposentadorias, benefícios e revisões junto ao INSS." },
    { title: "Direito Imobiliário", desc: "Compra, venda, locação e regularização de imóveis com segurança." },
  ],
  // Depoimentos: deixe vazio até ter avaliações REAIS (ex.: Google). Não invente.
  depoimentos: [] as { nome: string; texto: string }[],
  faq: [
    { q: "Como funciona a primeira conversa?", a: "O primeiro contato é pelo WhatsApp, onde entendemos a sua situação e explicamos os próximos passos com clareza, sem compromisso." },
    { q: "O atendimento é presencial ou online?", a: "O atendimento pode ser feito de forma online, com a mesma atenção e segurança de um acompanhamento presencial." },
    { q: "Como são combinados os honorários?", a: "Os honorários são apresentados de forma transparente desde o início, de acordo com a complexidade do caso e as normas da OAB." },
    { q: "Vou acompanhar o andamento do meu caso?", a: "Sim. Você recebe atualizações em cada etapa importante, com linguagem simples e direta." },
  ],
};

const ACCENT = "#8a6a45";

function digits(s: string) {
  return s.replace(/\D/g, "");
}

/** Link do CTA: WhatsApp quando houver número; senão rola até a seção de contato. */
function ctaHref() {
  const d = digits(LP.whatsapp);
  return d ? `https://wa.me/${d}?text=${encodeURIComponent("Olá! Gostaria de uma orientação jurídica.")}` : "#contato";
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
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[var(--lp-accent)] px-7 py-3.5 text-sm font-medium text-white transition-all hover:brightness-110 hover:shadow-lg ${className ?? ""}`}
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
  { label: "Processo", href: "#processo" },
  { label: "Dúvidas", href: "#faq" },
];

export function BrunaLp() {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const serifStyle: CSSProperties = { fontFamily: "var(--lp-serif, Georgia, serif)" };

  return (
    <div
      className="min-h-screen scroll-smooth bg-[#f6f3ee] font-sans text-[#17150f] antialiased"
      style={{ ["--lp-accent" as string]: ACCENT } as CSSProperties}
    >
      {/* ───────── Header fixo ───────── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "border-b border-black/5 bg-[#f6f3ee]/90 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:h-20 lg:px-8">
          <a href="#top" className="flex items-baseline gap-2" style={serifStyle}>
            <span className="text-lg font-semibold tracking-tight lg:text-xl">{LP.name}</span>
            <span className="text-[11px] uppercase tracking-[0.25em] text-[var(--lp-accent)]">{LP.role}</span>
          </a>
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="text-sm text-[#17150f]/70 transition-colors hover:text-[#17150f]">
                {n.label}
              </a>
            ))}
          </nav>
          <Cta className="!px-5 !py-2.5 text-xs">Falar agora</Cta>
        </div>
      </header>

      {/* ───────── Hero ───────── */}
      <section id="top" className="relative overflow-hidden px-5 pb-20 pt-32 lg:px-8 lg:pb-28 lg:pt-44">
        {/* ornamento sutil */}
        <div aria-hidden className="pointer-events-none absolute -right-32 -top-24 h-96 w-96 rounded-full bg-[var(--lp-accent)]/10 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--lp-accent)]/30 bg-white/50 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-[var(--lp-accent)]">
              <Scale className="size-3.5" /> Advocacia com estratégia e proximidade
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl" style={serifStyle}>
              Assessoria jurídica séria, humana e ao seu lado.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#17150f]/70">
              Orientação clara em cada etapa do seu caso, com atendimento próximo, ético e dedicado a encontrar a melhor
              solução para você.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Cta>Falar no WhatsApp</Cta>
              <a href="#atuacao" className="inline-flex items-center gap-2 text-sm font-medium text-[#17150f]/80 transition-colors hover:text-[var(--lp-accent)]">
                Ver áreas de atuação <ArrowRight className="size-4" />
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#17150f]/60">
              {[
                { icon: MapPin, t: "Atendimento online" },
                { icon: Clock, t: "Resposta ágil" },
                { icon: ShieldCheck, t: "Sigilo e ética" },
              ].map(({ icon: Icon, t }) => (
                <span key={t} className="inline-flex items-center gap-2">
                  <Icon className="size-4 text-[var(--lp-accent)]" /> {t}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal className="lg:justify-self-end">
            {/* Placeholder da foto da advogada — troque por uma imagem real */}
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-b from-[#ece6dc] to-[#ddd3c4]">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#17150f]/30">
                <Scale className="size-10" />
                <span className="font-mono text-[11px] uppercase tracking-widest">Foto da advogada</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── Áreas de atuação ───────── */}
      <section id="atuacao" className="bg-white px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--lp-accent)]">Áreas de atuação</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl" style={serifStyle}>
              Em que posso te ajudar.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LP.areas.map((a, i) => (
              <Reveal key={a.title}>
                <div
                  className="group h-full rounded-xl border border-black/5 bg-[#f6f3ee] p-7 transition-all hover:-translate-y-1 hover:border-[var(--lp-accent)]/30 hover:shadow-md"
                  style={{ transitionDelay: `${(i % 3) * 40}ms` }}
                >
                  <span className="font-mono text-xs text-[var(--lp-accent)]">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 text-xl font-semibold" style={serifStyle}>{a.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#17150f]/65">{a.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Método ───────── */}
      <section id="metodo" className="px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--lp-accent)]">Como funciona</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl" style={serifStyle}>
              Um caminho simples e transparente.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              { t: "Conversa inicial", d: "Você relata sua situação pelo WhatsApp e entendemos juntos o que precisa ser resolvido." },
              { t: "Análise do caso", d: "Estudo detalhado dos documentos e das possibilidades, com orientação honesta sobre os caminhos." },
              { t: "Estratégia e acompanhamento", d: "Atuação dedicada do início ao fim, com você informado em cada etapa importante." },
            ].map((s, i) => (
              <Reveal key={s.t}>
                <div className="relative">
                  <span className="text-5xl font-light text-[var(--lp-accent)]/40" style={serifStyle}>{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 text-xl font-semibold" style={serifStyle}>{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#17150f]/65">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Sobre ───────── */}
      <section id="sobre" className="bg-[#17150f] px-5 py-20 text-[#f6f3ee] lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/0">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/25">
                <Scale className="size-10" />
                <span className="font-mono text-[11px] uppercase tracking-widest">Foto / retrato</span>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--lp-accent)]">Sobre</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl" style={serifStyle}>{LP.name}</h2>
            <p className="mt-2 text-sm uppercase tracking-wide text-white/50">{LP.role} · {LP.oab}</p>
            <p className="mt-6 max-w-xl leading-relaxed text-white/75">
              {/* Placeholder — substitua pela bio real da Bruna. */}
              Advogada dedicada a oferecer uma advocacia próxima, ética e estratégica. Acredito que cada caso é único e
              merece atenção, escuta e um acompanhamento humano do começo ao fim.
            </p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                "Atendimento humano e personalizado",
                "Comunicação clara e sem juridiquês",
                "Acompanhamento em todas as etapas",
                "Ética e sigilo profissional",
              ].map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm text-white/80">
                  <Check className="mt-0.5 size-4 shrink-0 text-[var(--lp-accent)]" /> {c}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Cta>Falar com {LP.name.split(" ")[0]}</Cta>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── Processo (timeline) ───────── */}
      <section id="processo" className="px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--lp-accent)]">Passo a passo</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl" style={serifStyle}>
              Do primeiro contato à solução.
            </h2>
          </Reveal>
          <ol className="mt-12 space-y-0">
            {[
              "Primeiro contato pelo WhatsApp",
              "Entendimento da sua situação",
              "Análise de documentos e viabilidade",
              "Proposta e combinação de honorários",
              "Elaboração da estratégia",
              "Atuação no seu caso",
              "Atualizações em cada etapa",
            ].map((step, i, arr) => (
              <Reveal key={step}>
                <li className="flex gap-5 pb-8 last:pb-0">
                  <div className="flex flex-col items-center">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--lp-accent)]/40 bg-white font-mono text-sm text-[var(--lp-accent)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {i < arr.length - 1 && <span className="mt-1 w-px flex-1 bg-[var(--lp-accent)]/20" />}
                  </div>
                  <p className="pt-2 text-lg text-[#17150f]/80" style={serifStyle}>{step}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── Depoimentos (só com avaliações REAIS) ───────── */}
      {LP.depoimentos.length > 0 && (
        <section className="bg-white px-5 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--lp-accent)]">Depoimentos</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl" style={serifStyle}>Quem já foi atendido.</h2>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {LP.depoimentos.map((d) => (
                <Reveal key={d.nome}>
                  <figure className="h-full rounded-xl border border-black/5 bg-[#f6f3ee] p-7">
                    <blockquote className="text-sm leading-relaxed text-[#17150f]/75">“{d.texto}”</blockquote>
                    <figcaption className="mt-4 text-sm font-medium">{d.nome}</figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────── FAQ ───────── */}
      <section id="faq" className="px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--lp-accent)]">Dúvidas frequentes</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl" style={serifStyle}>Perguntas comuns.</h2>
          </Reveal>
          <div className="mt-10 divide-y divide-black/10 border-y border-black/10">
            {LP.faq.map((item, i) => (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={openFaq === i}
                >
                  <span className="text-base font-medium sm:text-lg" style={serifStyle}>{item.q}</span>
                  <ChevronDown className={`size-5 shrink-0 text-[var(--lp-accent)] transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all duration-300 ${openFaq === i ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"}`}>
                  <p className="overflow-hidden text-sm leading-relaxed text-[#17150f]/65">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Contato / CTA final ───────── */}
      <section id="contato" className="bg-[var(--lp-accent)] px-5 py-20 text-white lg:px-8 lg:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl" style={serifStyle}>
              Vamos conversar sobre o seu caso?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-white/85">
              O primeiro passo é uma conversa. Me chame no WhatsApp e entenda, sem compromisso, como posso te ajudar.
            </p>
            <div className="mt-8 flex justify-center">
              <a
                href={ctaHref()}
                {...(ctaExternal() ? { target: "_blank", rel: "noreferrer" } : {})}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-[var(--lp-accent)] transition-transform hover:scale-[1.03]"
              >
                <MessageCircle className="size-5" /> Falar no WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── Rodapé ───────── */}
      <footer className="bg-[#17150f] px-5 py-14 text-[#f6f3ee]/70 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-[#f6f3ee]" style={serifStyle}>{LP.name}</p>
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
            {LP.city && (
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4" /> {LP.city}
              </span>
            )}
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-xs text-[#f6f3ee]/40">
          © {new Date().getFullYear()} {LP.name} · {LP.role}. Todos os direitos reservados.
        </div>
      </footer>

      {/* ───────── Botão flutuante WhatsApp ───────── */}
      <a
        href={ctaHref()}
        {...(ctaExternal() ? { target: "_blank", rel: "noreferrer" } : {})}
        aria-label="Falar no WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-[var(--lp-accent)] text-white shadow-lg transition-transform hover:scale-110"
      >
        <MessageCircle className="size-7" />
      </a>
    </div>
  );
}
