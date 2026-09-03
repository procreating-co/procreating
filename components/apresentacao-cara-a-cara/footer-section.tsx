/**
 * Rodapé de fechamento — na referência, esta faixa fica DENTRO do Slide 8 ("Comercial"), como a
 * última linha depois do bloco de cotas/contato. Alteração explícita pedida: remover TODA a
 * seção Comercial (título, "Oportunidades & Cotas de Parceria", os 3 cards, botões "Solicitar
 * Proposta"/"Solicitar Aprovação" e o bloco "Entre em Contato" — este último também é
 * "informação de contato comercial"). Sobra só esta faixa final de marca/copyright, que vira o
 * rodapé da página — mesmo fundo `marble-dark` e borda dourada superior do Slide 8 original (o
 * "encerramento" visual continua igual), só sem todo o miolo comercial e com padding vertical de
 * rodapé (não mais o `py-32` de seção inteira, que deixaria um vão vazio enorme).
 */
export function FooterSection() {
  return (
    <section className="cc-marble-dark relative overflow-hidden border-t-2 border-[#D4AF37] py-12">
      <div className="cc-container relative z-10 mx-auto px-6 text-center">
        <div className="cc-slide-in flex flex-col items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#EBD9A8]/50 md:flex-row">
          <span>Cara a Cara com a Beleza</span>
          <span className="hidden text-[#D4AF37] md:inline">◆</span>
          <span>by Dra. Elenita Luzardo</span>
          <span className="hidden text-[#D4AF37] md:inline">◆</span>
          <span>RS Play — Canal 524 Claro</span>
          <span className="hidden text-[#D4AF37] md:inline">◆</span>
          <span>© 2026</span>
        </div>
      </div>
    </section>
  );
}
