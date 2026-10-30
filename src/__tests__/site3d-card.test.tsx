import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Site3DCard } from "../components/Site3DCard";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Site 3D real project embedded in the carousel", () => {
  it("opens the Site 3D experience inside a mobile landscape viewport", async () => {
    vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
      matches: query === "(pointer: coarse)",
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ build: "site-3d", base: "/site-3d/" }),
    }));
    const { unmount } = render(<Site3DCard onClose={vi.fn()}/>);
    expect(screen.getByRole("dialog", { name: "Site 3D em modo horizontal" })).toBeInTheDocument();
    expect(await screen.findByTitle("Site 3D — projeto React original integrado ao card"))
      .toHaveAttribute("src", "/site-3d/index.html");
    expect(document.body.querySelector(".mobile-landscape-stage .site3d-live-card")).toBeInTheDocument();
    unmount();
    expect(document.body.querySelector(".mobile-landscape-experience")).toBeNull();
  });


  it("never displays an HTML SPA fallback as the original site", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "text/html" },
      json: async () => ({}),
    }));
    render(<Site3DCard onClose={vi.fn()}/>);
    expect(await screen.findByText(/Site 3D ainda não foi instalado/)).toBeInTheDocument();
    expect(screen.queryByTitle("Site 3D — projeto React original integrado ao card")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Voltar aos projetos" })).toBeInTheDocument();
  });

  it("only mounts the original iframe after verifying ready.json", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ build: "site-3d", base: "/site-3d/", revision: "pinned" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<Site3DCard onClose={vi.fn()}/>);
    const iframe = await screen.findByTitle("Site 3D — projeto React original integrado ao card");
    expect(iframe).toHaveAttribute("src", "/site-3d/index.html");
    expect(iframe).toHaveAttribute("sandbox", "allow-scripts allow-same-origin");
    expect(fetchMock).toHaveBeenCalledWith("/site-3d/ready.json", expect.objectContaining({ cache: "no-store" }));
    fireEvent.click(screen.getByRole("button", { name: "Recarregar" }));
    await waitFor(() => expect(screen.getByTitle("Site 3D — projeto React original integrado ao card")).toBeInTheDocument());
  });

  it("returns to the carousel after the close transition", () => {
    const onClose = vi.fn();
    const complete = vi.fn();
    render(<Site3DCard closing onClose={onClose} onExitComplete={complete}/>);
    fireEvent.click(screen.getByRole("button", { name: "Voltar aos projetos" }));
    expect(onClose).toHaveBeenCalledOnce();
    const card = screen.getByRole("region", { name: "Site 3D — experiência integrada" });
    fireEvent.animationEnd(card, { animationName: "abismo-card-retreat" });
    expect(complete).toHaveBeenCalledOnce();
  });
});
