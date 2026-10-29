import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../stores/ThemeProvider";
import { OFFICIAL_THEMES } from "../stores/themes";
import { contrastRatio, auditThemeContrast, suggestReadableText } from "../services/themeContrast";
import { ThemeStudio } from "../components/ThemeStudio";

beforeEach(()=>localStorage.clear());
afterEach(()=>{localStorage.clear();vi.restoreAllMocks();});

describe("contrast and read-only presets",()=>{
  it("keeps mathematically correct WCAG contrast utilities",()=>{
    expect(contrastRatio("#ffffff","#000000")).toBeCloseTo(21,5);
    expect(contrastRatio("#112233","#112233")).toBe(1);
    expect(contrastRatio("#767676","#FFFFFF")).toBeGreaterThan(4.5);
    expect(()=>contrastRatio("invalid","#FFFFFF")).toThrow();
    const palette={...OFFICIAL_THEMES[0].palette,text:OFFICIAL_THEMES[0].palette.bg};
    expect(auditThemeContrast(palette).some(check=>!check.passes)).toBe(true);
    expect(suggestReadableText(palette)).toBe("#FFFFFF");
  });
  it("does not offer to edit text/background contrast or open the old 2D builder",()=>{
    render(<ThemeProvider><ThemeStudio onClose={()=>{}}/></ThemeProvider>);
    expect(screen.queryByRole("region",{name:"Editar meu tema"})).not.toBeInTheDocument();
    expect(screen.queryByRole("region",{name:"Desktop simulado"})).not.toBeInTheDocument();
    expect(screen.queryByRole("button",{name:"Sugerir texto legível"})).not.toBeInTheDocument();
    expect(screen.queryByRole("button",{name:"Abrir desktop ampliado"})).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Furina"}));
    expect(document.documentElement.dataset.theme).toBe("furina");
  });
});
