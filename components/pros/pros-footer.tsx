import Image from "next/image";

/**
 * Footer — réplica visual do `FooterSection` compartilhado (mesma imagem de fundo, mesmo
 * tratamento). Sem o parágrafo de razão social/CNPJ que o footer do cliente tem (`legalLine`):
 * é um dado jurídico real da Pascoal, não existe um equivalente da Procreating Co. pra colocar
 * aqui sem inventar informação. Mantém só a marca e a linha de atribuição — que já é a mesma que
 * aparece no footer do cliente, então não é dado novo/inventado.
 */
export function ProsFooter({ brandName }: { brandName: string }) {
  return (
    <footer className="relative bg-black pt-14 text-white lg:pt-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-[oklch(0.09_0.01_260)] via-black/70 to-black lg:h-20" />
      <div className="relative h-[300px] w-full overflow-hidden md:h-[400px]">
        <Image src="/images/footer-earth-gradient.png" alt="Paisagem luminosa encerrando a página" fill sizes="100vw" loading="lazy" className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" />
      </div>
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="py-10">
          <span className="inline-flex font-display text-3xl">{brandName}</span>
          <p className="mt-6 text-sm leading-relaxed text-white/65">Planejado e Executado por Procreating Co. © 2026</p>
        </div>
      </div>
    </footer>
  );
}
