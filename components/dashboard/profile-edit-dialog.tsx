"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AccountAvatar, type AccountMenuUser } from "@/components/dashboard/account-avatar";
import { uploadAvatarAction, updateProfileAction } from "@/lib/account/actions";

/**
 * Modal de perfil — pedido explícito ("igual sites profissionais"): antes o avatar/nome só
 * apareciam informativos no menu, sem editar nada além da foto (via item de menu solto). Junta
 * os dois fluxos que já existiam separados (`uploadAvatarAction`, `updateProfileAction` novo)
 * numa tela só — foto grande clicável (like Slack/Notion/Linear) + nome editável. E-mail some só
 * como leitura (é a credencial de login, não um campo de perfil comum — mudar isso é outro
 * fluxo). "XP e conquistas" não migrou pra cá — era só um placeholder desabilitado
 * ("em desenvolvimento"), sem nenhuma informação real por trás; removido também do menu.
 */
export function ProfileEditDialog({ user, open, onOpenChange }: { user: AccountMenuUser; open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user.name);
  const [isUploading, startUpload] = useTransition();
  const [isSaving, startSave] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    startUpload(async () => {
      const result = await uploadAvatarAction((() => {
        const formData = new FormData();
        formData.set("file", file);
        return formData;
      })());
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleSave() {
    setError(null);
    setSaved(false);
    startSave(async () => {
      const result = await updateProfileAction(name);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  const dirty = name.trim() !== user.name;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setError(null);
          setSaved(false);
          setName(user.name);
        }
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>Foto e nome de exibição — visíveis pro resto da equipe.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 py-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="group relative flex size-20 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Trocar foto de perfil"
            title="Trocar foto de perfil"
          >
            <AccountAvatar user={{ name, avatarUrl: user.avatarUrl }} className="size-20 text-lg" />
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="size-6 text-white" />
            </span>
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
            {isUploading ? "Enviando..." : "Alterar foto"}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-name">Nome</Label>
            <Input id="profile-name" value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-email">E-mail</Label>
            <Input id="profile-email" value={user.email} disabled />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {saved && <p className="text-sm text-success">Perfil atualizado.</p>}

        <DialogFooter>
          <Button type="button" onClick={handleSave} disabled={!dirty || isSaving || name.trim().length < 2}>
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
