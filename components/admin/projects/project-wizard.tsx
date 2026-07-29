"use client";

import { useState } from "react";
import type { AdminClient } from "@/lib/admin/clients/types";
import type { AdminTemplate } from "@/lib/admin/templates/types";
import { createInitialWizardData, type WizardData } from "@/lib/admin/projects/wizard-types";
import { createProjectAction } from "@/app/admin/(protected)/projetos/novo/actions";
import { WizardStepper } from "@/components/admin/projects/wizard-stepper";
import { WizardPublishing, type PublishingPhase } from "@/components/admin/projects/wizard-publishing";
import { StepClient } from "@/components/admin/projects/wizard-steps/step-client";
import { StepProject } from "@/components/admin/projects/wizard-steps/step-project";
import { StepTemplate } from "@/components/admin/projects/wizard-steps/step-template";
import { StepCapabilities } from "@/components/admin/projects/wizard-steps/step-capabilities";
import { StepStructure } from "@/components/admin/projects/wizard-steps/step-structure";
import { StepAssets } from "@/components/admin/projects/wizard-steps/step-assets";
import { StepReview } from "@/components/admin/projects/wizard-steps/step-review";
import { PROJECT_WIZARD_STEPS } from "@/lib/admin/projects/wizard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const LAST_FORM_STEP = 6; // "review" — índices 0-6 são formulário, 7-10 são o painel automático
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function ProjectWizard({
  clients,
  templates,
  existingSlugs,
}: {
  clients: AdminClient[];
  templates: AdminTemplate[];
  existingSlugs: string[];
}) {
  const [data, setData] = useState<WizardData>(() => createInitialWizardData(templates[0]?.id ?? null));
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"form" | PublishingPhase>("form");
  const [publishIndex, setPublishIndex] = useState(7);
  const [createdProject, setCreatedProject] = useState<{ id: string; name: string; slug: string } | null>(null);

  function update(patch: Partial<WizardData>) {
    setData((current) => ({ ...current, ...patch }));
    setError(null);
  }

  function validateStep(index: number): string | null {
    switch (index) {
      case 0:
        if (data.clientMode === "existing" && !data.clientId) return "Selecione um cliente.";
        if (data.clientMode === "new" && !data.newClientName.trim()) return "Informe o nome do novo cliente.";
        return null;
      case 1:
        if (!data.projectName.trim()) return "Informe o nome do projeto.";
        if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(data.slug)) return "Slug inválido — use letras minúsculas, números e hífens.";
        if (existingSlugs.includes(data.slug)) return "Esse slug já está em uso por outro projeto.";
        return null;
      case 2:
        if (!data.templateId) return "Selecione um template.";
        return null;
      default:
        return null;
    }
  }

  function goNext() {
    const validationError = validateStep(stepIndex);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (stepIndex === LAST_FORM_STEP) {
      void startPublishing();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function goBack() {
    setError(null);
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function goToStep(index: number) {
    setError(null);
    setStepIndex(index);
  }

  async function startPublishing() {
    setPhase("publishing");
    setError(null);
    setPublishIndex(7);
    await sleep(500);
    setPublishIndex(8);
    await sleep(500);
    setPublishIndex(9);

    const result = await createProjectAction({
      clientMode: data.clientMode,
      clientId: data.clientId,
      newClientName: data.newClientName,
      projectName: data.projectName,
      templateId: data.templateId,
    });

    if (!result.ok) {
      setPhase("failed");
      setError(result.error);
      return;
    }

    await sleep(400);
    setPublishIndex(10);
    setCreatedProject({ id: result.projectId, name: data.projectName, slug: data.slug });
    setPhase("done");
  }

  const currentStepMeta = PROJECT_WIZARD_STEPS[stepIndex];
  const displayIndex = phase === "form" ? stepIndex : publishIndex;

  return (
    <div className="flex flex-col gap-8">
      <WizardStepper currentIndex={displayIndex} onStepClick={phase === "form" ? goToStep : undefined} />

      <Card className="border-border/60 bg-card/40">
        {phase === "form" && (
          <CardHeader>
            <CardTitle className="font-display text-xl">
              {stepIndex + 1}. {currentStepMeta.label}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          {phase === "form" && stepIndex === 0 && <StepClient data={data} update={update} clients={clients} />}
          {phase === "form" && stepIndex === 1 && <StepProject data={data} update={update} existingSlugs={existingSlugs} />}
          {phase === "form" && stepIndex === 2 && <StepTemplate data={data} update={update} templates={templates} />}
          {phase === "form" && stepIndex === 3 && <StepCapabilities data={data} update={update} />}
          {phase === "form" && stepIndex === 4 && <StepStructure data={data} update={update} templates={templates} />}
          {phase === "form" && stepIndex === 5 && <StepAssets data={data} update={update} />}
          {phase === "form" && stepIndex === 6 && <StepReview data={data} clients={clients} templates={templates} />}

          {phase !== "form" && (
            <WizardPublishing phase={phase} publishIndex={publishIndex} error={error} project={createdProject} onRetry={startPublishing} />
          )}

          {phase === "form" && (
            <>
              {error && (
                <p role="alert" className="mt-4 text-sm text-destructive">
                  {error}
                </p>
              )}
              <div className="mt-8 flex justify-between">
                <Button type="button" variant="outline" onClick={goBack} disabled={stepIndex === 0}>
                  Voltar
                </Button>
                <Button type="button" onClick={goNext}>
                  {stepIndex === LAST_FORM_STEP ? "Criar Projeto" : "Avançar"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
