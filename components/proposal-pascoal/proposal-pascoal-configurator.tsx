"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, MessageCircle, Pencil } from "lucide-react";
import type { PascoalProposalContent, PerfilId } from "@/lib/pascoal-proposal/types";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

type Screen = "q1" | "q2" | "q3" | "q4" | "q5" | "completo" | "summary";
type AnswerKey = "scope" | "perfil" | "cadence" | "intent" | "upsell";

type Answers = {
  scope: "1" | "2" | "3+" | null;
  perfil: PerfilId | null;
  cadence: "1x" | "2x" | null;
  intent: "visibilidade" | "vendas" | "ambas" | "nenhum" | null;
  upsell: "sim" | "nao" | null;
  completoChosen: boolean;
};

const EMPTY_ANSWERS: Answers = { scope: null, perfil: null, cadence: null, intent: null, upsell: null, completoChosen: false };

function perfilCountFrom(answers: Answers): 0 | 1 | 2 {
  if (answers.scope === "1") return 1;
  if (answers.scope === "2") return 2;
  return 0;
}

function priceIsVisible(answers: Answers): boolean {
  const count = perfilCountFrom(answers);
  if (count === 2) return true; // preço já fica implícito assim que os 2 perfis são confirmados (cadência é a única possível)
  if (count === 1) return answers.cadence !== null;
  return false;
}

function computeTotal(content: PascoalProposalContent, answers: Answers): number {
  const { configurator } = content;
  if (answers.completoChosen) return configurator.completo.price;

  const count = perfilCountFrom(answers);
  let base = configurator.basePrice;
  if (count > 0) {
    const videos = count === 2 ? 4 : answers.cadence === "2x" ? 8 : 4;
    base = configurator.matrixPrices.find((p) => p.perfilCount === count && p.videos === videos)?.price ?? configurator.basePrice;
  }

  let total = base;
  const fronts = configurator.growthFronts;
  if (answers.intent === "visibilidade" || answers.intent === "ambas") total += fronts.find((f) => f.id === "trafego-pago")?.price ?? 0;
  if (answers.intent === "vendas" || answers.intent === "ambas") total += fronts.find((f) => f.id === "prospeccao-ativa")?.price ?? 0;
  return total;
}

/** Um dígito do odômetro/roleta — coluna de 0-9 que desliza verticalmente. ~500ms. */
function OdometerDigit({ digit }: { digit: string }) {
  if (!/[0-9]/.test(digit)) return <span className="inline-block">{digit}</span>;
  const value = Number(digit);
  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden align-bottom">
      <motion.span className="absolute inset-x-0 top-0 flex flex-col items-center" initial={false} animate={{ y: `-${value}em` }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block h-[1em] leading-[1em]">
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function OdometerValue({ value }: { value: number }) {
  return <span className="inline-flex">{currency.format(value).split("").map((char, i) => <OdometerDigit key={i} digit={char} />)}</span>;
}

/** Rótulo curto pra cada resposta já dada — vira breadcrumb clicável. */
function answerLabel(content: PascoalProposalContent, key: AnswerKey, answers: Answers): string | null {
  const q = content.configurator.questions;
  switch (key) {
    case "scope":
      return answers.scope ? q.scope.options.find((o) => o.value === answers.scope)?.label ?? null : null;
    case "perfil":
      return answers.perfil ? q.perfil.options.find((o) => o.value === answers.perfil)?.label ?? null : null;
    case "cadence":
      return answers.cadence ? q.cadence.options.find((o) => o.value === answers.cadence)?.label ?? null : null;
    case "intent":
      return answers.intent ? q.intent.options.find((o) => o.value === answers.intent)?.label ?? null : null;
    case "upsell":
      return answers.upsell ? q.upsell.options.find((o) => o.value === answers.upsell)?.label ?? null : null;
    default:
      return null;
  }
}

function screenForKey(key: AnswerKey): Screen {
  return { scope: "q1", perfil: "q2", cadence: "q3", intent: "q4", upsell: "q5" }[key] as Screen;
}

function buildWhatsAppMessage(content: PascoalProposalContent, answers: Answers, total: number): string {
  const { configurator, whatsapp } = content;
  const lines: string[] = [`Olá, ${whatsapp.ceoFirstName}! Estou entrando em contato através da proposta da Pascoal Bombas e gostaria de avançar com a seguinte estrutura:`, ""];

  if (answers.completoChosen) {
    lines.push("Plano: Plano Completo (03 perfis, incluindo Perfil Expert — Julia Brigidio)");
    lines.push("Conteúdo: 12 vídeos no total");
  } else {
    const count = perfilCountFrom(answers);
    if (count === 1) {
      const perfilName = configurator.perfis.find((p) => p.id === answers.perfil)?.name ?? "";
      lines.push(`Plano: ${perfilName}`);
      lines.push(`Frequência: ${answers.cadence === "2x" ? "2 vídeos por semana" : "1 vídeo por semana"}`);
    } else if (count === 2) {
      lines.push("Plano: Pascoal Zona Sul + Pascoal Zona Norte");
      lines.push("Frequência: 1 vídeo por semana em cada perfil");
    } else {
      lines.push(`Plano: ${configurator.baseLabel}`);
    }
  }

  if (answers.intent === "visibilidade" || answers.intent === "ambas") lines.push("Gestão de Tráfego Pago: selecionado");
  if (answers.intent === "vendas" || answers.intent === "ambas") lines.push("Prospecção Ativa de Empresas: selecionado");

  lines.push("", `Valor estimado: ${currency.format(total)}/mês`, "", "Gostaria de avançar com essa estrutura.");
  return lines.join("\n");
}

function Breadcrumb({ content, answers, onEdit, compact }: { content: PascoalProposalContent; answers: Answers; onEdit: (key: AnswerKey) => void; compact?: boolean }) {
  const keys: AnswerKey[] = ["scope", "perfil", "cadence", "intent", "upsell"];
  const chips = keys.map((key) => ({ key, label: answerLabel(content, key, answers) })).filter((c): c is { key: AnswerKey; label: string } => Boolean(c.label));

  if (chips.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? "justify-center" : "justify-center"}`}>
      {answers.completoChosen && (
        <span className="rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wide" style={{ backgroundColor: `${content.accentColor}18`, color: content.accentColor }}>
          Plano Completo
        </span>
      )}
      {!answers.completoChosen &&
        chips.map(({ key, label }) => (
          <motion.button
            key={key}
            type="button"
            onClick={() => onEdit(key)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-white/50 transition-colors duration-200 hover:border-white/30 hover:text-white/80"
          >
            {label}
            <Pencil className="size-2.5" />
          </motion.button>
        ))}
    </div>
  );
}

function QuestionScreen({ question, options, onSelect }: { question: string; options: { label: string; value: string }[]; onSelect: (value: string) => void }) {
  return (
    <motion.div
      key={question}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col items-center text-center"
    >
      <h3 className="text-balance font-display text-2xl leading-[1.15] text-white sm:text-3xl">{question}</h3>
      <div className="mt-9 flex w-full max-w-md flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:justify-center">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className="flex-1 rounded-lg border border-white/15 px-5 py-3.5 text-sm text-white/85 transition-all duration-200 hover:border-white/35 hover:bg-white/[0.04] sm:min-w-[160px] sm:flex-none"
          >
            {option.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export function ProposalPascoalConfigurator({ content, accent }: { content: PascoalProposalContent; accent: string }) {
  const { configurator, whatsapp, cta } = content;

  const [screen, setScreen] = useState<Screen>("q1");
  const [history, setHistory] = useState<Screen[]>(["q1"]);
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [ctaState, setCtaState] = useState<"idle" | "confirming">("idle");

  const total = computeTotal(content, answers);
  const priceVisible = priceIsVisible(answers) || answers.completoChosen;
  const answeredCount = ["scope", "perfil", "cadence", "intent", "upsell"].filter((k) => answers[k as AnswerKey] !== null).length;
  const progress = Math.min(1, (answeredCount + (screen === "summary" ? 1 : 0)) / 4);

  const goTo = (next: Screen) => {
    setHistory((h) => [...h, next]);
    setScreen(next);
  };

  const goBack = () => {
    setHistory((h) => {
      if (h.length <= 1) return h;
      const nh = h.slice(0, -1);
      setScreen(nh[nh.length - 1]);
      return nh;
    });
  };

  const editFrom = (key: AnswerKey) => {
    setAnswers((a) => {
      const next = { ...a };
      const order: AnswerKey[] = ["scope", "perfil", "cadence", "intent", "upsell"];
      const from = order.indexOf(key);
      order.slice(from).forEach((k) => {
        (next[k] as unknown) = null;
      });
      next.completoChosen = false;
      return next;
    });
    const target = screenForKey(key);
    setHistory((h) => {
      const idx = h.lastIndexOf(target);
      return idx >= 0 ? h.slice(0, idx + 1) : [target];
    });
    setScreen(target);
  };

  const answerScope = (value: string) => {
    const scope = value as Answers["scope"];
    setAnswers((a) => ({ ...a, scope }));
    if (scope === "3+") goTo("completo");
    else if (scope === "1") goTo("q2");
    else goTo("q4"); // "2" — pula Q2 (implícito) e Q3 (única cadência válida com 2 perfis)
  };

  const answerPerfil = (value: string) => {
    setAnswers((a) => ({ ...a, perfil: value as PerfilId }));
    goTo("q3");
  };

  const answerCadence = (value: string) => {
    setAnswers((a) => ({ ...a, cadence: value as Answers["cadence"] }));
    goTo("q4");
  };

  const answerIntent = (value: string) => {
    setAnswers((a) => ({ ...a, intent: value as Answers["intent"] }));
    if (answers.scope === "2") goTo("q5");
    else goTo("summary");
  };

  const answerUpsell = (value: string) => {
    setAnswers((a) => ({ ...a, upsell: value as Answers["upsell"] }));
    if (value === "sim") goTo("completo");
    else goTo("summary");
  };

  const chooseCompleto = () => {
    setAnswers((a) => ({ ...a, completoChosen: true }));
    goTo("summary");
  };

  const handleCta = () => {
    if (ctaState === "confirming") return;
    setCtaState("confirming");
    const message = buildWhatsAppMessage(content, answers, total);
    window.setTimeout(() => {
      window.open(`https://wa.me/${whatsapp.phoneDigits}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      setCtaState("idle");
    }, 700);
  };

  return (
    <section id="configurador" className="scroll-mt-20 border-t border-white/10 bg-black px-6 py-24 text-white lg:px-12 lg:py-32">
      <div className="mx-auto max-w-2xl">
        {/* Indicador de progresso mínimo — barra fina, sem nomear etapas */}
        {screen !== "summary" && (
          <div className="mb-10 h-px w-full bg-white/10">
            <motion.div className="h-full" style={{ backgroundColor: accent }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.3, ease: "easeOut" }} />
          </div>
        )}

        {/* Preço — invisível até a primeira resposta com valor, depois flutua discreto num canto */}
        <div className="relative">
          <AnimatePresence>
            {priceVisible && screen !== "summary" && screen !== "completo" && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute -top-2 right-0 flex flex-col items-end"
              >
                <span className="font-mono text-[9px] uppercase tracking-wide text-white/30">Investimento</span>
                <span className="font-display tabular-nums text-white" style={{ fontSize: answeredCount >= 4 ? "1.5rem" : "1.125rem" }}>
                  <OdometerValue value={total} />
                  <span className="ml-1 font-mono text-[10px] font-normal text-white/35">/mês</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {screen !== "summary" && (
            <div className="mb-8">
              <Breadcrumb content={content} answers={answers} onEdit={editFrom} />
            </div>
          )}

          <AnimatePresence mode="wait">
            {screen === "q1" && <QuestionScreen key="q1" question={configurator.questions.scope.question} options={configurator.questions.scope.options} onSelect={answerScope} />}
            {screen === "q2" && <QuestionScreen key="q2" question={configurator.questions.perfil.question} options={configurator.questions.perfil.options} onSelect={answerPerfil} />}
            {screen === "q3" && <QuestionScreen key="q3" question={configurator.questions.cadence.question} options={configurator.questions.cadence.options} onSelect={answerCadence} />}
            {screen === "q4" && <QuestionScreen key="q4" question={configurator.questions.intent.question} options={configurator.questions.intent.options} onSelect={answerIntent} />}
            {screen === "q5" && <QuestionScreen key="q5" question={configurator.questions.upsell.question} options={configurator.questions.upsell.options} onSelect={answerUpsell} />}

            {screen === "completo" && (
              <motion.div key="completo" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3, ease: "easeOut" }} className="border-2 p-6 text-center sm:p-8" style={{ borderColor: accent }}>
                <h3 className="text-balance font-display text-2xl text-white sm:text-3xl">{configurator.completo.headline}</h3>
                <p className="mx-auto mt-3 max-w-sm text-balance text-sm leading-relaxed text-white/60">{configurator.completo.description}</p>
                <p className="mx-auto mt-4 max-w-sm text-balance text-xs leading-relaxed text-white/40">{configurator.completo.detailsLine}</p>

                <div className="mt-7 flex flex-col items-center">
                  <p className="font-display text-4xl tabular-nums text-white sm:text-5xl">
                    <OdometerValue value={configurator.completo.price} />
                    <span className="ml-1.5 font-mono text-sm font-normal text-white/40">/mês</span>
                  </p>
                  <p className="mt-1.5 font-mono text-xs text-white/35">≈ {currency.format(Math.round(configurator.completo.price / 3 / 100) * 100)} por perfil</p>
                </div>

                <p className="mx-auto mt-5 max-w-sm text-balance text-xs leading-relaxed text-white/35">{configurator.completo.mediaNote}</p>

                <div className="mt-8 flex flex-col items-center gap-3">
                  <button type="button" onClick={chooseCompleto} className="rounded-full px-7 py-3 text-sm font-medium text-black transition-transform duration-200 hover:scale-[1.03]" style={{ backgroundColor: accent }}>
                    {configurator.completo.chooseLabel}
                  </button>
                  <button type="button" onClick={goBack} className="font-mono text-xs uppercase tracking-wide text-white/35 transition-colors hover:text-white/60">
                    {configurator.completo.backLabel}
                  </button>
                </div>
              </motion.div>
            )}

            {screen === "summary" && (
              <motion.div key="summary" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="flex flex-col items-center text-center">
                <p className="font-mono text-xs uppercase tracking-wide text-white/40">{configurator.summary.heading}</p>

                <div className="mt-5">
                  <Breadcrumb content={content} answers={answers} onEdit={editFrom} />
                </div>

                <p className="mt-10 flex items-baseline gap-2 font-display text-5xl tabular-nums text-white sm:text-6xl">
                  <OdometerValue value={total} />
                  <span className="font-mono text-base font-normal text-white/40">/mês</span>
                </p>

                {answers.completoChosen && <p className="mt-4 max-w-sm text-balance text-xs leading-relaxed text-white/35">{configurator.summary.mediaWarning}</p>}

                <button
                  type="button"
                  onClick={handleCta}
                  disabled={ctaState === "confirming"}
                  className="mt-9 inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-medium text-black transition-all duration-300 hover:scale-[1.03] disabled:opacity-80"
                  style={{ backgroundColor: accent }}
                >
                  {ctaState === "confirming" ? (
                    <>
                      <Check className="size-4" /> Confirmado — abrindo WhatsApp
                    </>
                  ) : (
                    <>
                      <MessageCircle className="size-4" /> {cta.label}
                    </>
                  )}
                </button>
                <p className="mt-4 text-xs text-white/35">{cta.note}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
