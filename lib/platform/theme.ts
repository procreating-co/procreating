/**
 * Theme / Design Tokens — arquitetura pra separar aparência visual da lógica do projeto.
 * Hoje a Pascoal usa um único token de cor (`--client-accent`, `app/globals.css`) e nada mais
 * é configurável — isto NÃO muda (zero alteração em `app/globals.css` ou nos componentes
 * públicos). O que existe aqui é o formato mais amplo que um `ProjectConfig`
 * (`lib/platform/blocks.ts`) poderia usar no futuro, pra projetos que precisem de mais do que
 * uma cor de destaque.
 *
 * Nunca usar cor literal (`#d4af6a`) em componente novo que consome isto — sempre um token.
 */

export type DesignTokens = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  border: string;
  danger: string;
  warning: string;
  success: string;
  info: string;
};

export type ProjectTheme = {
  tokens: DesignTokens;
  typography: {
    fontDisplay: string;
    fontSans: string;
    fontMono: string;
  };
  spacing: {
    radius: string;
  };
  buttons: {
    style: "solid" | "outline" | "ghost";
    radius: string;
  };
  icons: {
    set: string;
  };
  animations: {
    enabled: boolean;
  };
};
