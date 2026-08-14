"use client";

import { useEffect, useState } from "react";

const CHAR_DELAY_MS = 32;

/**
 * Efeito de revelação letra por letra pro H1 do Hero. De propósito NÃO muda o comprimento do
 * texto progressivamente (isso mudaria a quebra de linha/centralização do H1 durante a
 * animação, parecendo instável) — o texto inteiro já ocupa seu lugar final desde o primeiro
 * frame, só a opacidade de cada letra anima em sequência.
 *
 * Duas correções importantes sobre a primeira versão:
 *  - Cada PALAVRA vira um `inline-block` (não cada letra) — letras dentro de uma palavra nunca
 *    quebram de linha entre si; só os espaços entre palavras são pontos de quebra válidos. Antes,
 *    embrulhar cada letra em inline-block deixava o navegador livre pra quebrar no meio de
 *    qualquer palavra (ex.: "capí-tulos"), porque cada letra virava sua própria caixa de layout.
 *  - `text` aceita `\n` pra forçar quebra de linha proposital (a headline é o elemento dominante
 *    da tela — a quebra não pode ficar por conta do wrap automático do navegador).
 * Cursor discreto (barra fina) some suavemente depois que a última letra aparece.
 */
export function ProposalTypingHeadline({ text, className }: { text: string; className?: string }) {
  const [started, setStarted] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const totalChars = text.replace(/\n/g, "").length;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setStarted(true));
    const hideCursor = setTimeout(() => setCursorVisible(false), totalChars * CHAR_DELAY_MS + 550);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hideCursor);
    };
  }, [totalChars]);

  let globalIndex = 0;
  const lines = text.split("\n");

  return (
    <h1 className={className} aria-label={text.replace(/\n/g, " ")}>
      <span aria-hidden="true">
        {lines.map((line, lineIndex) => {
          const isLastLine = lineIndex === lines.length - 1;
          return (
            <span key={lineIndex} className="block">
              {line.split(" ").map((word, wordIndex, words) => {
                const isLastWord = wordIndex === words.length - 1;
                return (
                  <span key={wordIndex} className="inline-block whitespace-nowrap">
                    {word.split("").map((char) => {
                      const delay = globalIndex * CHAR_DELAY_MS;
                      globalIndex += 1;
                      return (
                        <span key={delay} className="inline-block transition-opacity duration-300 ease-out" style={{ opacity: started ? 1 : 0, transitionDelay: `${delay}ms` }}>
                          {char}
                        </span>
                      );
                    })}
                    {!isLastWord && " "}
                  </span>
                );
              })}
              {/* Cursor fica preso ao fim da ULTIMA linha -- antes era um sibling depois de todo
                  o bloco de linhas, o que fazia ele (inline, seguindo um bloco) cair pra propria
                  linha e centralizar sozinho. Agora nasce dentro do span da ultima linha. */}
              {isLastLine && (
                <span
                  className="ml-[0.05em] inline-block w-[2px] translate-y-[0.05em] bg-current align-middle transition-opacity duration-500"
                  style={{ opacity: cursorVisible ? 1 : 0, height: "0.8em" }}
                />
              )}
            </span>
          );
        })}
      </span>
    </h1>
  );
}
