import type { AderenciaIcp, Oficina, OficinaFonte, ParsedOficinaRow } from "@/lib/prospeccao/types";

type CsvField = "nome" | "whatsapp" | "responsavel" | "cidade" | "bairro" | "endereco" | "segmento" | "whatsappLink" | "aderenciaIcp" | "fonte" | "observacoes";

/**
 * Cabeçalhos aceitos por campo — casados sem acento/maiúscula pra mapear automaticamente.
 * Só nome/whatsapp/responsavel são obrigatórios pra um CSV valer (ver `hasRecognizedHeader`
 * abaixo); os demais são enriquecimento opcional — presentes quando o CSV vem da própria
 * Central (export) ou de uma extração como Receita Federal/Google Maps já normalizada.
 */
const HEADER_ALIASES: Record<CsvField, string[]> = {
  nome: ["nome", "oficina", "nome da oficina", "empresa"],
  whatsapp: ["celular", "whatsapp", "telefone", "fone", "contato"],
  responsavel: ["responsavel", "responsável", "contato responsavel", "dono"],
  cidade: ["cidade"],
  bairro: ["bairro"],
  endereco: ["endereco", "endereço"],
  segmento: ["segmento", "segmento/atividade", "atividade", "ramo"],
  whatsappLink: ["whatsapp (link)", "link whatsapp", "whatsapp link", "wa.me"],
  aderenciaIcp: ["aderencia icp", "aderência icp", "icp"],
  fonte: ["fonte"],
  observacoes: ["observacoes", "observações", "obs"],
};

const ICP_ALIASES: Record<string, AderenciaIcp> = {
  alta: "alta",
  media: "media",
  média: "media",
  baixa: "baixa",
};

const FONTE_ALIASES: Record<string, OficinaFonte> = {
  "receita federal (cnpj)": "Receita Federal (CNPJ)",
  "receita federal": "Receita Federal (CNPJ)",
  "google maps": "Google Maps",
  manual: "Manual",
};

function normalizeHeader(header: string) {
  return header
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/** Parser de CSV simples — cobre vírgula/ponto-e-vírgula e campos entre aspas, sem dependência externa. */
function parseCsvLines(text: string): string[][] {
  const delimiter = text.slice(0, text.indexOf("\n")).includes(";") ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim().length > 0));
}

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

/**
 * Garante o DDI 55 num número BR sem ele (10 dígitos = DDD+fixo, 11 = DDD+celular) — mesma
 * regra usada na carga inicial, pra um número colado como "(51) 99247-1996" virar um link
 * wa.me válido igual a um que já veio com o 55 na frente.
 */
function withCountryCode(digits: string) {
  if (!digits) return "";
  if (digits.startsWith("55") && digits.length > 11) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

/** Lê o CSV, mapeia colunas pelos aliases conhecidos e sinaliza linhas inválidas/duplicadas. */
export function parseOficinasCsv(text: string, existing: Oficina[]): ParsedOficinaRow[] {
  const rows = parseCsvLines(text);
  if (rows.length === 0) return [];

  const [headerRow, ...dataRows] = rows;
  const normalizedHeaders = headerRow.map(normalizeHeader);

  const columnIndex = Object.fromEntries((Object.keys(HEADER_ALIASES) as CsvField[]).map((field) => [field, -1])) as Record<CsvField, number>;
  (Object.keys(HEADER_ALIASES) as CsvField[]).forEach((field) => {
    const idx = normalizedHeaders.findIndex((h) => HEADER_ALIASES[field].includes(h));
    columnIndex[field] = idx;
  });

  // Sem cabeçalho reconhecível (ex.: CSV de uma coluna só) — assume nome, celular, responsável nessa ordem.
  const hasRecognizedHeader = columnIndex.nome !== -1 || columnIndex.whatsapp !== -1 || columnIndex.responsavel !== -1;
  const rowsToRead = hasRecognizedHeader ? dataRows : rows;
  if (!hasRecognizedHeader) {
    columnIndex.nome = 0;
    columnIndex.whatsapp = 1;
    columnIndex.responsavel = 2;
  }

  const existingPhones = new Set(existing.map((o) => normalizePhone(o.whatsapp)).filter(Boolean));
  const existingNames = new Set(existing.map((o) => normalizeName(o.nome)));
  const seenInBatch = new Set<string>();

  /** Lê uma célula opcional pelo nome do campo; "-" (convenção da planilha) vira "" — nunca aparece cru na UI. */
  function cell(cells: string[], field: CsvField) {
    const idx = columnIndex[field];
    const raw = (idx >= 0 ? cells[idx] : "")?.trim() ?? "";
    return raw === "-" ? "" : raw;
  }

  return rowsToRead.map((cells) => {
    const nome = cell(cells, "nome");
    const whatsappRaw = cell(cells, "whatsapp");
    const whatsapp = whatsappRaw ? withCountryCode(normalizePhone(whatsappRaw)) : "";
    const responsavel = cell(cells, "responsavel");

    const phoneDigits = normalizePhone(whatsapp);
    const dedupeKey = phoneDigits || normalizeName(nome);
    const duplicate =
      (phoneDigits.length > 0 && existingPhones.has(phoneDigits)) ||
      (phoneDigits.length === 0 && existingNames.has(normalizeName(nome))) ||
      seenInBatch.has(dedupeKey);
    if (dedupeKey) seenInBatch.add(dedupeKey);

    const icpRaw = normalizeHeader(cell(cells, "aderenciaIcp"));
    const fonteRaw = normalizeHeader(cell(cells, "fonte"));

    return {
      nome,
      whatsapp,
      responsavel,
      cidade: cell(cells, "cidade"),
      bairro: cell(cells, "bairro"),
      endereco: cell(cells, "endereco"),
      segmento: cell(cells, "segmento"),
      whatsappLink: cell(cells, "whatsappLink"),
      aderenciaIcp: ICP_ALIASES[icpRaw] ?? "nao_classificado",
      fonte: FONTE_ALIASES[fonteRaw] ?? "Manual",
      observacoes: cell(cells, "observacoes"),
      duplicate,
      invalid: nome.length === 0,
    };
  });
}
