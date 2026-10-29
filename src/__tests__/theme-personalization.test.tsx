import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../stores/ThemeProvider";
import { OFFICIAL_THEMES } from "../stores/themes";
import { ThemeStudio } from "../components/ThemeStudio";
import { readCustomThemes, writeCustomThemes } from "../services/customThemes";

beforeEach(()=>localStorage.clear());
afterEach(()=>{localStorage.clear();vi.restoreAllMocks();});

describe("retired custom theme workflow",()=>{
  it("keeps historical data without exposing legacy edit/duplicate controls",()=>{
    const legacy={...OFFICIAL_THEMES[0],kind:"custom" as const,id:"custom-test-preset",
      name:"Arquivado",basedOnThemeId:"changli"};
    writeCustomThemes([legacy]);
    expect(readCustomThemes()).toHaveLength(1);
    render(<ThemeProvider><ThemeStudio onClose={()=>{}}/></ThemeProvider>);
    expect(screen.queryByRole("button",{name:/Duplicar/})).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox",{name:"Nome do meu tema"})).not.toBeInTheDocument();
    expect(screen.getByRole("button",{name:"Changli"})).toBeInTheDocument();
    expect(readCustomThemes()).toHaveLength(1);
  });
  it("does not apply previously saved custom themes; accepts only finished presets",()=>{
    localStorage.setItem("portfolio.theme.active.v1","custom-old-theme");
    render(<ThemeProvider><ThemeStudio onClose={()=>{}}/></ThemeProvider>);
    expect(document.documentElement.dataset.theme).toBe("changli");
    expect(screen.getByRole("button",{name:"Hiyuki"})).toBeInTheDocument();
  });
  it("color changes are independent of the chosen official theme and never create a custom copy",()=>{
    render(<ThemeProvider><ThemeStudio onClose={()=>{}}/></ThemeProvider>);
    fireEvent.change(screen.getByLabelText("Cor de destaque"),{target:{value:"#3355aa"}});
    fireEvent.click(screen.getByRole("button",{name:"Emilia"}));
    expect(document.documentElement.dataset.theme).toBe("emilia");
    expect(document.documentElement.style.getPropertyValue("--color-accent-primary")).toBe("#3355aa");
    expect(readCustomThemes()).toEqual([]);
  });
});
