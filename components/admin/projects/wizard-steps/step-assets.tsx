import { X } from "lucide-react";
import type { WizardData, WizardGalleryFolderDraft } from "@/lib/admin/projects/wizard-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fileInputClass } from "@/components/admin/projects/wizard-steps/shared";

/**
 * Upload real (Cloudflare R2, `docs/project-creation.md` seção 17) ainda não está conectado —
 * os `File` selecionados aqui vivem só em memória do navegador, nunca saem daqui. O propósito
 * desta etapa é validar a UX de seleção/organização de mídia, não mover bytes de verdade.
 */
export function StepAssets({ data, update }: { data: WizardData; update: (patch: Partial<WizardData>) => void }) {
  const assets = data.assets;
  const showVideos = data.capabilities.videos;
  const showGallery = data.capabilities.gallery || data.capabilities.photos;

  function patchAssets(patch: Partial<WizardData["assets"]>) {
    update({ assets: { ...assets, ...patch } });
  }

  function addFolder() {
    patchAssets({ galleryFolders: [...assets.galleryFolders, { id: crypto.randomUUID(), name: "", files: [] }] });
  }
  function updateFolder(id: string, patch: Partial<WizardGalleryFolderDraft>) {
    patchAssets({ galleryFolders: assets.galleryFolders.map((folder) => (folder.id === id ? { ...folder, ...patch } : folder)) });
  }
  function removeFolder(id: string) {
    patchAssets({ galleryFolders: assets.galleryFolders.filter((folder) => folder.id !== id) });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <AssetSlot label="Capa (Hero)" file={assets.hero} onChange={(file) => patchAssets({ hero: file })} accept="image/*,video/*" />
        <AssetSlot label="Logo" file={assets.logo} onChange={(file) => patchAssets({ logo: file })} accept="image/*" />
      </div>

      {showVideos && (
        <div className="flex flex-col gap-4">
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Vídeos</p>
          <AssetSlotMulti
            label="Redes sociais (vertical)"
            files={assets.videosSocial}
            onChange={(files) => patchAssets({ videosSocial: files })}
            accept="video/*"
          />
          <AssetSlot
            label="Aquisição (horizontal)"
            file={assets.videoAcquisition}
            onChange={(file) => patchAssets({ videoAcquisition: file })}
            accept="video/*"
          />
        </div>
      )}

      {showGallery && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Pastas da galeria</p>
            <Button type="button" variant="outline" size="sm" onClick={addFolder}>
              + Adicionar pasta
            </Button>
          </div>
          {assets.galleryFolders.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma pasta ainda.</p>}
          {assets.galleryFolders.map((folder) => (
            <div key={folder.id} className="flex flex-col gap-3 rounded-md border border-border/60 p-4">
              <div className="flex items-center gap-2">
                <Input
                  value={folder.name}
                  onChange={(e) => updateFolder(folder.id, { name: e.target.value })}
                  placeholder="Ex.: Equipe"
                  className="max-w-xs"
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeFolder(folder.id)}>
                  Remover
                </Button>
              </div>
              <AssetSlotMulti label="Fotos" files={folder.files} onChange={(files) => updateFolder(folder.id, { files })} accept="image/*" />
            </div>
          ))}
        </div>
      )}

      {!showVideos && !showGallery && (
        <p className="text-sm text-muted-foreground">
          Nenhuma capability de mídia (Vídeos/Fotos/Galeria) ativada no passo anterior — só Capa e Logo aparecem aqui.
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Upload real pro Cloudflare R2 ainda não está conectado — os arquivos selecionados ficam só na memória do navegador
        nesta fase (ver FASE 4 do roadmap, docs/project-creation.md).
      </p>
    </div>
  );
}

function AssetSlot({
  label,
  file,
  onChange,
  accept,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {file ? (
        <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2 text-sm">
          <span className="truncate">{file.name}</span>
          <button type="button" onClick={() => onChange(null)} className="text-muted-foreground hover:text-foreground" aria-label={`Remover ${label}`}>
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <input type="file" accept={accept} onChange={(e) => onChange(e.target.files?.[0] ?? null)} className={fileInputClass} />
      )}
    </div>
  );
}

function AssetSlotMulti({
  label,
  files,
  onChange,
  accept,
}: {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  accept: string;
}) {
  function addFiles(list: FileList | null) {
    if (!list) return;
    onChange([...files, ...Array.from(list)]);
  }
  function removeAt(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <input
        type="file"
        accept={accept}
        multiple
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
        className={fileInputClass}
      />
      {files.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-xs">
              {file.name}
              <button type="button" onClick={() => removeAt(index)} aria-label={`Remover ${file.name}`}>
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
