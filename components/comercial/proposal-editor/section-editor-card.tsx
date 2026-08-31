"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Eye, EyeOff, Lock, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VideoUploadField } from "@/components/comercial/proposal-editor/video-upload-field";
import {
  MAX_PORTFOLIO_VIDEOS,
  SECTION_TYPE_LABEL,
  type BudgetConfigurator,
  type BudgetConfiguratorAddon,
  type BudgetConfiguratorRemovable,
  type BudgetConfiguratorVideoRange,
  type BudgetTeamRole,
  type PillarItem,
  type ProposalVideo,
} from "@/lib/comercial/proposal-content-types";
import type { ProposalSection } from "@/lib/supabase/types/database";
import { cn } from "@/lib/utils";

const textareaClass =
  "w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

/** Um card por seção — formulário específico pro `section_type` (§24 do plano: editar,
 *  reordenar, ocultar, duplicar, remover). Os 7 tipos espelham os componentes reais de
 *  `components/proposal/**` (Elenita, agora o template padrão) — ver `proposal-content-types.ts`.
 *  Reordenar é por botão (não drag) — mesma decisão de §27 do Task Intelligence (mobile-safe,
 *  sem exigir arrastar); volume de seções por proposta é fixo em 7, drag não paga o custo aqui. */
export function SectionEditorCard({
  section,
  isFirst,
  isLast,
  onChange,
  onMove,
  onToggleVisible,
  onDuplicate,
  onRemove,
}: {
  section: ProposalSection;
  isFirst: boolean;
  isLast: boolean;
  onChange: (content: Record<string, unknown>) => void;
  onMove: (direction: "up" | "down") => void;
  onToggleVisible: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const content = section.content as Record<string, any>;

  function set(patch: Record<string, unknown>) {
    onChange({ ...content, ...patch });
  }

  function setListItem(key: string, index: number, value: string) {
    const list = [...(content[key] ?? [])];
    list[index] = value;
    set({ [key]: list });
  }
  function addListItem(key: string) {
    set({ [key]: [...(content[key] ?? []), ""] });
  }
  function removeListItem(key: string, index: number) {
    set({ [key]: (content[key] ?? []).filter((_: unknown, i: number) => i !== index) });
  }

  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-4", !section.visible && "opacity-50")}>
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => setCollapsed((c) => !c)} className="flex items-center gap-2 text-left text-sm font-medium">
          {SECTION_TYPE_LABEL[section.section_type]}
        </button>
        <div className="flex items-center gap-1">
          <button type="button" disabled={isFirst} onClick={() => onMove("up")} className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30">
            <ChevronUp className="size-3.5" />
          </button>
          <button type="button" disabled={isLast} onClick={() => onMove("down")} className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30">
            <ChevronDown className="size-3.5" />
          </button>
          <button type="button" onClick={onToggleVisible} aria-label={section.visible ? "Ocultar" : "Mostrar"} className="rounded p-1 text-muted-foreground hover:text-foreground">
            {section.visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          </button>
          <button type="button" onClick={onDuplicate} aria-label="Duplicar" className="rounded p-1 text-muted-foreground hover:text-foreground">
            <Copy className="size-3.5" />
          </button>
          <button type="button" onClick={onRemove} aria-label="Remover" className="rounded p-1 text-muted-foreground hover:text-destructive">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="flex flex-col gap-3">
          {/* Campos genéricos — presentes em vários tipos com o mesmo nome/semântica */}
          {"eyebrow" in content && (
            <Field label="Eyebrow">
              <Input value={content.eyebrow ?? ""} onChange={(e) => set({ eyebrow: e.target.value })} />
            </Field>
          )}
          {"title" in content && (
            <Field label="Título">
              <Input value={content.title ?? ""} onChange={(e) => set({ title: e.target.value })} />
            </Field>
          )}
          {"subtitle" in content && (
            <Field label="Subtítulo">
              <textarea rows={2} className={textareaClass} value={content.subtitle ?? ""} onChange={(e) => set({ subtitle: e.target.value })} />
            </Field>
          )}
          {"heading" in content && (
            <Field label="Título da seção">
              <Input value={content.heading ?? ""} onChange={(e) => set({ heading: e.target.value })} />
            </Field>
          )}
          {"paragraph" in content && (
            <Field label="Texto">
              <textarea rows={3} className={textareaClass} value={content.paragraph ?? ""} onChange={(e) => set({ paragraph: e.target.value })} />
            </Field>
          )}

          {/* hero — vídeo de fundo (opcional). Ausente = ProposalHero renderiza exatamente como
              hoje (ProposalHeroAtmosphere) — nunca altera a proposta da Elenita, que não tem
              esse campo preenchido. */}
          {section.section_type === "hero" && (
            <VideoUploadField
              proposalId={section.proposal_id}
              pathPrefix="hero-background"
              label="Vídeo de fundo (opcional)"
              value={content.backgroundVideoUrl ? { url: content.backgroundVideoUrl, orientation: content.backgroundVideoOrientation } : null}
              onChange={(video) => set({ backgroundVideoUrl: video?.url ?? null, backgroundVideoOrientation: video?.orientation ?? null })}
            />
          )}

          {/* pillars — intro + lista de pilares (número/título/descrição/itens, cada item pode
              ser marcado como "trancado" — cadeado no público, serviço ainda não disponível). */}
          {section.section_type === "pillars" && (
            <>
              <Field label="Introdução — eyebrow">
                <Input value={content.intro?.eyebrow ?? ""} onChange={(e) => set({ intro: { ...content.intro, eyebrow: e.target.value } })} />
              </Field>
              <Field label="Introdução — título">
                <Input value={content.intro?.heading ?? ""} onChange={(e) => set({ intro: { ...content.intro, heading: e.target.value } })} />
              </Field>
              <Field label="Introdução — subtítulo">
                <textarea rows={2} className={textareaClass} value={content.intro?.subtitle ?? ""} onChange={(e) => set({ intro: { ...content.intro, subtitle: e.target.value } })} />
              </Field>
              <NumberedCardsField label="Pilares" cards={content.pillars ?? []} withDescription withLocks onChange={(pillars) => set({ pillars })} />
            </>
          )}

          {/* roadmap — lista de etapas (número/título/itens) + dois blocos opcionais novos
              (captação/estratégia por funil), ausentes na Elenita. */}
          {section.section_type === "roadmap" && (
            <>
              <NumberedCardsField label="Etapas" cards={content.stages ?? []} onChange={(stages) => set({ stages })} />
              <RoadmapProductionField block={content.production ?? null} onChange={(production) => set({ production })} />
              <RoadmapFunnelField proposalId={section.proposal_id} funnel={content.funnel ?? null} onChange={(funnel) => set({ funnel })} />
            </>
          )}

          {/* tv_program — passos do fluxo (lista simples de texto) */}
          {section.section_type === "tv_program" && (
            <ListField label="Passos" items={content.steps ?? []} onAdd={() => addListItem("steps")} onChange={(i, v) => setListItem("steps", i, v)} onRemove={(i) => removeListItem("steps", i)} />
          )}

          {/* acquisition — cards (número/título/descrição/itens), mesmo shape de pillars */}
          {section.section_type === "acquisition" && (
            <NumberedCardsField label="Cards" cards={content.cards ?? []} withDescription onChange={(cards) => set({ cards })} />
          )}

          {/* budget — número + label + caption + recorrência, 4 blocos-pilar, incluso/adicionais,
              fluxo, upsell interativo opcional. */}
          {section.section_type === "budget" && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Valor (R$)">
                  <Input type="number" min={0} value={content.heroNumber ?? 0} onChange={(e) => set({ heroNumber: Number(e.target.value) || 0 })} />
                </Field>
                <Field label="Recorrência">
                  <select
                    value={content.recurrence ?? "mensal"}
                    onChange={(e) => set({ recurrence: e.target.value })}
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring"
                  >
                    <option value="mensal">Mensal</option>
                    <option value="unico">Único</option>
                  </select>
                </Field>
                <Field label="Rótulo do valor">
                  <Input value={content.heroLabel ?? ""} onChange={(e) => set({ heroLabel: e.target.value })} />
                </Field>
                <Field label="Legenda">
                  <Input value={content.heroCaption ?? ""} onChange={(e) => set({ heroCaption: e.target.value })} />
                </Field>
              </div>
              <TitledListsField label="Blocos" items={content.pillars ?? []} onChange={(pillars) => set({ pillars })} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Rótulo — incluso">
                  <Input value={content.includedLabel ?? ""} onChange={(e) => set({ includedLabel: e.target.value })} />
                </Field>
                <Field label="Rótulo — adicionais">
                  <Input value={content.additionalLabel ?? ""} onChange={(e) => set({ additionalLabel: e.target.value })} />
                </Field>
              </div>
              <ListField
                label="Itens inclusos"
                items={content.includedItems ?? []}
                onAdd={() => addListItem("includedItems")}
                onChange={(i, v) => setListItem("includedItems", i, v)}
                onRemove={(i) => removeListItem("includedItems", i)}
              />
              <ListField
                label="Itens adicionais"
                items={content.additionalItems ?? []}
                onAdd={() => addListItem("additionalItems")}
                onChange={(i, v) => setListItem("additionalItems", i, v)}
                onRemove={(i) => removeListItem("additionalItems", i)}
              />
              <ListField
                label="Passos do fluxo"
                items={content.flowSteps ?? []}
                onAdd={() => addListItem("flowSteps")}
                onChange={(i, v) => setListItem("flowSteps", i, v)}
                onRemove={(i) => removeListItem("flowSteps", i)}
              />
              <BudgetUpsellField upsell={content.upsell ?? null} onChange={(upsell) => set({ upsell })} />
              <BudgetConfiguratorField configurator={content.configurator ?? null} onChange={(configurator) => set({ configurator })} />
            </div>
          )}

          {/* portfolio — até MAX_PORTFOLIO_VIDEOS vídeos, cada um com upload próprio; orientação
              detectada automaticamente no upload (video-upload-field.tsx), nunca escolhida à
              mão. Seção nova, não faz parte do template original da Elenita. */}
          {section.section_type === "portfolio" && (
            <PortfolioVideosField proposalId={section.proposal_id} videos={content.videos ?? []} onChange={(videos) => set({ videos })} />
          )}
        </div>
      )}
    </div>
  );
}

function PortfolioVideosField({ proposalId, videos, onChange }: { proposalId: string; videos: ProposalVideo[]; onChange: (videos: ProposalVideo[]) => void }) {
  function updateAt(index: number, video: ProposalVideo | null) {
    if (video) {
      onChange(videos.map((v, i) => (i === index ? video : v)));
    } else {
      onChange(videos.filter((_, i) => i !== index));
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>
        Vídeos ({videos.length}/{MAX_PORTFOLIO_VIDEOS})
      </Label>
      {videos.map((video, index) => (
        <VideoUploadField key={index} proposalId={proposalId} pathPrefix={`portfolio-${index}`} label={`Vídeo ${index + 1}`} value={video} onChange={(v) => updateAt(index, v)} />
      ))}
      {videos.length < MAX_PORTFOLIO_VIDEOS && (
        <VideoUploadField
          proposalId={proposalId}
          pathPrefix={`portfolio-${videos.length}`}
          label={`Vídeo ${videos.length + 1}`}
          value={null}
          onChange={(v) => v && onChange([...videos, v])}
        />
      )}
    </div>
  );
}

/** Bloco "N Diárias de Captação" do Roadmap (opcional) — heading + itens (equipe) + entregável.
 *  `null` = não existe ainda; "+ adicionar" cria com valores vazios. */
function RoadmapProductionField({ block, onChange }: { block: { heading: string; items: string[]; deliverable: string } | null; onChange: (block: { heading: string; items: string[]; deliverable: string } | null) => void }) {
  if (!block) {
    return (
      <button type="button" onClick={() => onChange({ heading: "", items: [], deliverable: "" })} className="w-fit text-xs text-muted-foreground hover:text-foreground">
        + Adicionar bloco de captação
      </button>
    );
  }

  function updateItem(index: number, value: string) {
    const items = [...block!.items];
    items[index] = value;
    onChange({ ...block!, items });
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-border/60 p-2.5">
      <Label>Bloco de captação</Label>
      <Input placeholder="Ex.: 03 Diárias de Captação" value={block.heading} onChange={(e) => onChange({ ...block, heading: e.target.value })} className="h-8 text-sm" />
      <div className="flex flex-col gap-1 pl-2">
        {block.items.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <Input placeholder="Ex.: 02 Videomakers" value={item} onChange={(e) => updateItem(index, e.target.value)} className="h-7 text-xs" />
            <button type="button" onClick={() => onChange({ ...block, items: block.items.filter((_, i) => i !== index) })} className="shrink-0 text-muted-foreground hover:text-destructive">
              <Trash2 className="size-3" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => onChange({ ...block, items: [...block.items, ""] })} className="w-fit text-xs text-muted-foreground hover:text-foreground">
          + item da equipe
        </button>
      </div>
      <Input placeholder="Ex.: + Entrega de 09 vídeos estratégicos" value={block.deliverable} onChange={(e) => onChange({ ...block, deliverable: e.target.value })} className="h-8 text-sm" />
      <button type="button" onClick={() => onChange(null)} className="w-fit text-xs text-muted-foreground hover:text-destructive">
        remover bloco de captação
      </button>
    </div>
  );
}

type FunnelStage = { heading: string; objective: string; videos: ProposalVideo[] };
type Funnel = { heading: string; profiles: string[]; stages: FunnelStage[] };

/** Bloco "estratégia por trás" do Roadmap (opcional) — perfis (colunas) + etapas de funil
 *  (Topo/Meio/Fundo), cada uma com objetivo em texto + até 2 vídeos explicativos. */
function RoadmapFunnelField({ proposalId, funnel, onChange }: { proposalId: string; funnel: Funnel | null; onChange: (funnel: Funnel | null) => void }) {
  if (!funnel) {
    return (
      <button
        type="button"
        onClick={() => onChange({ heading: "A Estratégia por trás", profiles: [], stages: [] })}
        className="w-fit text-xs text-muted-foreground hover:text-foreground"
      >
        + Adicionar bloco de estratégia (funil)
      </button>
    );
  }

  function updateProfile(index: number, value: string) {
    const profiles = [...funnel!.profiles];
    profiles[index] = value;
    onChange({ ...funnel!, profiles });
  }

  function updateStage(index: number, patch: Partial<FunnelStage>) {
    onChange({ ...funnel!, stages: funnel!.stages.map((s, i) => (i === index ? { ...s, ...patch } : s)) });
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-md border border-border/60 p-2.5">
      <Label>Bloco de estratégia (funil)</Label>
      <Input placeholder="Ex.: A Estratégia por trás" value={funnel.heading} onChange={(e) => onChange({ ...funnel, heading: e.target.value })} className="h-8 text-sm" />

      <div className="flex flex-col gap-1 pl-2">
        <span className="text-xs text-muted-foreground">Perfis (colunas da matriz)</span>
        {funnel.profiles.map((profile, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <Input placeholder="Ex.: Provocateur" value={profile} onChange={(e) => updateProfile(index, e.target.value)} className="h-7 text-xs" />
            <button type="button" onClick={() => onChange({ ...funnel, profiles: funnel.profiles.filter((_, i) => i !== index) })} className="shrink-0 text-muted-foreground hover:text-destructive">
              <Trash2 className="size-3" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => onChange({ ...funnel, profiles: [...funnel.profiles, ""] })} className="w-fit text-xs text-muted-foreground hover:text-foreground">
          + perfil
        </button>
      </div>

      <div className="flex flex-col gap-2 pl-2">
        <span className="text-xs text-muted-foreground">Etapas de funil</span>
        {funnel.stages.map((stage, index) => (
          <div key={index} className="flex flex-col gap-1.5 rounded-md border border-border/60 p-2">
            <Input placeholder="Ex.: Conteúdo de Topo de Funil" value={stage.heading} onChange={(e) => updateStage(index, { heading: e.target.value })} className="h-7 text-xs" />
            <textarea
              rows={2}
              placeholder="Objetivo dessa etapa"
              className={textareaClass}
              value={stage.objective}
              onChange={(e) => updateStage(index, { objective: e.target.value })}
            />
            <VideoSlotsField
              proposalId={proposalId}
              pathPrefix={`roadmap-funnel-${index}`}
              max={2}
              videos={stage.videos}
              onChange={(videos) => updateStage(index, { videos })}
            />
            <button
              type="button"
              onClick={() => onChange({ ...funnel, stages: funnel.stages.filter((_, i) => i !== index) })}
              className="w-fit text-xs text-muted-foreground hover:text-destructive"
            >
              remover etapa
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange({ ...funnel, stages: [...funnel.stages, { heading: "", objective: "", videos: [] }] })}
          className="w-fit text-xs text-muted-foreground hover:text-foreground"
        >
          + etapa de funil
        </button>
      </div>

      <button type="button" onClick={() => onChange(null)} className="w-fit text-xs text-muted-foreground hover:text-destructive">
        remover bloco de estratégia
      </button>
    </div>
  );
}

/** Até `max` vídeos, reaproveitando `VideoUploadField` (mesmo componente do Hero/Portfólio) —
 *  usado pelas etapas de funil do Roadmap (até 2 cada). */
function VideoSlotsField({ proposalId, pathPrefix, max, videos, onChange }: { proposalId: string; pathPrefix: string; max: number; videos: ProposalVideo[]; onChange: (videos: ProposalVideo[]) => void }) {
  function updateAt(index: number, video: ProposalVideo | null) {
    if (video) onChange(videos.map((v, i) => (i === index ? video : v)));
    else onChange(videos.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-1.5">
      {videos.map((video, index) => (
        <VideoUploadField key={index} proposalId={proposalId} pathPrefix={`${pathPrefix}-${index}`} label={`Vídeo ${index + 1}`} value={video} onChange={(v) => updateAt(index, v)} />
      ))}
      {videos.length < max && (
        <VideoUploadField proposalId={proposalId} pathPrefix={`${pathPrefix}-${videos.length}`} label={`Vídeo ${videos.length + 1} (opcional)`} value={null} onChange={(v) => v && onChange([...videos, v])} />
      )}
    </div>
  );
}

type Upsell = { label: string; unitPrice: number; max: number };

/** Upsell interativo do Orçamento (opcional) — "+ mais vídeos" que soma ao total exibido, sem
 *  nunca mostrar o preço unitário no público (só aqui, no editor, staff vê e ajusta o valor). */
function BudgetUpsellField({ upsell, onChange }: { upsell: Upsell | null; onChange: (upsell: Upsell | null) => void }) {
  if (!upsell) {
    return (
      <button type="button" onClick={() => onChange({ label: "", unitPrice: 0, max: 10 })} className="w-fit text-xs text-muted-foreground hover:text-foreground">
        + Adicionar upsell interativo
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-border/60 p-2.5">
      <Label>Upsell interativo (contador +/- no público, nunca mostra o valor unitário)</Label>
      <Input placeholder="Ex.: Mais vídeos estratégicos" value={upsell.label} onChange={(e) => onChange({ ...upsell, label: e.target.value })} className="h-8 text-sm" />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Preço unitário (R$, só interno)">
          <Input type="number" min={0} value={upsell.unitPrice} onChange={(e) => onChange({ ...upsell, unitPrice: Number(e.target.value) || 0 })} className="h-8 text-sm" />
        </Field>
        <Field label="Máximo de unidades">
          <Input type="number" min={1} value={upsell.max} onChange={(e) => onChange({ ...upsell, max: Math.max(1, Number(e.target.value) || 1) })} className="h-8 text-sm" />
        </Field>
      </div>
      <button type="button" onClick={() => onChange(null)} className="w-fit text-xs text-muted-foreground hover:text-destructive">
        remover upsell
      </button>
    </div>
  );
}

/** Gera um id estável e único o bastante pra uma linha do configurador (addon/removível) — só
 *  precisa ser único dentro da mesma proposta, nunca persiste em outro lugar. */
function newFieldId(): string {
  return Math.random().toString(36).slice(2, 10);
}

const TEAM_ROLE_OPTIONS: { value: BudgetTeamRole["role"]; label: string }[] = [
  { value: "videomaker", label: "Videomaker" },
  { value: "fotografo", label: "Fotógrafo" },
  { value: "drone", label: "Operador de drone" },
  { value: "editor", label: "Editor" },
  { value: "outro", label: "Outro" },
];

/** Configurador de investimento completo (opcional, v2) — "Orçamento" aparece primeiro, sem
 *  âncora/pill de pagamento/linha de escopo na abertura; "O que está incluso" visual (equipe por
 *  ícone) + "Personalize seu pacote" (adicionar E reduzir) SEM preço unitário visível em lugar
 *  nenhum no público (`unitPrice`/`savings` abaixo são só pro cálculo interno — ver
 *  `proposal-budget-configurator.tsx`). Substitui o `upsell` v1 quando presente. */
function BudgetConfiguratorField({ configurator, onChange }: { configurator: BudgetConfigurator | null; onChange: (configurator: BudgetConfigurator | null) => void }) {
  if (!configurator) {
    return (
      <button
        type="button"
        onClick={() =>
          onChange({
            paymentTerms: "",
            baseLocations: 1,
            baseVideos: 1,
            teamRoles: [],
            strategyNote: "",
            addons: [],
            removables: [],
            videoRange: null,
          })
        }
        className="w-fit text-xs text-muted-foreground hover:text-foreground"
      >
        + Adicionar configurador completo (avançado)
      </button>
    );
  }

  function update(patch: Partial<BudgetConfigurator>) {
    onChange({ ...configurator!, ...patch });
  }
  function updateAddon(index: number, patch: Partial<BudgetConfiguratorAddon>) {
    update({ addons: configurator!.addons.map((a, i) => (i === index ? { ...a, ...patch } : a)) });
  }
  function updateRemovable(index: number, patch: Partial<BudgetConfiguratorRemovable>) {
    update({ removables: configurator!.removables.map((r, i) => (i === index ? { ...r, ...patch } : r)) });
  }
  function updateTeamRole(index: number, patch: Partial<BudgetTeamRole>) {
    update({ teamRoles: configurator!.teamRoles.map((t, i) => (i === index ? { ...t, ...patch } : t)) });
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border/60 p-3">
      <Label>Configurador completo (avançado — preço unitário NUNCA aparece no público, só o total)</Label>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Locações no pacote base">
          <Input type="number" min={0} value={configurator.baseLocations} onChange={(e) => update({ baseLocations: Number(e.target.value) || 0 })} className="h-8 text-sm" />
        </Field>
        <Field label="Vídeos no pacote base">
          <Input type="number" min={0} value={configurator.baseVideos} onChange={(e) => update({ baseVideos: Number(e.target.value) || 0 })} className="h-8 text-sm" />
        </Field>
      </div>
      <Field label="Condição de pagamento (aparece em &quot;O que está incluso&quot;)">
        <Input placeholder="Ex.: 50% na aprovação + 50% na entrega" value={configurator.paymentTerms} onChange={(e) => update({ paymentTerms: e.target.value })} className="h-8 text-sm" />
      </Field>
      <Field label="Nota de estratégia por perfil">
        <Input placeholder="Ex.: Estratégia dedicada para cada perfil: Provocateur, 300 e T2 Live" value={configurator.strategyNote} onChange={(e) => update({ strategyNote: e.target.value })} className="h-8 text-sm" />
      </Field>

      {/* Equipe — ícone + rótulo, "O que está incluso" */}
      <div className="flex flex-col gap-1.5 pl-2">
        <span className="text-xs text-muted-foreground">Equipe (ícone + rótulo, em &quot;O que está incluso&quot;)</span>
        {configurator.teamRoles.map((member, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <select
              value={member.role}
              onChange={(e) => updateTeamRole(index, { role: e.target.value as BudgetTeamRole["role"] })}
              className="h-7 rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring"
            >
              {TEAM_ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Input placeholder="Ex.: 2 Videomakers" value={member.label} onChange={(e) => updateTeamRole(index, { label: e.target.value })} className="h-7 text-xs" />
            <button type="button" onClick={() => update({ teamRoles: configurator.teamRoles.filter((_, i) => i !== index) })} className="shrink-0 text-muted-foreground hover:text-destructive">
              <Trash2 className="size-3" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => update({ teamRoles: [...configurator.teamRoles, { role: "outro", label: "" }] })} className="w-fit text-xs text-muted-foreground hover:text-foreground">
          + membro da equipe
        </button>
      </div>

      {/* Adicionar (steppers que somam) */}
      <div className="flex flex-col gap-1.5 pl-2">
        <span className="text-xs text-muted-foreground">Grupo "Adicionar" (steppers que somam ao total)</span>
        {configurator.addons.map((addon, index) => (
          <div key={addon.id} className="flex flex-col gap-1.5 rounded-md border border-border/60 p-2">
            <div className="grid grid-cols-2 gap-1.5">
              <Input placeholder="Título" value={addon.label} onChange={(e) => updateAddon(index, { label: e.target.value })} className="h-7 text-xs" />
              <Input placeholder="Subtítulo (ex.: diária extra)" value={addon.sublabel} onChange={(e) => updateAddon(index, { sublabel: e.target.value })} className="h-7 text-xs" />
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <Input type="number" min={0} placeholder="R$ unitário" value={addon.unitPrice} onChange={(e) => updateAddon(index, { unitPrice: Number(e.target.value) || 0 })} className="h-7 text-xs" />
              <Input placeholder="Ex.: cada" value={addon.unitLabel} onChange={(e) => updateAddon(index, { unitLabel: e.target.value })} className="h-7 text-xs" />
              <Input type="number" min={1} placeholder="Máx." value={addon.max} onChange={(e) => updateAddon(index, { max: Math.max(1, Number(e.target.value) || 1) })} className="h-7 text-xs" />
            </div>
            <select
              value={addon.kind}
              onChange={(e) => updateAddon(index, { kind: e.target.value as BudgetConfiguratorAddon["kind"] })}
              className="h-7 rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring"
            >
              <option value="location">Conta como locação extra (afeta escopo)</option>
              <option value="video">Conta como vídeo extra (afeta escopo)</option>
              <option value="other">Não afeta o escopo — só soma ao total</option>
            </select>
            <button type="button" onClick={() => update({ addons: configurator.addons.filter((_, i) => i !== index) })} className="w-fit text-xs text-muted-foreground hover:text-destructive">
              remover
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => update({ addons: [...configurator.addons, { id: newFieldId(), label: "", sublabel: "", unitPrice: 0, unitLabel: "cada", max: 10, kind: "other" }] })}
          className="w-fit text-xs text-muted-foreground hover:text-foreground"
        >
          + item pra adicionar
        </button>
      </div>

      {/* Reduzir (toggles que subtraem) */}
      <div className="flex flex-col gap-1.5 pl-2">
        <span className="text-xs text-muted-foreground">Grupo "Reduzir" (toggles que subtraem do total)</span>
        {configurator.removables.map((removable, index) => (
          <div key={removable.id} className="flex flex-col gap-1.5 rounded-md border border-border/60 p-2">
            <div className="grid grid-cols-2 gap-1.5">
              <Input placeholder="Título" value={removable.label} onChange={(e) => updateRemovable(index, { label: e.target.value })} className="h-7 text-xs" />
              <Input placeholder="Subtítulo (ex.: remover da equipe)" value={removable.sublabel} onChange={(e) => updateRemovable(index, { sublabel: e.target.value })} className="h-7 text-xs" />
            </div>
            <div className="flex items-center gap-2">
              <Input type="number" min={0} placeholder="Economia (R$)" value={removable.savings} onChange={(e) => updateRemovable(index, { savings: Number(e.target.value) || 0 })} className="h-7 text-xs" />
              <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
                <input type="checkbox" checked={removable.defaultOn} onChange={(e) => updateRemovable(index, { defaultOn: e.target.checked })} />
                incluído por padrão
              </label>
            </div>
            <button type="button" onClick={() => update({ removables: configurator.removables.filter((_, i) => i !== index) })} className="w-fit text-xs text-muted-foreground hover:text-destructive">
              remover
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => update({ removables: [...configurator.removables, { id: newFieldId(), label: "", sublabel: "", savings: 0, defaultOn: true }] })}
          className="w-fit text-xs text-muted-foreground hover:text-foreground"
        >
          + item pra reduzir
        </button>
      </div>

      {/* Range de vídeos (stepper que reduz) */}
      <div className="flex flex-col gap-1.5 pl-2">
        <span className="text-xs text-muted-foreground">Reduzir vídeos entregues (stepper, opcional)</span>
        {configurator.videoRange ? (
          <div className="flex flex-col gap-1.5 rounded-md border border-border/60 p-2">
            <Input placeholder="Título" value={configurator.videoRange.label} onChange={(e) => update({ videoRange: { ...configurator.videoRange!, label: e.target.value } })} className="h-7 text-xs" />
            <Input
              placeholder="Subtítulo (ex.: cada vídeo a menos)"
              value={configurator.videoRange.sublabel}
              onChange={(e) => update({ videoRange: { ...configurator.videoRange!, sublabel: e.target.value } })}
              className="h-7 text-xs"
            />
            <div className="grid grid-cols-3 gap-1.5">
              <Input
                type="number"
                min={0}
                placeholder="R$ economia/un."
                value={configurator.videoRange.unitPrice}
                onChange={(e) => update({ videoRange: { ...configurator.videoRange!, unitPrice: Number(e.target.value) || 0 } })}
                className="h-7 text-xs"
              />
              <Input type="number" min={0} placeholder="Mín." value={configurator.videoRange.min} onChange={(e) => update({ videoRange: { ...configurator.videoRange!, min: Number(e.target.value) || 0 } })} className="h-7 text-xs" />
              <Input
                type="number"
                min={configurator.videoRange.min}
                placeholder="Inicial"
                value={configurator.videoRange.initial}
                onChange={(e) => update({ videoRange: { ...configurator.videoRange!, initial: Number(e.target.value) || 0, max: Math.max(configurator.videoRange!.max, Number(e.target.value) || 0) } })}
                className="h-7 text-xs"
              />
            </div>
            <button type="button" onClick={() => update({ videoRange: null })} className="w-fit text-xs text-muted-foreground hover:text-destructive">
              remover
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => update({ videoRange: { label: "", sublabel: "", unitPrice: 0, min: 1, max: configurator.baseVideos, initial: configurator.baseVideos } })}
            className="w-fit text-xs text-muted-foreground hover:text-foreground"
          >
            + adicionar
          </button>
        )}
      </div>

      <button type="button" onClick={() => onChange(null)} className="w-fit text-xs text-muted-foreground hover:text-destructive">
        remover configurador completo
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ListField({ label, items, onAdd, onChange, onRemove }: { label: string; items: string[]; onAdd: () => void; onChange: (i: number, v: string) => void; onRemove: (i: number) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input value={item} onChange={(e) => onChange(index, e.target.value)} />
          <button type="button" onClick={() => onRemove(index)} className="shrink-0 text-muted-foreground hover:text-destructive">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ))}
      <button type="button" onClick={onAdd} className="w-fit text-xs text-muted-foreground hover:text-foreground">
        + adicionar
      </button>
    </div>
  );
}

type NumberedCard = { number: string; title: string; description?: string; items: PillarItem[] };

/** Cards numerados (número/título/[descrição]/itens) — mesmo shape usado por `pillars.pillars`,
 *  `roadmap.stages` (sem descrição) e `acquisition.cards`. Um componente só, 3 usos. `withLocks`
 *  (só pillars) mostra um botão de cadeado por item — alterna entre string plana e
 *  `{label, locked: true}` (`PillarItem`, `proposal-content-types.ts`); item plano = comportamento
 *  de sempre (Elenita nunca tem item trancado). */
function NumberedCardsField({ label, cards, withDescription, withLocks, onChange }: { label: string; cards: NumberedCard[]; withDescription?: boolean; withLocks?: boolean; onChange: (cards: NumberedCard[]) => void }) {
  function update(index: number, patch: Partial<NumberedCard>) {
    onChange(cards.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }
  function itemLabel(item: PillarItem): string {
    return typeof item === "string" ? item : item.label;
  }
  function itemLocked(item: PillarItem): boolean {
    return typeof item === "object" && item.locked === true;
  }
  function updateItemLabel(cardIndex: number, itemIndex: number, label: string) {
    const items = [...cards[cardIndex].items];
    items[itemIndex] = itemLocked(items[itemIndex]) ? { label, locked: true } : label;
    update(cardIndex, { items });
  }
  function toggleItemLocked(cardIndex: number, itemIndex: number) {
    const items = [...cards[cardIndex].items];
    const current = items[itemIndex];
    items[itemIndex] = itemLocked(current) ? itemLabel(current) : { label: itemLabel(current), locked: true };
    update(cardIndex, { items });
  }
  function addItem(cardIndex: number) {
    update(cardIndex, { items: [...cards[cardIndex].items, ""] });
  }
  function removeItem(cardIndex: number, itemIndex: number) {
    update(cardIndex, { items: cards[cardIndex].items.filter((_, i) => i !== itemIndex) });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {cards.map((card, index) => (
        <div key={index} className="flex flex-col gap-1.5 rounded-md border border-border/60 p-2.5">
          <div className="flex items-center gap-2">
            <Input placeholder="Nº" value={card.number} onChange={(e) => update(index, { number: e.target.value })} className="h-7 w-14 text-sm" />
            <Input placeholder="Título" value={card.title} onChange={(e) => update(index, { title: e.target.value })} className="h-7 text-sm" />
          </div>
          {withDescription && <Input placeholder="Descrição" value={card.description ?? ""} onChange={(e) => update(index, { description: e.target.value })} className="h-7 text-sm" />}
          <div className="flex flex-col gap-1 pl-2">
            {card.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex items-center gap-1.5">
                <Input placeholder="Item" value={itemLabel(item)} onChange={(e) => updateItemLabel(index, itemIndex, e.target.value)} className="h-7 text-xs" />
                {withLocks && (
                  <button
                    type="button"
                    onClick={() => toggleItemLocked(index, itemIndex)}
                    aria-label={itemLocked(item) ? "Destrancar (disponível pro cliente)" : "Trancar (mostra cadeado, ainda não disponível)"}
                    title={itemLocked(item) ? "Trancado — mostra cadeado no público" : "Disponível — clique pra trancar"}
                    className={cn("shrink-0 rounded p-1", itemLocked(item) ? "text-warning" : "text-muted-foreground hover:text-foreground")}
                  >
                    <Lock className="size-3" />
                  </button>
                )}
                <button type="button" onClick={() => removeItem(index, itemIndex)} className="shrink-0 text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addItem(index)} className="w-fit text-xs text-muted-foreground hover:text-foreground">
              + item
            </button>
          </div>
          <button type="button" onClick={() => onChange(cards.filter((_, i) => i !== index))} className="w-fit text-xs text-muted-foreground hover:text-destructive">
            remover card
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...cards, withDescription ? { number: "", title: "", description: "", items: [] } : { number: "", title: "", items: [] }])}
        className="w-fit text-xs text-muted-foreground hover:text-foreground"
      >
        + adicionar
      </button>
    </div>
  );
}

type TitledList = { title: string; items: string[] };

/** Blocos "título + lista de itens", sem número — usado por `budget.pillars` (4 blocos:
 *  Estratégia/Conteúdo/Gestão/Produção na Elenita). */
function TitledListsField({ label, items, onChange }: { label: string; items: TitledList[]; onChange: (items: TitledList[]) => void }) {
  function update(index: number, patch: Partial<TitledList>) {
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }
  function updateItem(blockIndex: number, itemIndex: number, value: string) {
    const list = [...items[blockIndex].items];
    list[itemIndex] = value;
    update(blockIndex, { items: list });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {items.map((block, index) => (
        <div key={index} className="flex flex-col gap-1.5 rounded-md border border-border/60 p-2.5">
          <Input placeholder="Título" value={block.title} onChange={(e) => update(index, { title: e.target.value })} className="h-7 text-sm" />
          <div className="flex flex-col gap-1 pl-2">
            {block.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex items-center gap-1.5">
                <Input
                  placeholder="Item"
                  value={item}
                  onChange={(e) => updateItem(index, itemIndex, e.target.value)}
                  className="h-7 text-xs"
                />
                <button
                  type="button"
                  onClick={() => update(index, { items: block.items.filter((_, i) => i !== itemIndex) })}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => update(index, { items: [...block.items, ""] })} className="w-fit text-xs text-muted-foreground hover:text-foreground">
              + item
            </button>
          </div>
          <button type="button" onClick={() => onChange(items.filter((_, i) => i !== index))} className="w-fit text-xs text-muted-foreground hover:text-destructive">
            remover bloco
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { title: "", items: [] }])} className="w-fit text-xs text-muted-foreground hover:text-foreground">
        + adicionar bloco
      </button>
    </div>
  );
}
