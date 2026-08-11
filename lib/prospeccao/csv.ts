import type { Oficina, ParsedOficinaRow } from "@/lib/prospeccao/types";

/** Cabeçalhos aceitos por campo — casados sem acento/maiúscula pra mapear automaticamente. */
const HEADER_ALIASES: Record<"nome" | "whatsapp" | "responsavel", string[]> = {
  nome: ["nome", "oficina", "nome da oficina", "empresa"],
  whatsapp: ["celular", "whatsapp", "telefone", "fone", "contato"],
  responsavel: ["responsavel", "responsável", "contato responsavel", "dono"],
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

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

/** Lê o CSV, mapeia colunas pelos aliases conhecidos e sinaliza linhas inválidas/duplicadas. */
export function parseOficinasCsv(text: string, existing: Oficina[]): ParsedOficinaRow[] {
  const rows = parseCsvLines(text);
  if (rows.length === 0) return [];

  const [headerRow, ...dataRows] = rows;
  const normalizedHeaders = headerRow.map(normalizeHeader);

  const columnIndex: Record<"nome" | "whatsapp" | "responsavel", number> = {
    nome: -1,
    whatsapp: -1,
    responsavel: -1,
  };
  (Object.keys(HEADER_ALIASES) as (keyof typeof HEADER_ALIASES)[]).forEach((field) => {
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

  return rowsToRead.map((cells) => {
    const nome = (columnIndex.nome >= 0 ? cells[columnIndex.nome] : "")?.trim() ?? "";
    const whatsapp = (columnIndex.whatsapp >= 0 ? cells[columnIndex.whatsapp] : "")?.trim() ?? "";
    const responsavel = (columnIndex.responsavel >= 0 ? cells[columnIndex.responsavel] : "")?.trim() ?? "";

    const phoneDigits = normalizePhone(whatsapp);
    const dedupeKey = phoneDigits || normalizeName(nome);
    const duplicate =
      (phoneDigits.length > 0 && existingPhones.has(phoneDigits)) ||
      (phoneDigits.length === 0 && existingNames.has(normalizeName(nome))) ||
      seenInBatch.has(dedupeKey);
    if (dedupeKey) seenInBatch.add(dedupeKey);

    return {
      nome,
      whatsapp,
      responsavel,
      duplicate,
      invalid: nome.length === 0,
    };
  });
}
