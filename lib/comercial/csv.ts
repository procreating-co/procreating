/**
 * Motor de Listas — parser de CSV client-side (sem lib externa; volume de uma importação manual
 * não justifica dependência nova). Reconhece cabeçalhos comuns automaticamente — o usuário nunca
 * monta um "mapeamento de colunas" na mão, só confere o que o sistema já adivinhou.
 *
 * Deliberadamente isolado de `lib/prospeccao/csv.ts` (que existe em `/clients/**`, é a Central de
 * Prospecção de um CLIENTE — Pascoal Bombas — não desta ferramenta interna). Mesmo espírito
 * (alias de cabeçalho, normalização), zero import cruzado entre ERP e entrega de cliente.
 */

export type LeadCsvField = "companyName" | "contactName" | "roleTitle" | "whatsapp" | "email" | "potentialValue" | "cnpjCpf" | "city" | "state";

const HEADER_ALIASES: Record<LeadCsvField, string[]> = {
  companyName: ["empresa", "nome da empresa", "company", "razao social", "razão social", "nome"],
  contactName: ["contato", "nome do contato", "responsavel", "responsável", "contact"],
  roleTitle: ["cargo", "funcao", "função", "role", "title"],
  whatsapp: ["whatsapp", "telefone", "celular", "fone", "phone", "contato whatsapp"],
  email: ["email", "e-mail", "mail"],
  potentialValue: ["valor", "valor potencial", "ticket", "value", "potential value"],
  cnpjCpf: ["cnpj", "cpf", "cnpj/cpf", "documento"],
  city: ["cidade", "city", "municipio", "município"],
  state: ["estado", "uf", "state"],
};

function normalizeHeader(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function detectColumnMapping(headers: string[]): Partial<Record<LeadCsvField, number>> {
  const mapping: Partial<Record<LeadCsvField, number>> = {};
  const normalized = headers.map(normalizeHeader);
  for (const field of Object.keys(HEADER_ALIASES) as LeadCsvField[]) {
    const aliases = HEADER_ALIASES[field].map(normalizeHeader);
    const index = normalized.findIndex((header) => aliases.includes(header));
    if (index !== -1) mapping[field] = index;
  }
  return mapping;
}

/** Parser de CSV simples — separador `,` ou `;` (detectado pela primeira linha), aspas duplas
 *  suportadas (`"valor, com vírgula"`), sem suporte a quebra de linha dentro de campo (fora do
 *  escopo de uma importação de planilha de leads). */
export function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r\n|\n|\r/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const delimiter = lines[0].includes(";") && !lines[0].includes(",") ? ";" : ",";

  function parseLine(line: string): string[] {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (inQuotes) {
        if (char === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        cells.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    cells.push(current.trim());
    return cells;
  }

  const [headerLine, ...rest] = lines;
  return { headers: parseLine(headerLine), rows: rest.map(parseLine) };
}

export type ParsedLeadRow = {
  companyName: string;
  contactName: string;
  roleTitle: string;
  whatsapp: string;
  email: string;
  potentialValue: number | null;
  cnpjCpf: string;
  city: string;
  state: string;
};

export function rowsToLeads(rows: string[][], mapping: Partial<Record<LeadCsvField, number>>): ParsedLeadRow[] {
  return rows
    .map((row) => {
      const get = (field: LeadCsvField) => {
        const index = mapping[field];
        return index != null ? (row[index] ?? "").trim() : "";
      };
      const rawValue = get("potentialValue").replace(/[^\d,.-]/g, "").replace(",", ".");
      return {
        companyName: get("companyName"),
        contactName: get("contactName"),
        roleTitle: get("roleTitle"),
        whatsapp: get("whatsapp"),
        email: get("email"),
        potentialValue: rawValue ? Number(rawValue) || null : null,
        cnpjCpf: get("cnpjCpf"),
        city: get("city"),
        state: get("state"),
      };
    })
    .filter((lead) => lead.companyName.length > 0); // linha sem nome de empresa não vira lead — descartada silenciosamente, não é um "erro" de importação
}

/** Normalização pra deduplicação — mesma ideia pros 3 campos: só dígitos pro telefone (compara os
 *  últimos 10-11, já que DDI/DDD variam em como são digitados), lowercase+trim pros demais. */
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.slice(-11);
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeCompanyName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

/** Link `wa.me` com a mensagem já preenchida — abre o WhatsApp Web/app com o script pronto pra
 *  revisar e enviar; nunca dispara nada sozinho (decisão desta sessão: MVP manual, sem provedor
 *  de envio automático). Prefixa `55` (Brasil) quando o número não já tiver DDI — a base de leads
 *  hoje é toda nacional; sem isso o wa.me trataria o DDD como início de DDI errado. */
export function waMeLink(whatsapp: string, message: string): string {
  const digits = normalizePhone(whatsapp);
  const withCountryCode = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}
