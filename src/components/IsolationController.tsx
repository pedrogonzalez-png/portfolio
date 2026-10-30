/**
 * M2 — Controlador de isolamento de viewport.
 * Suspende scroll global, áudio e elementos UI não essenciais enquanto um demo EmbeddedDemo está aberto.
 * Reativa as interações normais do portfólio ao fechar.
 */
import { useEffect, useRef } from "react";

interface IsolationControllerProps {
  active: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

export function IsolationController({ active, onActivate, onDeactivate }: IsolationControllerProps) {
  const prevScroll = useRef<number>(0);

  useEffect(() => {
    if (active) {
      prevScroll.current = window.scrollY;
      const html = document.documentElement;
      html.style.overflowY = "hidden";
      html.style.marginTop = `-${prevScroll.current}px`;
      if (onActivate) onActivate();
    } else {
      const html = document.documentElement;
      html.style.overflowY = "";
      html.style.marginTop = "";
      window.scrollTo({ top: prevScroll.current, behavior: "instant" });
      if (onDeactivate) onDeactivate();
    }
  }, [active, onActivate, onDeactivate]);

  return null; // controla via efeitos
}
