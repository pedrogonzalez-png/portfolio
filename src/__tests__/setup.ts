import "@testing-library/jest-dom";

// Simulação de matchMedia para os testes com jsdom.
if (
  typeof window !== "undefined" &&
  typeof window.matchMedia !== "function"
) {
  const noop = () => undefined;

  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: noop,
    removeListener: noop,
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => false,
  });
}
