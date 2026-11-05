import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import CoreExperience from "../features/the-core/CoreExperience";
import { CATEGORIES, INITIAL_BUILD, checkBuild, installPart } from "../features/the-core/coreModel";

vi.mock("../features/the-core/CoreScene", () => ({
  default: () => <div data-testid="core-scene-stub">Visualização 3D</div>,
}));

beforeEach(() => localStorage.clear());

describe("THE CORE — protótipo vertical", () => {
  it("verifica compatibilidade e montagem incompleta sem inventar benchmarks", () => {
    expect(checkBuild(INITIAL_BUILD).ready).toBe(true);
    expect(checkBuild(installPart(INITIAL_BUILD, "r5-7600", "cpu")).issues)
      .toContain("CPU AM5 não encaixa na placa-mãe AM4.");
    expect(checkBuild(installPart(INITIAL_BUILD, "ddr5", "memory")).issues)
      .toContain("Memória DDR5 não é compatível com os slots DDR4.");
    const removed = installPart(INITIAL_BUILD, null, "motherboard");
    expect(checkBuild(removed).ready).toBe(false);
    expect(CATEGORIES).toHaveLength(5);
  });

  it("abre a partir de Saberes e mantém a página desbloqueada ao sair", async () => {
    const previous = document.body.style.overflow;
    render(<CoreExperience />);
    expect(screen.getByRole("region", { name: "Saberes — THE CORE" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Explorar THE CORE/ }));
    expect(await screen.findByRole("dialog", { name: /THE CORE/ })).toBeInTheDocument();
    expect(await screen.findByTestId("core-scene-stub")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.click(screen.getByRole("button", { name: /Fechar THE CORE/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe(previous);
  });

  it("bloqueia encaixe AM5 sobre B550 e reconhece uma configuração coerente", async () => {
    render(<CoreExperience />);
    fireEvent.click(screen.getByRole("button", { name: /Explorar THE CORE/ }));
    fireEvent.click(screen.getByRole("button", { name: "Montagem" }));
    fireEvent.change(screen.getByLabelText("Peça projetada"), { target: { value: "r5-7600" } });
    fireEvent.click(screen.getByRole("button", { name: /Encaixar peça/ }));
    expect(screen.getByRole("status")).toHaveTextContent(/Encaixe bloqueado: CPU AM5/);
    expect(screen.getByText("Ryzen 5 5600")).toBeInTheDocument();
    // Uma montagem livre pode ser feita em qualquer ordem, removendo peças antes.
    fireEvent.click(screen.getByRole("button", { name: "Remover do encaixe" }));
    fireEvent.change(screen.getByLabelText("Categoria de componente"), { target: { value: "motherboard" } });
    fireEvent.click(screen.getByRole("button", { name: "Remover do encaixe" }));
    fireEvent.change(screen.getByLabelText("Categoria de componente"), { target: { value: "memory" } });
    fireEvent.click(screen.getByRole("button", { name: "Remover do encaixe" }));
    fireEvent.change(screen.getByLabelText("Categoria de componente"), { target: { value: "motherboard" } });
    fireEvent.change(screen.getByLabelText("Peça projetada"), { target: { value: "b650" } });
    fireEvent.click(screen.getByRole("button", { name: /Encaixar peça/ }));
    fireEvent.change(screen.getByLabelText("Categoria de componente"), { target: { value: "memory" } });
    fireEvent.change(screen.getByLabelText("Peça projetada"), { target: { value: "ddr5" } });
    fireEvent.click(screen.getByRole("button", { name: /Encaixar peça/ }));
    fireEvent.change(screen.getByLabelText("Categoria de componente"), { target: { value: "cpu" } });
    fireEvent.change(screen.getByLabelText("Peça projetada"), { target: { value: "r5-7600" } });
    fireEvent.click(screen.getByRole("button", { name: /Encaixar peça/ }));
    expect(screen.getByText("Montagem demonstrativa validada")).toBeInTheDocument();
  });

  it("mantém o estado compartilhado, atualiza o terminal simulado e persiste no navegador", async () => {
    const {unmount} = render(<CoreExperience />);
    fireEvent.click(screen.getByRole("button", { name: /Explorar THE CORE/ }));
    fireEvent.click(screen.getByRole("button", { name: "Linux" }));
    const terminal = screen.getByLabelText("Terminal simulado — digite help");
    fireEvent.change(terminal, { target: { value: "hyprctl keyword general:gaps_in 18" } });
    fireEvent.click(screen.getByRole("button", { name: "Executar" }));
    expect(screen.getByText("Espaçamento simulado aplicado: 18 px")).toBeInTheDocument();
    expect(screen.getByText("18px")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Overclock" }));
    expect(screen.getByText("Radeon RX 7600")).toBeInTheDocument();
    expect(screen.getByText(/Não é aplicado|não são aplicados|não representam estabilidade/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("portfolio.the-core.prototype.v1") || "{}").gap).toBe(18);
    fireEvent.click(screen.getByRole("button", { name: /Fechar THE CORE/ }));
    unmount();
    render(<CoreExperience />);
    fireEvent.click(screen.getByRole("button", { name: /Explorar THE CORE/ }));
    fireEvent.click(screen.getByRole("button", { name: "Linux" }));
    expect(screen.getByText("18px")).toBeInTheDocument();
  });
});
