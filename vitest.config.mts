import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Config mínima — só resolve o alias `@/*` (mesmo mapeamento de `tsconfig.json`) pra bater com
 * como o resto do código importa (`@/lib/date`, etc.). Sem `vite-tsconfig-paths` nem outra
 * dependência nova pra isto — um alias só, não precisa de mais que isso. Sem `environment: "jsdom"`
 * de propósito: os testes aqui são de lógica pura (`lib/**`), nunca de componente/DOM.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next"],
  },
});
