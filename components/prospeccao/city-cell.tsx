/**
 * Célula de Cidade da tabela de Oficinas — some sem bairro/endereço nenhum (sem tooltip vazio,
 * como pedido) e mostra os dois em um tooltip só quando há pelo menos um dos dois. CSS puro
 * (`group-hover`), sem nova dependência de tooltip.
 */
export function CityCell({ cidade, bairro, endereco }: { cidade: string; bairro: string; endereco: string }) {
  if (!cidade) return <span className="text-white/30">-</span>;

  const detail = [bairro, endereco].filter(Boolean).join(" — ");
  if (!detail) return <span className="text-white/70">{cidade}</span>;

  return (
    <span className="group relative inline-flex cursor-default items-center border-b border-dotted border-white/25 text-white/70">
      {cidade}
      <span className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 hidden w-max max-w-[260px] whitespace-normal rounded-md border border-white/10 bg-black px-2.5 py-1.5 font-mono text-[11px] leading-snug text-white/80 shadow-xl group-hover:block">
        {detail}
      </span>
    </span>
  );
}
