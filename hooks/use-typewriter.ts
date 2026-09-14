"use client";

import { useEffect, useState } from "react";

type TypewriterOptions = {
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
};

type Phase = "typing" | "deleting";

/**
 * Digita/apaga cada palavra de `words` em loop infinito: digita caractere a caractere, pausa
 * `pauseDuration` com a frase completa, apaga caractere a caractere, avança pra próxima palavra
 * (volta pra primeira ao final da lista). Puro `setTimeout`, sem lib externa.
 *
 * Respeita `prefers-reduced-motion`: nesse caso não digita/apaga nada — só troca a palavra
 * inteira a cada `pauseDuration` (o componente que consome o hook decide como fazer a troca
 * visualmente, ex. um fade simples).
 */
export function useTypewriter(
  words: string[],
  { typingSpeed = 70, deletingSpeed = 35, pauseDuration = 3000 }: TypewriterOptions = {},
) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = () => setReducedMotion(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (words.length === 0) return;
    const current = words[wordIndex];

    if (reducedMotion) {
      setText(current);
      const id = setTimeout(() => setWordIndex((i) => (i + 1) % words.length), pauseDuration);
      return () => clearTimeout(id);
    }

    if (phase === "typing") {
      if (text.length < current.length) {
        const id = setTimeout(() => setText(current.slice(0, text.length + 1)), typingSpeed);
        return () => clearTimeout(id);
      }
      const id = setTimeout(() => setPhase("deleting"), pauseDuration);
      return () => clearTimeout(id);
    }

    // phase === "deleting"
    if (text.length > 0) {
      const id = setTimeout(() => setText(text.slice(0, -1)), deletingSpeed);
      return () => clearTimeout(id);
    }
    setWordIndex((i) => (i + 1) % words.length);
    setPhase("typing");
  }, [text, phase, wordIndex, words, reducedMotion, typingSpeed, deletingSpeed, pauseDuration]);

  return { text };
}
