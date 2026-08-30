/**
 * Estado do modal de onboarding — vive só no client (`components/onboarding/onboarding-modal.tsx`),
 * mesmo espírito de `WizardData` (`lib/admin/projects/wizard-types.ts`): a tradução pro formato
 * gravado (o payload jsonb do RPC `close_lead_and_create_client`) é trabalho de
 * `lib/onboarding/actions.ts`, não deste arquivo.
 */

import { todayISO } from "@/lib/date";
import type { LeadWithRelations } from "@/lib/comercial/types";

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

/** CPF tem 11 dígitos, CNPJ tem 14 — só dígitos decide em qual campo o `cnpj_cpf` do lead cai,
 *  sem perguntar de novo qual é qual. Formato inesperado (nem 11 nem 14) cai em `cnpj` (mais
 *  comum nos leads B2B da Procreating) em vez de descartar o dado. */
function splitDocument(value: string | null): { cnpj: string; cpf: string } {
  const digits = (value ?? "").replace(/\D/g, "");
  if (digits.length === 11) return { cnpj: "", cpf: value ?? "" };
  return { cnpj: value ?? "", cpf: "" };
}

/** `lead` já tem tudo que o onboarding pediria de novo — nome, contato, cargo, e-mail, WhatsApp,
 *  CNPJ/CPF, cidade/estado. Pré-preenche pra "não pedir novamente nome, CNPJ, telefone, e-mail
 *  etc." (o próprio pedido do usuário) em vez de abrir o wizard vazio.
 *
 * `proposalOverrides` (opcional, aditivo) — quando o fechamento vem de uma Proposal aceita
 * (`docs/proposal-system-architecture.md`, fluxo Proposal→Client), sobrescreve só o que a seção
 * de Investimento da proposta já definiu (tipo de contrato/valor) — nunca inventa o resto, o
 * staff sempre revisa e confirma nas etapas seguintes do wizard como já acontecia antes. */
export function createInitialOnboardingData(lead: LeadWithRelations, proposalOverrides?: Partial<Pick<OnboardingWizardData, "contractType" | "monthlyValue" | "totalValue">>): OnboardingWizardData {
  const { cnpj, cpf } = splitDocument(lead.cnpj_cpf);
  const address = [lead.city, lead.state].filter(Boolean).join(" / ");
  return {
    clientName: lead.company_name,
    legalName: "",
    tradeName: "",
    cnpj,
    cpf,
    address,
    billingInfo: "",
    contacts: [{ name: lead.contact_name ?? "", roleTitle: lead.role_title ?? "", email: lead.email ?? "", whatsapp: lead.whatsapp ?? "", isPrimary: true }],
    contractType: proposalOverrides?.contractType ?? "recorrente",
    startDate: todayISO(),
    endDate: "",
    monthlyValue: proposalOverrides?.monthlyValue ?? "",
    dueDay: "5",
    autoRenew: false,
    totalValue: proposalOverrides?.totalValue ?? "",
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
