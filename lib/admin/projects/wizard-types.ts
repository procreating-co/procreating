import type { CapabilityKey } from "@/lib/supabase/types/database";

export { slugify } from "@/lib/admin/format";

/**
 * Estado do Wizard — vive só no client (`components/admin/projects/project-wizard.tsx`), nunca
 * é o formato gravado (isso é `ProjectConfig`/`Block`, `lib/platform/blocks.ts` — a tradução
 * `WizardData` → `ProjectConfig` é trabalho de quando o Supabase estiver conectado). Arquivos
 * (`File`) só existem em memória do navegador nesta fase — não há upload real (R2 ainda não
 * conectado, ver `docs/project-creation.md`, seção 17).
 */

export type WizardGalleryFolderDraft = {
  id: string;
  name: string;
  files: File[];
};

export type WizardAssetsDraft = {
  hero: File | null;
  logo: File | null;
  videosSocial: File[];
  videoAcquisition: File | null;
  galleryFolders: WizardGalleryFolderDraft[];
};

export type WizardData = {
  clientMode: "existing" | "new";
  clientId: string | null;
  newClientName: string;

  projectName: string;
  slug: string;
  slugTouched: boolean;

  templateId: string | null;

  capabilities: Record<CapabilityKey, boolean>;

  structureMode: "default" | "custom";

  assets: WizardAssetsDraft;
};

export function createInitialWizardData(defaultTemplateId: string | null): WizardData {
  return {
    clientMode: "existing",
    clientId: null,
    newClientName: "",
    projectName: "",
    slug: "",
    slugTouched: false,
    templateId: defaultTemplateId,
    capabilities: {
      gallery: false,
      photos: false,
      videos: false,
      downloads: false,
      prospection: false,
      traffic: false,
      analytics: false,
      members_area: false,
      landing: false,
      password_protection: false,
      custom_modules: false,
    },
    structureMode: "default",
    assets: {
      hero: null,
      logo: null,
      videosSocial: [],
      videoAcquisition: null,
      galleryFolders: [],
    },
  };
}

