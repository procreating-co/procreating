import path from "node:path";
import { fileURLToPath } from "node:url";

// `base` = raiz do repo: o Tailwind precisa escanear `components/**` (fora de offline/) pra gerar
// as mesmas classes que o app online gera.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const config = {
  plugins: {
    "@tailwindcss/postcss": { base: repoRoot },
  },
};

export default config;
