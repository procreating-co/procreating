"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { ProposalVideo, VideoOrientation } from "@/lib/comercial/proposal-content-types";

const BUCKET = "proposal-videos";
// Espelha o `file_size_limit` do bucket (migration `20260902000000_proposal_videos.sql`) — checar
// aqui também dá o erro instantâneo, sem esperar o upload começar pra falhar do lado do Storage.
const MAX_BYTES = 200 * 1024 * 1024;
const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

/** `videoWidth`/`videoHeight` só ficam disponíveis depois de `loadedmetadata` — carrega o
 *  arquivo num `<video>` invisível fora do DOM só pra ler as dimensões, nunca inserido na
 *  árvore. Decide o enquadramento no layout público (`proposal-portfolio.tsx`) uma vez só, no
 *  upload — nunca recalculado no render. */
function detectOrientation(file: File): Promise<VideoOrientation> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.videoWidth >= video.videoHeight ? "horizontal" : "vertical");
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Não foi possível ler o vídeo — arquivo corrompido ou formato não suportado."));
    };
    video.src = URL.createObjectURL(file);
  });
}

/**
 * Upload de vídeo pra proposta (Hero de fundo, ou um item do Portfólio) — vai DIRETO do
 * navegador pro Supabase Storage (`lib/supabase/client.ts`, primeiro uso real), nunca por Server
 * Action: o limite de payload de Function do Vercel é ~4.5MB, bem menor que um vídeo real. A
 * autorização é toda via RLS de `storage.objects` (staff-only), não checagem daqui.
 */
export function VideoUploadField({
  proposalId,
  pathPrefix,
  label,
  value,
  onChange,
}: {
  proposalId: string;
  pathPrefix: string;
  label: string;
  value: ProposalVideo | null;
  onChange: (video: ProposalVideo | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Formato não suportado — use MP4, MOV ou WebM.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Vídeo muito grande — no máximo 200MB.");
      return;
    }

    setUploading(true);
    try {
      const orientation = await detectOrientation(file);
      const extension = file.name.includes(".") ? file.name.split(".").pop() : "mp4";
      const path = `${proposalId}/${pathPrefix}-${Date.now()}.${extension}`;

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path);
      onChange({ url: publicUrl, orientation });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no upload.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    if (!value) return;
    const key = value.url.split(`/${BUCKET}/`).pop();
    if (key) {
      const supabase = createClient();
      await supabase.storage.from(BUCKET).remove([decodeURIComponent(key)]);
    }
    onChange(null);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {value ? (
        <div className="flex items-center gap-2 rounded-md border border-border/60 p-2">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video src={value.url} muted className="h-14 w-24 rounded object-cover" />
          <span className="text-xs text-muted-foreground">{value.orientation === "horizontal" ? "Horizontal" : "Vertical"}</span>
          <button type="button" onClick={handleRemove} className="ml-auto rounded p-1 text-muted-foreground hover:text-destructive">
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <label className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-border/60 px-3 py-2 text-xs text-muted-foreground hover:border-foreground/40 hover:text-foreground">
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          {uploading ? "Enviando..." : "Enviar vídeo"}
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
