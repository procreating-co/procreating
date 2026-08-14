/**
 * Símbolo oficial da Procreating, recriado como SVG vetorial (não é o JPG original recortado) —
 * duas elipses verticais + um quadrado arredondado com um círculo vazado no centro. `currentColor`
 * em vez de dois arquivos raster (claro/escuro): herda a cor de texto de quem o usa, então
 * funciona sozinho em qualquer fundo (sidebar clara ou escura) sem trocar de variante. Sem o "TM"
 * do arquivo original — é registro de marca, não decoração de produto.
 *
 * O círculo vazado é um `<mask>` (retângulo branco = visível, círculo preto = furo), não um
 * segundo elemento com `fill` de cor de fundo — assim o "buraco" é realmente transparente,
 * mostrando o que estiver atrás, em vez de fingir transparência com a cor do fundo local.
 */
export function ProcreatingMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 460 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <mask id="procreating-mark-ring">
        <rect x="180" y="70" width="260" height="260" rx="65" fill="white" />
        <circle cx="310" cy="200" r="90" fill="black" />
      </mask>
      <ellipse cx="50" cy="200" rx="20" ry="130" fill="currentColor" />
      <ellipse cx="108" cy="200" rx="20" ry="130" fill="currentColor" />
      <rect x="180" y="70" width="260" height="260" rx="65" fill="currentColor" mask="url(#procreating-mark-ring)" />
    </svg>
  );
}
