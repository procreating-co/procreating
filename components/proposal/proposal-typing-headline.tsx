"use client";

import { useEffect, useState } from "react";

const CHAR_DELAY_MS = 32;

/**
 * Efeito de revelação letra por letra pro H1 do Hero. De propósito NÃO muda o comprimento do
 * texto progressivamente (isso mudaria a quebra de linha/centralização do H1 durante a
 * animação, parecendo instável) — o texto inteiro já ocupa seu lugar final desde o primeiro
 * frame, só a opacidade de cada letra anima em sequência. Cursor discreto (barra fina) some
 * suavemente depois que a última letra aparece.
 */
export function ProposalTypingHeadline({ text, className }: { text: string; className?: string }) {
  const [started, setStarted] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setStarted(true));
    const hideCursor = setTimeout(() => setCursorVisible(false), text.length * CHAR_DELAY_MS + 550);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hideCursor);
    };
  }, [text]);

  return (
    <h1 className={className} aria-label={text}>
      <span aria-hidden="true">
        {text.split("").map((char, index) => (
          <span
            key={index}
            className="inline-block transition-opacity duration-300 ease-out"
            style={{ opacity: started ? 1 : 0, transitionDelay: `${index * CHAR_DELAY_MS}ms` }}
          >
            {char === " " ? " " : char}
          </span>
        ))}
        <span
          className="ml-[0.05em] inline-block w-[2px] translate-y-[0.05em] bg-current align-middle transition-opacity duration-500"
          style={{ opacity: cursorVisible ? 1 : 0, height: "0.8em" }}
        />
      </span>
    </h1>
  );
}
