"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Check, ChevronDown, MessageCircle, Phone, Mail, Instagram, MapPin, Scale, FileCheck2, MessageSquare, Star, Target } from "lucide-react";

/**
 * `/lp/brunamachado` — Landing page da advogada trabalhista Bruna Montenegro.
 *
 * O HERO é o design entregue pela equipe (HTML/CSS próprios) portado para o projeto: fundo escuro
 * cinematográfico, retrato à direita com máscara/gradiente, CTA dourado e WhatsApp flutuante. As
 * classes do hero são prefixadas `blp-` (CSS no <style> abaixo) pra não colidir com o resto. Marca
 * e foto são da própria Bruna (`public/lp/bruna-logo.png`, `public/lp/bruna.jpg`).
 *
 * Header: só o logo (pedido). Dados de contato ficam em `LP` (placeholders editáveis) — enquanto
 * `whatsapp` estiver vazio, os CTAs rolam até a seção de contato.
 */
const LP = {
  name: "Bruna Montenegro",
  brand: "Advocacia Trabalhista",
  role: "Advogada Trabalhista",
  oab: "OAB/RS 100.993",
  state: "Rio Grande do Sul",
  whatsapp: "",
  email: "",
  instagram: "",
  city: "",
  especialidades: [
    { title: "Assédio moral e psicológico", desc: "Orientação e defesa diante de humilhação, perseguição e constrangimento no trabalho." },
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

const ACCENT = "#c9a580";
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

/** CSS do hero (design entregue pela equipe), classes prefixadas `blp-` e fontes via CSS vars. */
const HERO_CSS = `
.blp-root{background:${CREAM};color:${INK};font-family:var(--lp-sans),Arial,sans-serif}
.blp-hero{position:relative;isolation:isolate;min-height:810px;overflow:hidden;background:radial-gradient(ellipse at 80% 12%,#292321 0%,transparent 48%),#090909}
.blp-hero::before{content:'';position:absolute;z-index:-2;inset:0;background:linear-gradient(110deg,#060606 20%,#0c0b0a 60%,#14110f)}
.blp-portrait{position:absolute;z-index:-1;right:2%;bottom:0;height:86%;width:51%;overflow:hidden;-webkit-mask-image:linear-gradient(to right,transparent 0%,black 27%),linear-gradient(to top,black 84%,transparent 100%);-webkit-mask-composite:source-in;mask-image:linear-gradient(to right,transparent 0%,black 27%),linear-gradient(to top,black 84%,transparent 100%);mask-composite:intersect;opacity:.96}
.blp-portrait img{width:100%;height:100%;object-fit:cover;object-position:center 23%;filter:brightness(.69) saturate(.62) contrast(1.12)}
.blp-portrait:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,#090909 0%,transparent 36%),linear-gradient(0deg,#090909 0%,transparent 25%),rgba(0,0,0,.04)}
.blp-nav{height:78px;width:min(1195px,calc(100% - 56px));margin:12px auto 0;padding:10px 18px;display:flex;align-items:center;justify-content:flex-start;border:1px solid #ffffff0e;border-radius:10px;background:#0b0b0baa;backdrop-filter:blur(18px);position:relative;z-index:5}
.blp-logo{height:40px;width:auto}
.blp-hero-body{width:min(1180px,calc(100% - 56px));margin:104px auto 0;position:relative;z-index:2}
.blp-copy{width:min(590px,55%)}
.blp-eyebrow{display:inline-flex;align-items:center;min-height:50px;padding:0 29px;border:1px solid #ffffff16;border-radius:12px;background:#10101092;letter-spacing:4px;font-size:13px;color:#f4efe6}
.blp-copy h1{font:500 clamp(38px,3.15vw,50px)/1.02 var(--lp-serif),Georgia,serif;letter-spacing:-1.4px;margin:27px 0 24px;max-width:590px;color:#f4efe6}
.blp-lead{font-size:22px;line-height:1.58;color:#efefef;max-width:570px;margin:0 0 22px}
.blp-cta{width:min(445px,100%);min-height:80px;display:flex;align-items:center;justify-content:center;gap:15px;padding:12px 18px;border-radius:6px;background:linear-gradient(110deg,#d4ad79,#f0d09e 55%,#ab906d);box-shadow:0 13px 28px #caa06b40;color:#0a0908;font-weight:700;font-size:17px;transition:transform .2s,box-shadow .2s}
.blp-cta:hover{transform:translateY(-2px);box-shadow:0 15px 34px #caa06b55}
.blp-bubble{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:white;color:#8c6a3c}
.blp-bubble svg{width:22px;height:22px}
.blp-trust{display:flex;gap:18px;margin-top:23px;align-items:center;flex-wrap:wrap;font-size:14px;color:#e1e1df}
.blp-dot{display:inline-block;width:14px;height:14px;border-radius:50%;background:#67e99c;margin-right:7px;vertical-align:-2px}
.blp-dot.blp-gold{background:#c49b72}
.blp-floating{position:fixed;z-index:40;right:25px;bottom:26px;display:flex;align-items:center;gap:7px}
.blp-float-icon{height:48px;width:48px;border:4px solid #4bc15e;background:#33aa4b;border-radius:50%;display:grid;place-items:center}
.blp-float-icon svg{width:25px;height:25px;color:#fff}
.blp-float-body{background:#f7f7f7;color:#202020;padding:10px 13px;border-radius:28px 3px 3px 28px;font-size:12px}
.blp-float-body small{display:block;color:#666;margin-top:2px}
@media(max-width:920px){.blp-hero-body{margin-top:115px}.blp-copy{width:57%}.blp-lead{font-size:18px}.blp-portrait{right:-10%;width:67%;height:83%}}
@media(max-width:680px){.blp-hero{min-height:960px}.blp-nav{width:calc(100% - 28px);margin-top:10px;height:70px;padding:10px 13px}.blp-logo{height:34px}.blp-hero-body{margin:57px auto 0;width:calc(100% - 38px)}.blp-copy{width:100%}.blp-eyebrow{font-size:10px;letter-spacing:2px;min-height:42px;padding:0 16px}.blp-copy h1{font-size:clamp(36px,8vw,49px);max-width:520px;margin:21px 0}.blp-lead{font-size:16px;line-height:1.5;max-width:520px}.blp-cta{min-height:65px;font-size:13px}.blp-trust{font-size:12px;gap:10px}.blp-portrait{height:48%;width:100%;right:-13%;bottom:0;-webkit-mask-image:linear-gradient(to bottom,transparent 0%,black 23%);mask-image:linear-gradient(to bottom,transparent 0%,black 23%);opacity:.8}.blp-portrait img{object-position:center 31%;filter:brightness(.5) saturate(.62) contrast(1.1)}.blp-portrait:after{background:linear-gradient(0deg,#090909 0%,transparent 19%),linear-gradient(90deg,#09090970,transparent 54%)}.blp-floating{right:12px;bottom:12px}.blp-float-body{display:none}}

/* ── Método (bloco abaixo do hero) ── */
.blp-method{position:relative;background:radial-gradient(ellipse 60% 48% at 50% -4%,#1b1711 0%,transparent 60%),#0a0a09;color:#f4efe6;padding:94px 24px 112px;overflow:hidden}
.blp-method-inner{width:min(1120px,100%);margin:0 auto;text-align:center}
.blp-m-badge{display:inline-flex;align-items:center;padding:13px 28px;border:1px solid #ffffff14;border-radius:9px;background:#ffffff07;letter-spacing:5px;font-size:12px;color:#e7ddcc}
.blp-m-title{font:500 clamp(30px,3.6vw,45px)/1.12 var(--lp-serif),Georgia,serif;letter-spacing:-.5px;margin:26px auto 0;color:#f4efe6}
.blp-m-title span{color:#c9a580}
.blp-m-sub{font-size:clamp(16px,1.55vw,21px);line-height:1.6;color:#d9d4cb;margin:18px auto 0;max-width:640px}
.blp-m-div{display:flex;align-items:center;justify-content:center;gap:20px;margin:40px auto 0;max-width:620px}
.blp-m-div i{height:1px;flex:1;background:linear-gradient(90deg,transparent,#c9a58066 70%,#c9a580)}
.blp-m-div i:last-child{background:linear-gradient(270deg,transparent,#c9a58066 70%,#c9a580)}
.blp-m-div b{width:11px;height:11px;flex:none;background:linear-gradient(135deg,#f0dcb6,#b8935f);transform:rotate(45deg);box-shadow:0 0 12px #c9a58066}
.blp-m-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;margin-top:66px}
.blp-m-col{display:flex;flex-direction:column;align-items:center}
.blp-m-orb{position:relative;width:clamp(150px,15vw,210px);aspect-ratio:1;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 50% 30%,#211e19,#0b0a09 72%);box-shadow:inset 0 3px 12px #ffffff0d,inset 0 -14px 34px #000000a0,0 34px 64px #00000075}
.blp-m-orb::before{content:'';position:absolute;inset:-24px;border-radius:50%;opacity:0;background:conic-gradient(from 175deg,transparent 0deg,#e9d2a8 95deg,#c9a580 205deg,transparent 320deg);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 2px),#000 calc(100% - 2px));mask:radial-gradient(farthest-side,transparent calc(100% - 2px),#000 calc(100% - 2px))}
.blp-m-orb.mid::before{opacity:1}
.blp-m-ringwrap{position:relative;width:66%;aspect-ratio:1;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 50% 35%,#16130f,#0a0908)}
.blp-m-ringwrap::before{content:'';position:absolute;inset:-2px;border-radius:50%;background:conic-gradient(from 210deg,#efd9b2,#9c7b50,#f3e1bd,#8a6d47,#efd9b2);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 2.5px),#000 calc(100% - 2.5px));mask:radial-gradient(farthest-side,transparent calc(100% - 2.5px),#000 calc(100% - 2.5px))}
.blp-m-ringwrap svg{width:42%;height:42%;color:#f4efe6;stroke-width:1.2}
.blp-m-ringwrap .blp-m-ic{position:relative;width:46%;aspect-ratio:1}
.blp-m-ringwrap .blp-m-ic svg{position:absolute;color:#f4efe6}
.blp-m-ringwrap .blp-m-ic svg:nth-child(1){inset:0;width:100%;height:100%}
.blp-m-ringwrap .blp-m-ic svg:nth-child(2){width:38%;height:38%;left:31%;top:25%}
.blp-m-dots{display:flex;flex-direction:column;align-items:center;gap:7px;margin:28px 0 22px}
.blp-m-dots span{width:4px;height:4px;border-radius:50%;background:#c9a580;opacity:.7}
.blp-m-col h3{font:500 clamp(24px,2.4vw,32px)/1 var(--lp-serif),Georgia,serif;color:#c9a580}
.blp-m-col p{font-size:15px;line-height:1.6;color:#b9b4ab;margin:16px auto 0;max-width:290px}
@media(max-width:760px){.blp-method{padding:68px 22px 82px}.blp-m-grid{grid-template-columns:1fr;gap:50px;margin-top:52px}.blp-m-orb::before{inset:-18px}}
`;

const WaGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
    <path d="M20.5 11.5a8.5 8.5 0 0 1-12.7 7.4L3 20l1.2-4.7A8.5 8.5 0 1 1 20.5 11.5Z" />
    <path d="M8 8c0 3.5 4.4 8 7.5 8l1-1.4-3-1.4-1 1a10 10 0 0 1-3-3l1-1L9 7Z" />
  </svg>
);

function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!ref) return;
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setShown(true), { threshold: 0.15 });
    obs.observe(ref);
    return () => obs.disconnect();
  }, [ref]);
  return (
    <div ref={setRef} style={{ transitionDelay: shown ? `${delay}ms` : "0ms" }} className={`transition-all duration-700 ease-out ${shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"} ${className ?? ""}`}>
      {children}
    </div>
  );
}

export function BrunaLp() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const serif: CSSProperties = { fontFamily: "var(--lp-serif, Georgia, serif)" };
  const external = waExternal();
  const firstName = LP.name.split(" ")[0];

  // Conteúdo do bloco "Método" — fiel aos anexos entregues pela equipe.
  const METODO = [
    { t: "Estudo", d: "O processo é analisado linha por linha, atrás do que a acusação não quer que você veja – nulidades, provas ilícitas e irregularidades processuais não aparecem para quem lê por cima.", icon: <FileCheck2 /> },
    { t: "Especialização", d: "Atuação exclusiva em defesas criminais, domínio em Lei de Drogas e Execução Penal.", icon: <span className="blp-m-ic"><MessageSquare /><Star /></span> },
    { t: "Estratégia", d: "Tipificação se discute, laudo se contesta, benefício se calcula.", icon: <Target /> },
  ];

  return (
    <div className="blp-root min-h-screen scroll-smooth antialiased">
      <style dangerouslySetInnerHTML={{ __html: HERO_CSS }} />

      {/* ───────────────── HERO (design entregue) ───────────────── */}
      <section className="blp-hero" id="inicio">
        <div className="blp-portrait">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/lp/bruna.jpg" alt="Retrato profissional de Bruna Montenegro" />
        </div>

        {/* Header: só o logo (pedido) */}
        <header className="blp-nav">
          <a href="#inicio" aria-label={LP.name}>
            <Image src="/lp/bruna-logo.png" alt={`${LP.name} — ${LP.brand}`} width={1667} height={258} priority className="blp-logo" />
          </a>
        </header>

        <div className="blp-hero-body">
          <div className="blp-copy">
            <div className="blp-eyebrow">ADVOCACIA TRABALHISTA</div>
            <h1>Seus direitos no trabalho merecem ser respeitados.</h1>
            <p className="blp-lead">
              Assédio moral, burnout, demissão e outros conflitos trabalhistas. Receba orientação jurídica para
              compreender seus direitos e as medidas cabíveis ao seu caso.
            </p>
            <a className="blp-cta" href={waHref()} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
              <span>FALAR COM A ADVOGADA AGORA</span>
              <span className="blp-bubble"><WaGlyph /></span>
            </a>
            <div className="blp-trust">
              <span><i className="blp-dot" />Atendimento no {LP.state}</span>
              <span><i className="blp-dot blp-gold" />Sigilo profissional</span>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── MÉTODO (design dos anexos) ───────────────── */}
      <section id="metodo" className="blp-method">
        <div className="blp-method-inner">
          <Reveal><span className="blp-m-badge">CONHEÇA O MÉTODO</span></Reveal>
          <Reveal delay={90}><h2 className="blp-m-title">O <span>método</span> em três movimentos.</h2></Reveal>
          <Reveal delay={160}><p className="blp-m-sub">Urgência sem precisão custa caro. Aqui, seu caso tem as duas.</p></Reveal>
          <Reveal delay={220}>
            <div className="blp-m-div"><i /><b /><i /></div>
          </Reveal>
          <div className="blp-m-grid">
            {METODO.map((m, i) => (
              <Reveal key={m.t} delay={i * 150}>
                <div className="blp-m-col">
                  <div className={`blp-m-orb${i === 1 ? " mid" : ""}`}>
                    <div className="blp-m-ringwrap">{m.icon}</div>
                  </div>
                  <div className="blp-m-dots"><span /><span /><span /><span /></div>
                  <h3>{m.t}</h3>
                  <p>{m.d}</p>
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
            <p className="text-xs font-medium uppercase tracking-[0.25em]" style={{ color: ACCENT }}>Especialidades</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl" style={serif}>Em que posso te ajudar.</h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LP.especialidades.map((a, i) => (
              <Reveal key={a.title}>
                <div className="group h-full rounded-xl border border-white/10 bg-white/[0.03] p-7 transition-all hover:-translate-y-1" style={{ borderColor: undefined }}>
                  <span className="font-mono text-xs" style={{ color: ACCENT }}>{String(i + 1).padStart(2, "0")}</span>
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
            <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl border border-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/lp/bruna.jpg" alt="Bruna Montenegro" className="h-full w-full object-cover" style={{ objectPosition: "center 20%" }} />
            </div>
          </Reveal>
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.25em]" style={{ color: ACCENT }}>Sobre</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl" style={serif}>{LP.name}</h2>
            <p className="mt-2 text-sm uppercase tracking-wide" style={{ color: `${INK}80` }}>{LP.role} · {LP.oab}</p>
            <p className="mt-6 max-w-xl leading-relaxed" style={{ color: `${INK}bf` }}>
              {/* Placeholder — substituir pela bio real da Bruna. */}
              Advogada dedicada ao Direito do Trabalho, com atuação próxima, humana e estratégica. Acredito que todo
              trabalhador merece ser ouvido e orientado com clareza — e acompanho cada cliente com seriedade do início
              ao fim.
            </p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {["Atendimento humano e personalizado", "Comunicação clara, sem juridiquês", "Acompanhamento em todas as etapas", "Sigilo e ética profissional"].map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm" style={{ color: `${INK}cc` }}>
                  <Check className="mt-0.5 size-4 shrink-0" style={{ color: ACCENT }} /> {c}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <a href={waHref()} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-[#1a1509]" style={{ backgroundColor: ACCENT }}>
                <MessageCircle className="size-4" /> Falar com {firstName}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────── FAQ ───────────────── */}
      <section id="faq" className="px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.25em]" style={{ color: ACCENT }}>Dúvidas frequentes</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl" style={serif}>Perguntas comuns.</h2>
          </Reveal>
          <div className="mt-10 divide-y divide-black/10 border-y border-black/10">
            {LP.faq.map((item, i) => (
              <div key={item.q}>
                <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left" aria-expanded={openFaq === i}>
                  <span className="text-base font-medium sm:text-lg" style={serif}>{item.q}</span>
                  <ChevronDown className={`size-5 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} style={{ color: ACCENT }} />
                </button>
                <div className={`grid transition-all duration-300 ${openFaq === i ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"}`}>
                  <p className="overflow-hidden text-sm leading-relaxed" style={{ color: `${INK}a6` }}>{item.a}</p>
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
              <a href={waHref()} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-[#1a1509] transition-transform hover:scale-[1.03]" style={{ backgroundColor: ACCENT }}>
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
            <Image src="/lp/bruna-logo.png" alt={LP.name} width={1667} height={258} className="h-10 w-auto" />
            <p className="mt-3 text-sm uppercase tracking-wide" style={{ color: ACCENT }}>{LP.role} · {LP.oab}</p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            {LP.whatsapp && (<a className="inline-flex items-center gap-2 hover:text-white" href={waHref()} target="_blank" rel="noreferrer"><Phone className="size-4" /> WhatsApp</a>)}
            {LP.email && (<a className="inline-flex items-center gap-2 hover:text-white" href={`mailto:${LP.email}`}><Mail className="size-4" /> {LP.email}</a>)}
            {LP.instagram && (<a className="inline-flex items-center gap-2 hover:text-white" href={LP.instagram.startsWith("http") ? LP.instagram : `https://instagram.com/${LP.instagram.replace("@", "")}`} target="_blank" rel="noreferrer"><Instagram className="size-4" /> Instagram</a>)}
            {LP.city && (<span className="inline-flex items-center gap-2"><MapPin className="size-4" /> {LP.city}</span>)}
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-xs text-[#f4efe6]/40">
          © {new Date().getFullYear()} {LP.name} · {LP.brand}. Todos os direitos reservados.
        </div>
      </footer>

      {/* ───────────────── WhatsApp flutuante (design entregue) ───────────────── */}
      <a className="blp-floating" href={waHref()} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} aria-label={`Falar com ${LP.name}`}>
        <span className="blp-float-icon"><WaGlyph /></span>
        <span className="blp-float-body">Fale com {LP.name}<small>Atendimento jurídico trabalhista</small></span>
      </a>
    </div>
  );
}
