import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { RealDesktopPreview, CHANGLI_VIDEO_URL, CHANGLI_WALLPAPER_URL } from "../components/desktop/RealDesktopPreview";
import { OFFICIAL_THEMES } from "../stores/themes";

describe("Theme Studio — verified Changli GitHub wallpaper", () => {
  const changli = OFFICIAL_THEMES[0].palette;

  it("uses the owner's real wallpaper and official palette, not the old fake desktop tiles", () => {
    const { container } = render(<RealDesktopPreview palette={changli} themeName="Changli" />);
    const image = container.querySelector(".real-desktop-wallpaper");
    expect(image).toHaveAttribute("src", CHANGLI_WALLPAPER_URL);
    expect(CHANGLI_WALLPAPER_URL).toContain("/dotfiles-Arch/main/wallpapers/changli.png");
    expect(container.querySelector(".theme-desktop-overview")).toBeNull();
    expect(container.querySelector(".theme-desktop-tiles")).toBeNull();
    expect(screen.getByText("CHANGLI")).toBeInTheDocument();
    expect(container.querySelector("video")).toBeNull();
  });

  it("never downloads the 36 MB animation before opting in", () => {
    const { container } = render(<RealDesktopPreview palette={changli} themeName="Changli" />);
    const toggle = screen.getByRole("button", { name: "Ativar wallpaper animado" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(container.querySelector("video")).toBeNull();
    fireEvent.click(toggle);
    const video = container.querySelector("video");
    expect(video).not.toBeNull();
    expect(video?.querySelector("source")).toHaveAttribute("src", CHANGLI_VIDEO_URL);
    expect(screen.getByRole("button", { name: "Pausar wallpaper animado" }))
      .toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Pausar wallpaper animado" }));
    expect(container.querySelector("video")).toBeNull();
  });

  it("uses static image and an accessible warning if the optional MP4 fails", () => {
    const { container } = render(<RealDesktopPreview palette={changli} themeName="Changli" />);
    fireEvent.click(screen.getByRole("button", { name: "Ativar wallpaper animado" }));
    const video = container.querySelector("video");
    expect(video).not.toBeNull();
    fireEvent.error(video!);
    expect(container.querySelector("video")).toBeNull();
    expect(screen.getByText(/MP4 indisponível neste navegador/)).toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute("src", CHANGLI_WALLPAPER_URL);
  });

  it("does not misrepresent an unrelated theme as the Changli desktop", () => {
    const { container } = render(
      <RealDesktopPreview palette={OFFICIAL_THEMES[2].palette} themeName="Emilia" />,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("video")).toBeNull();
    expect(screen.queryByRole("button", { name: "Ativar wallpaper animado" }))
      .not.toBeInTheDocument();
    expect(screen.getByText(/O wallpaper Changli não é aplicado a outros temas/)).toBeInTheDocument();
  });

  it("reports a failed image request instead of pretending the actual wallpaper loaded", () => {
    const { container } = render(<RealDesktopPreview palette={changli} themeName="Changli" />);
    fireEvent.error(container.querySelector("img")!);
    expect(screen.getByText(/Não foi possível carregar o wallpaper do GitHub/))
      .toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
  });
});
