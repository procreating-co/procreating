import type { Oficina } from "@/lib/prospeccao/types";

/** Placeholders reconhecidos nos scripts — mostrados como dica no editor. */
export const SCRIPT_VARIABLES: { token: string; description: string }[] = [
  { token: "{{responsavel}}", description: "Nome do responsável (cai pro nome da oficina se não houver)" },
  { token: "{{oficina}}", description: "Nome da oficina" },
  { token: "{{cidade}}", description: "Cidade da oficina" },
];

/**
 * Substitui as variáveis de um script pelos dados do lead. `{{responsavel}}` nunca vira
 * "undefined" — sem responsável cadastrado, cai pro nome da oficina (ex.: "Olá, pessoal da
 * Oficina do Zé!" continua soando natural mesmo sem `{{responsavel}}` == "Oficina do Zé").
 */
export function renderScriptTemplate(body: string, oficina: Pick<Oficina, "nome" | "cidade" | "responsavel">) {
  const responsavel = oficina.responsavel.trim() || oficina.nome;
  return body
    .replaceAll("{{responsavel}}", responsavel)
    .replaceAll("{{oficina}}", oficina.nome)
    .replaceAll("{{cidade}}", oficina.cidade || "");
}

/** Link direto pro WhatsApp já com a mensagem preenchida — só dígitos no telefone. */
export function buildWhatsAppUrl(whatsapp: string, message: string) {
  const digits = whatsapp.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/**
 * Número a usar pro WhatsApp: prioriza `whatsappLink` (validado na importação — só existe
 * quando o telefone é celular/WhatsApp de verdade) e cai pro `whatsapp` cru quando ausente.
 * `buildWhatsAppUrl` extrai os dígitos de qualquer um dos dois formatos (link completo ou
 * número cru), então basta repassar o resultado direto pra ela.
 */
export function resolveWhatsAppNumber(oficina: Pick<Oficina, "whatsapp" | "whatsappLink">) {
  return oficina.whatsappLink || oficina.whatsapp;
}
