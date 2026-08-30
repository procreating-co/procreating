"use client";

import { useEffect, useState, useTransition } from "react";
import { recordProposalViewAction, respondPublicProposalAction, type PublicProposal } from "@/lib/comercial/public-proposal-actions";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const RESPONDABLE_STATUSES = new Set(["sent", "negotiating", "revision_requested"]);

/**
 * Experiência pública premium (§17 do plano) — referência visual: proposta da Elenita
 * (`components/proposal/**`, intocada). Namespace novo (`proposal-public`) de propósito: não é
 * o mesmo sistema, é inspirado nele — schema genérico por `section_type`, não o
 * `ProposalContent` bespoke dela. Fundo escuro, tipografia grande, uma seção por vez, sem
 * excesso de cor — mesma sensação, conteúdo genérico.
 */
export function ProposalPublicView({ slug, proposal }: { slug: string; proposal: NonNullable<PublicProposal> }) {
  const [status, setStatus] = useState(proposal.status);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    recordProposalViewAction(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function respond(response: "accepted" | "rejected") {
    startTransition(async () => {
      const ok = await respondPublicProposalAction(slug, response);
      if (ok) setStatus(response);
    });
  }

  const accent = proposal.accentColor || "#D4AF37";

  return (
    <main className="min-h-screen bg-black text-white" style={{ ["--proposal-accent" as string]: accent }}>
      <div className="mx-auto flex max-w-3xl flex-col gap-24 px-6 py-24 sm:px-10">
        {proposal.sections.map((section, index) => (
          <Section key={index} sectionType={section.sectionType} content={section.content} accent={accent} />
        ))}

        <div className="flex flex-col items-center gap-4 border-t border-white/10 pt-16 text-center">
          {status === "accepted" ? (
            <p className="text-lg" style={{ color: accent }}>
              Proposta aceita — em breve entraremos em contato.
            </p>
          ) : status === "rejected" ? (
            <p className="text-lg text-white/60">Proposta recusada.</p>
          ) : RESPONDABLE_STATUSES.has(status) ? (
            <div className="flex flex-wrap justify-center gap-4">
              <button
                type="button"
                disabled={isPending}
                onClick={() => respond("accepted")}
                className="rounded-full px-8 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: accent }}
              >
                Aceitar proposta
              </button>
              <button type="button" disabled={isPending} onClick={() => respond("rejected")} className="rounded-full border border-white/20 px-8 py-3 text-sm text-white/70 hover:text-white">
                Recusar
              </button>
            </div>
          ) : (
            <p className="text-sm text-white/40">Proposta {status === "expired" ? "expirada" : status}.</p>
          )}
        </div>
      </div>
    </main>
  );
}

function Section({ sectionType, content, accent }: { sectionType: string; content: Record<string, any>; accent: string }) {
  switch (sectionType) {
    case "hero":
      return (
        <section className="flex flex-col gap-4 text-center">
          {content.eyebrow && (
            <p className="text-xs uppercase tracking-[0.3em]" style={{ color: accent }}>
              {content.eyebrow}
            </p>
          )}
          <h1 className="font-display text-4xl leading-tight sm:text-6xl">{content.title}</h1>
          {content.subtitle && <p className="text-lg text-white/60">{content.subtitle}</p>}
        </section>
      );
    case "context":
    case "conditions":
      return (
        <section className="flex flex-col gap-3">
          {content.heading && <h2 className="font-display text-2xl sm:text-3xl">{content.heading}</h2>}
          {content.body && <p className="whitespace-pre-line text-white/70">{content.body}</p>}
        </section>
      );
    case "diagnosis":
      return (
        <section className="flex flex-col gap-4">
          {content.heading && <h2 className="font-display text-2xl sm:text-3xl">{content.heading}</h2>}
          {content.body && <p className="text-white/70">{content.body}</p>}
          {content.points?.length > 0 && (
            <ul className="flex flex-col gap-2">
              {content.points.map((point: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-white/80">
                  <span style={{ color: accent }}>—</span> {point}
                </li>
              ))}
            </ul>
          )}
        </section>
      );
    case "strategy":
      return (
        <section className="flex flex-col gap-6">
          {content.heading && <h2 className="font-display text-2xl sm:text-3xl">{content.heading}</h2>}
          {content.body && <p className="text-white/70">{content.body}</p>}
          {content.pillars?.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {content.pillars.map((pillar: { title: string; description: string }, i: number) => (
                <div key={i} className="rounded-xl border border-white/10 p-5">
                  <p className="font-medium" style={{ color: accent }}>
                    {pillar.title}
                  </p>
                  <p className="mt-1 text-sm text-white/60">{pillar.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      );
    case "services":
      return (
        <section className="flex flex-col gap-4">
          {content.heading && <h2 className="font-display text-2xl sm:text-3xl">{content.heading}</h2>}
          {content.items?.length > 0 && (
            <div className="flex flex-col divide-y divide-white/10">
              {content.items.map((item: { title: string; description: string }, i: number) => (
                <div key={i} className="py-4">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-white/60">{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      );
    case "deliverables":
      return (
        <section className="flex flex-col gap-3">
          {content.heading && <h2 className="font-display text-2xl sm:text-3xl">{content.heading}</h2>}
          {content.items?.length > 0 && (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {content.items.map((item: string, i: number) => (
                <li key={i} className="rounded-lg border border-white/10 px-4 py-3 text-sm text-white/80">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </section>
      );
    case "investment":
      return (
        <section className="flex flex-col items-center gap-4 text-center">
          {content.heading && <h2 className="font-display text-2xl sm:text-3xl">{content.heading}</h2>}
          <p className="font-display text-5xl" style={{ color: accent }}>
            {currencyFormatter.format(content.value ?? 0)}
            {content.recurrence === "mensal" && <span className="text-lg text-white/50">/mês</span>}
          </p>
          {content.notes && <p className="max-w-md text-sm text-white/50">{content.notes}</p>}
        </section>
      );
    case "testimonial":
      return (
        <section className="flex flex-col items-center gap-3 text-center">
          <p className="font-display text-xl italic text-white/80">&ldquo;{content.quote}&rdquo;</p>
          <p className="text-sm text-white/50">
            {content.author}
            {content.role && ` · ${content.role}`}
          </p>
        </section>
      );
    case "cta":
      return (
        <section className="flex flex-col items-center gap-2 text-center">
          {content.heading && <h2 className="font-display text-3xl">{content.heading}</h2>}
          {content.note && <p className="text-sm text-white/50">{content.note}</p>}
        </section>
      );
    case "footer":
      return <footer className="text-center text-xs text-white/30">{content.text}</footer>;
    default:
      return content.heading || content.body ? (
        <section className="flex flex-col gap-3">
          {content.heading && <h2 className="font-display text-2xl">{content.heading}</h2>}
          {content.body && <p className="text-white/70">{content.body}</p>}
        </section>
      ) : null;
  }
}
