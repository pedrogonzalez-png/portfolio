import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AbismoGameCard } from "../components/AbismoGameCard";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Abismo embedded inside its own carousel card", () => {
  it("never loads an unrelated or missing page as the actual game", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "text/html" },
      json: async () => ({})
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<AbismoGameCard onClose={vi.fn()}/>);
    expect(await screen.findByText(/O jogo ainda não foi instalado/)).toBeInTheDocument();
    expect(screen.queryByTitle("Abismo — jogo Phaser integrado ao card")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/abismo/ready.json",expect.objectContaining({cache:"no-store"}));
  });

  it("loads the real same-origin Phaser game only after the build manifest is found", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json; charset=utf-8" },
      json: async () => ({ build:"abismo", base:"/abismo/", revision:"pinned" })
    }));
    const {container}=render(<AbismoGameCard onClose={vi.fn()}/>);
    const game=await screen.findByTitle("Abismo — jogo Phaser integrado ao card");
    expect(game).toHaveAttribute("src","/abismo/index.html");
    expect(game).toHaveAttribute("sandbox","allow-scripts allow-same-origin");
    expect(container.querySelectorAll("iframe")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button",{name:"Reiniciar jogo"}));
    await waitFor(() => expect(screen.getByTitle("Abismo — jogo Phaser integrado ao card")).toBeInTheDocument());
  });

  it("closes and unmounts its iframe when the card is exited", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok:true,headers:{get:()=>"application/json"},
      json:async()=>({build:"abismo",base:"/abismo/"})
    }));
    const close=vi.fn();
    render(<AbismoGameCard onClose={close}/>);
    await screen.findByTitle("Abismo — jogo Phaser integrado ao card");
    fireEvent.click(screen.getByRole("button",{name:/Fechar jogo/}));
    expect(close).toHaveBeenCalledOnce();
  });
});
