/**
 * Cliente = a empresa/pessoa que contrata a Procreating (ex.: "Pascoal Bombas",
 * "Dra. Elenita"). Deliberadamente minimalista — sem e-mail/telefone/etc. até existir uso
 * real pra esses campos. Um cliente pode ter vários `AdminProject` (`lib/admin/projects/types.ts`,
 * relação via `AdminProject.clientId`).
 */
export type AdminClient = {
  id: string;
  name: string;
  /** ISO 8601 */
  createdAt: string;
};
