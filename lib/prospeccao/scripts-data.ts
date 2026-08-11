import type { Script, ScriptCategory } from "@/lib/prospeccao/types";

export const SCRIPT_CATEGORY_ORDER: ScriptCategory[] = [
  "primeiro_contato",
  "follow_up",
  "reativacao",
  "parceiros",
  "oportunidades",
  "outros",
];

export const SCRIPT_CATEGORY_LABEL: Record<ScriptCategory, string> = {
  primeiro_contato: "Primeiro contato",
  follow_up: "Follow-up",
  reativacao: "Reativação",
  parceiros: "Parceiros",
  oportunidades: "Oportunidades",
  outros: "Outros",
};

export const INITIAL_SCRIPTS: Script[] = [
  {
    id: "script-1",
    title: "Primeiro contato — Oficina",
    category: "primeiro_contato",
    objective: "Primeira abordagem",
    channel: "whatsapp",
    body: "Olá, {{responsavel}}! Aqui é da Pascoal Bombas. Vi que a {{oficina}} atua em {{cidade}} e queria apresentar nossa linha de bombas — parceria com condições especiais pra revenda e instalação. Podemos conversar 5 minutinhos?",
    updatedAt: "2026-07-20T09:00:00-03:00",
  },
  {
    id: "script-2",
    title: "Primeiro contato — sem responsável identificado",
    category: "primeiro_contato",
    objective: "Abrir conversa quando não sabemos quem decide",
    channel: "whatsapp",
    body: "Olá, pessoal da {{oficina}}! Tudo bem? Aqui é da Pascoal Bombas. Trabalhamos com bombas para revenda e instalação e gostaríamos de apresentar uma parceria pra vocês. Quem seria a melhor pessoa pra conversar sobre isso?",
    updatedAt: "2026-07-20T09:00:00-03:00",
  },
  {
    id: "script-3",
    title: "Follow-up — sem resposta",
    category: "follow_up",
    objective: "Retomar contato depois de silêncio",
    channel: "whatsapp",
    body: "Oi, {{responsavel}}! Passando pra saber se conseguiu ver minha mensagem sobre a parceria da Pascoal Bombas com a {{oficina}}. Consigo te mandar mais informações se fizer sentido pra vocês.",
    updatedAt: "2026-07-22T09:00:00-03:00",
  },
  {
    id: "script-4",
    title: "Follow-up — pós-reunião",
    category: "follow_up",
    objective: "Retomar depois de uma conversa já iniciada",
    channel: "whatsapp",
    body: "{{responsavel}}, tudo certo? Ficou de me dar um retorno sobre a proposta que conversamos pra {{oficina}}. Consigo esclarecer alguma dúvida que tenha ficado?",
    updatedAt: "2026-07-24T09:00:00-03:00",
  },
  {
    id: "script-5",
    title: "Reativação — lead esfriou",
    category: "reativacao",
    objective: "Reabrir conversa com quem ficou sem interesse",
    channel: "whatsapp",
    body: "Oi, {{responsavel}}! Tudo bem? Faz um tempo que conversamos sobre a parceria da Pascoal Bombas com a {{oficina}}. Lançamos condições novas pra revenda — vale a pena eu te contar?",
    updatedAt: "2026-07-25T09:00:00-03:00",
  },
  {
    id: "script-6",
    title: "Parceiros — boas-vindas",
    category: "parceiros",
    objective: "Confirmar parceria fechada e alinhar próximos passos",
    channel: "whatsapp",
    body: "{{responsavel}}, seja bem-vindo(a) como parceiro Pascoal Bombas! A {{oficina}} já está na nossa base de revenda. Qualquer dúvida sobre pedidos ou condições, pode falar direto comigo por aqui.",
    updatedAt: "2026-07-26T09:00:00-03:00",
  },
  {
    id: "script-7",
    title: "Oportunidade — proposta comercial",
    category: "oportunidades",
    objective: "Enviar condições depois de interesse confirmado",
    channel: "whatsapp",
    body: "{{responsavel}}, como combinado, segue o resumo da proposta pra {{oficina}}: condições especiais de revenda, prazo de entrega e suporte direto com a equipe Pascoal. Posso te ligar pra fechar os detalhes?",
    updatedAt: "2026-07-27T09:00:00-03:00",
  },
  {
    id: "script-8",
    title: "Objeção — já tem fornecedor",
    category: "outros",
    objective: "Contornar objeção comum de fornecedor fixo",
    channel: "whatsapp",
    body: "Entendo, {{responsavel}}! Muita gente que hoje é parceira da Pascoal também já tinha fornecedor fixo — o que fez diferença foi comparar condições sem compromisso. Faz sentido eu te mandar uma tabela pra comparar?",
    updatedAt: "2026-07-28T09:00:00-03:00",
  },
];
