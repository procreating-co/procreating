/**
 * Estado do modal de onboarding — vive só no client (`components/onboarding/onboarding-modal.tsx`),
 * mesmo espírito de `WizardData` (`lib/admin/projects/wizard-types.ts`): a tradução pro formato
 * gravado (o payload jsonb do RPC `close_lead_and_create_client`) é trabalho de
 * `lib/onboarding/actions.ts`, não deste arquivo.
 */

import { todayISO } from "@/lib/date";

export type OnboardingContact = {
  name: string;
  roleTitle: string;
  email: string;
  whatsapp: string;
  isPrimary: boolean;
};

export type OnboardingScopeItem = {
  service: string;
  quantity: string;
  frequency: string;
  deadline: string;
  notes: string;
};

export type ContractType = "pontual" | "recorrente";

export type OnboardingWizardData = {
  // Etapa 1 — dados do cliente
  clientName: string;
  legalName: string;
  tradeName: string;
  cnpj: string;
  cpf: string;
  address: string;
  billingInfo: string;
  contacts: OnboardingContact[];

  // Etapa 2 — contrato
  contractType: ContractType;
  startDate: string;
  endDate: string;
  monthlyValue: string;
  dueDay: string;
  autoRenew: boolean;
  totalValue: string;
  paymentTerms: string;
  specialConditions: string;

  // Etapa 3 — escopo
  scopeItems: OnboardingScopeItem[];

  // Etapa 4 — informações estratégicas
  objective: string;
  targetAudience: string;
  offer: string;
  positioning: string;
  channels: string;
  goals: string;
  commercialNotes: string;
};

export function createInitialOnboardingData(clientNameFallback: string): OnboardingWizardData {
  return {
    clientName: clientNameFallback,
    legalName: "",
    tradeName: "",
    cnpj: "",
    cpf: "",
    address: "",
    billingInfo: "",
    contacts: [{ name: "", roleTitle: "", email: "", whatsapp: "", isPrimary: true }],
    contractType: "recorrente",
    startDate: todayISO(),
    endDate: "",
    monthlyValue: "",
    dueDay: "5",
    autoRenew: false,
    totalValue: "",
    paymentTerms: "",
    specialConditions: "",
    scopeItems: [{ service: "", quantity: "", frequency: "", deadline: "", notes: "" }],
    objective: "",
    targetAudience: "",
    offer: "",
    positioning: "",
    channels: "",
    goals: "",
    commercialNotes: "",
  };
}
