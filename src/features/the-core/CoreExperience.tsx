import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  CATEGORIES, INITIAL_BUILD, PARTS, PART_BY_ID, checkBuild, installPart,
  type Build, type Category,
} from "./coreModel";
import type { CoreModule } from "./CoreScene";
import "../../styles/the-core.css";

const CoreScene = lazy(() => import("./CoreScene"));
const STORAGE_KEY = "portfolio.the-core.prototype.v1";
type Saved = { build: Build; gap: number };
function initialState(): Saved {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as Partial<Saved> | null;
    if (saved?.build && CATEGORIES.every(({id}) =>
      saved.build?.[id] === null || PART_BY_ID[saved.build?.[id] || ""]?.category === id)) {
      return { build: saved.build as Build, gap: typeof saved.gap === "number" && Number.isFinite(saved.gap)
        ? Math.max(0, Math.min(24, saved.gap)) : 12 };
    }
  } catch { /* storage may be unavailable */ }
  return { build: { ...INITIAL_BUILD }, gap: 12 };
}
const NODES = ["Git / GitHub", "Python", "HTML / CSS", "JavaScript", "React / Vite", "TrueNAS", "Tailscale", "Redes", "VMs"];

export default function CoreExperience() {
  const [saved, setSaved] = useState<Saved>(initialState);
  const [expanded, setExpanded] = useState(false);
  const [module, setModule] = useState<CoreModule>("hub");
  const [category, setCategory] = useState<Category>("cpu");
  const [projected, setProjected] = useState<string>("r5-5600");
  const [installMessage, setInstallMessage] = useState("");
  const [target, setTarget] = useState<"cpu" | "gpu">("gpu");
  const [clockOffset, setClockOffset] = useState(0);
  const [voltageOffset, setVoltageOffset] = useState(0);
  const [command, setCommand] = useState("");
  const [terminalOutput, setTerminalOutput] = useState("Ambiente didático — nenhum comando é executado no computador real.");
  const report = useMemo(() => checkBuild(saved.build), [saved.build]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); }
    catch { /* navigation remains usable without storage */ }
  }, [saved]);

  useEffect(() => {
    if (!expanded) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => { document.body.style.overflow = original; window.removeEventListener("keydown", onEscape); };
  }, [expanded]);

  const options = PARTS.filter(part => part.category === category);
  const currentPart = PART_BY_ID[projected];
  const changeCategory = (next: Category) => {
    setCategory(next);
    setProjected(PARTS.find(part => part.category === next)?.id || "");
    setInstallMessage("");
  };
  const install = () => {
    if (!currentPart || currentPart.category !== category) return;
    const candidate = installPart(saved.build, currentPart.id, category);
    const nextReport = checkBuild(candidate);
    const previousReport = checkBuild(saved.build);
    // Do not magnetically attach a piece that creates a physical platform mismatch.
    const newHardError = nextReport.issues.find(issue =>
      (issue.includes("não encaixa") || issue.includes("não é compatível")) &&
      !previousReport.issues.includes(issue));
    if (newHardError) {
      setInstallMessage("Encaixe bloqueado: " + newHardError);
      return;
    }
    setSaved(s => ({ ...s, build: candidate }));
    setInstallMessage(currentPart.name + " encaixado na bancada demonstrativa.");
  };
  const remove = () => {
    setSaved(s => ({ ...s, build: installPart(s.build, null, category) }));
    setInstallMessage("Peça removida. A montagem pode ficar incompleta.");
  };
  const applyCommand = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const clean = command.trim();
    if (clean === "hyprctl getoption general:gaps_in") {
      setTerminalOutput("general:gaps_in = " + saved.gap + " (valor simulado)");
    } else if (/^hyprctl keyword general:gaps_in (?:[0-9]|1[0-9]|2[0-4])$/.test(clean)) {
      const value = Number(clean.split(" ").at(-1));
      setSaved(s => ({ ...s, gap: value }));
      setTerminalOutput("Espaçamento simulado aplicado: " + value + " px");
    } else if (clean === "help") {
      setTerminalOutput("Comandos: help · hyprctl getoption general:gaps_in · hyprctl keyword general:gaps_in 16");
    } else {
      setTerminalOutput("Comando não disponível nesta demonstração. Digite help.");
    }
    setCommand("");
  };

  const selectModule = (next: Exclude<CoreModule, "hub">) => {
    setModule(next);
    setInstallMessage("");
  };

  return (
    <section id="saberes" className="core-entry" aria-label="Saberes — THE CORE">
      <div className="core-entry-copy">
        <p className="eyebrow">03 / SABERES</p>
        <h2>Conhecimento em <em>movimento.</em></h2>
        <p>Overclock, montagem de computadores e personalização Linux. Conheça minhas áreas de prática em uma experiência técnica interativa.</p>
        <button type="button" className="core-primary" onClick={() => {setModule("hub");setExpanded(true);}}>
          Explorar THE CORE <span aria-hidden="true">↗</span>
        </button>
        <p className="core-prototype-note">Protótipo experimental · simulações educativas · nenhuma alteração no seu computador</p>
      </div>
      <div className="core-entry-orbit" aria-hidden="true">
        <span className="core-entry-ring core-entry-ring-one"/>
        <span className="core-entry-ring core-entry-ring-two"/>
        <span className="core-entry-ring core-entry-ring-three"/>
        <span className="core-entry-center">THE CORE</span>
        <span className="core-entry-satellite">OC</span>
        <span className="core-entry-satellite">HARDWARE</span>
        <span className="core-entry-satellite">LINUX</span>
      </div>
      {expanded && (
        <div className="core-fullscreen" role="dialog" aria-modal="true" aria-label="THE CORE — Laboratório interativo">
          <header className="core-toolbar">
            <div className="core-brand"><span className="core-brand-dot" aria-hidden="true"/> THE CORE <small>/ PROTÓTIPO</small></div>
            <nav aria-label="Laboratórios do THE CORE" className="core-nav">
              <button type="button" aria-current={module === "hub" ? "page" : undefined} onClick={() => setModule("hub")}>Núcleo</button>
              <button type="button" aria-current={module === "assembly" ? "page" : undefined} onClick={() => selectModule("assembly")}>Montagem</button>
              <button type="button" aria-current={module === "overclock" ? "page" : undefined} onClick={() => selectModule("overclock")}>Overclock</button>
              <button type="button" aria-current={module === "linux" ? "page" : undefined} onClick={() => selectModule("linux")}>Linux</button>
            </nav>
            <button className="core-exit" type="button" onClick={() => setExpanded(false)} aria-label="Fechar THE CORE e voltar ao portfólio">Sair ×</button>
          </header>
          <div className="core-workspace">
            <div className="core-stage">
              <Suspense fallback={<div className="core-scene-fallback">Preparando laboratório 3D…</div>}>
                <CoreScene module={module} build={saved.build} onChoose={selectModule}/>
              </Suspense>
              <div className="core-stage-caption">
                <span>PC DE DEMONSTRAÇÃO · Ryzen 5 5600 / RX 7600</span>
                <span>Arraste para girar · rolagem para aproximar</span>
              </div>
              <div className="core-orbit-labels" aria-label="Conhecimentos complementares">
                {NODES.slice(0, 5).map((name) => <span key={name}>{name}</span>)}
              </div>
            </div>
            <div className="core-inspector">
              {module === "hub" && (
                <div className="core-stack">
                  <p className="core-kicker">01 / NÚCLEO</p>
                  <h3>Explore seu próprio caminho.</h3>
                  <p>Selecione a CPU ou a GPU para Overclock, a placa-mãe para Montagem ou o monitor para Linux. Você também pode usar a navegação superior.</p>
                  <p className="core-caption">A estrutura 3D é ilustrativa. B550 e DDR4 são peças de demonstração; não afirmamos que correspondem ao PC real do autor.</p>
                  <div className="core-quick-links">
                    <button type="button" onClick={() => selectModule("assembly")}>Montar computador ↗</button>
                    <button type="button" onClick={() => selectModule("overclock")}>Explorar OC ↗</button>
                    <button type="button" onClick={() => selectModule("linux")}>Personalizar Linux ↗</button>
                  </div>
                  <p className="core-caption">Conhecimentos complementares: {NODES.join(" · ")}.</p>
                </div>
              )}
              {module === "assembly" && (
                <div className="core-stack">
                  <p className="core-kicker">02 / MONTAGEM MAGNÉTICA · ALFA</p>
                  <h3>Construa sem ordem obrigatória.</h3>
                  <p>Escolha uma categoria e projete uma peça. Neste primeiro protótipo, o encaixe é por botão; o arraste 3D ficará para a próxima etapa.</p>
                  <label className="core-field">Categoria de componente
                    <select value={category} onChange={e => changeCategory(e.target.value as Category)}>
                      {CATEGORIES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
                    </select>
                  </label>
                  <label className="core-field">Peça projetada
                    <select value={projected} onChange={e => {setProjected(e.target.value);setInstallMessage("");}}>
                      {options.map(part => <option key={part.id} value={part.id}>{part.name}</option>)}
                    </select>
                  </label>
                  <p className="core-caption">{currentPart?.description}</p>
                  <div className="core-actions">
                    <button type="button" onClick={install}>Encaixar peça ↘</button>
                    <button type="button" className="core-subtle" onClick={remove}>Remover do encaixe</button>
                  </div>
                  {installMessage && <p role="status" className="core-message">{installMessage}</p>}
                  <div className="core-build-list">
                    {CATEGORIES.map(item => (
                      <div key={item.id}>
                        <span>{item.label}</span>
                        <strong>{PART_BY_ID[saved.build[item.id] || ""]?.name || "Não instalado"}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="core-report">
                    <strong>{report.ready ? "Montagem demonstrativa validada" : "Montagem incompleta ou incompatível"}</strong>
                    {report.issues.length ? <ul>{report.issues.map(issue => <li key={issue}>{issue}</li>)}</ul> :
                      <p>Soquete e tipo de memória conferidos. Outros requisitos físicos e elétricos ainda não são verificados neste protótipo.</p>}
                  </div>
                  <button type="button" className="core-subtle" onClick={() => {
                    setSaved(s => ({ ...s, build: { ...INITIAL_BUILD } }));
                    setInstallMessage("Perfil educativo restaurado.");
                  }}>Restaurar montagem de demonstração</button>
                </div>
              )}
              {module === "overclock" && (
                <div className="core-stack">
                  <p className="core-kicker">03 / OVERCLOCK · EDUCATIVO</p>
                  <h3>Bancada transformável.</h3>
                  <div className="core-switch">
                    <button type="button" aria-pressed={target === "gpu"} onClick={() => {setTarget("gpu");setClockOffset(0);setVoltageOffset(0);}}>GPU</button>
                    <button type="button" aria-pressed={target === "cpu"} onClick={() => {setTarget("cpu");setClockOffset(0);setVoltageOffset(0);}}>CPU</button>
                  </div>
                  <strong>{PART_BY_ID[saved.build[target] || ""]?.name || "Componente não instalado"}</strong>
                  <p className="core-caption">Variações abstratas do modelo educativo. Estes controles não representam estabilidade, temperatura, FPS nem valores recomendados de OC.</p>
                  <label className="core-field">Variação ilustrativa de frequência <output>{clockOffset > 0 ? "+" : ""}{clockOffset}%</output>
                    <input type="range" min="-10" max="10" value={clockOffset} onChange={e => setClockOffset(Number(e.target.value))}/>
                  </label>
                  <label className="core-field">Variação ilustrativa de tensão <output>{voltageOffset > 0 ? "+" : ""}{voltageOffset}%</output>
                    <input type="range" min="-10" max="10" value={voltageOffset} onChange={e => setVoltageOffset(Number(e.target.value))}/>
                  </label>
                  <div className="core-telemetry">
                    <div><small>Clock</small><strong>{clockOffset === 0 ? "Base" : clockOffset > 0 ? "Acima da base" : "Abaixo da base"}</strong></div>
                    <div><small>Tensão</small><strong>{voltageOffset === 0 ? "Base" : voltageOffset > 0 ? "Acima da base" : "Abaixo da base"}</strong></div>
                  </div>
                  <button type="button" className="core-subtle" onClick={() => {setClockOffset(0);setVoltageOffset(0);}}>Restaurar controles</button>
                  <p className="core-caption">Experiência relatada pelo autor: RX 7600 com perfil de 2.920 MHz e −80 mV. Estes números não são aplicados ao simulador e não constituem recomendação.</p>
                </div>
              )}
              {module === "linux" && (
                <div className="core-stack">
                  <p className="core-kicker">04 / LINUX · DESKTOP SIMULADO</p>
                  <h3>Arch Linux por dentro.</h3>
                  {!report.ready && <p role="status" className="core-warning">A montagem não está validada. Esta é uma prévia Linux independente, não uma inicialização do PC incompleto.</p>}
                  <div className="core-desktop">
                    <div className="core-desktop-top"><span>◈ Arch / Hyprland</span><span>DEMO</span></div>
                    <div className="core-desktop-windows" style={{gap: saved.gap + "px"}}>
                      <div><span>kitty</span><p>pedro@arch ~ ❯</p></div>
                      <div><span>arquivos</span><p>~/ .config</p></div>
                    </div>
                  </div>
                  <label className="core-field">Espaçamento das janelas <output>{saved.gap}px</output>
                    <input type="range" min="0" max="24" step="2" value={saved.gap}
                      onChange={e => setSaved(s => ({...s,gap:Number(e.target.value)}))}/>
                  </label>
                  <form className="core-terminal" onSubmit={applyCommand}>
                    <label htmlFor="core-command">Terminal simulado — digite help</label>
                    <div><input id="core-command" value={command} onChange={e => setCommand(e.target.value)}
                      autoComplete="off" spellCheck={false} placeholder="hyprctl getoption general:gaps_in"/>
                      <button type="submit">Executar</button></div>
                    <output aria-live="polite">{terminalOutput}</output>
                  </form>
                  <p className="core-caption">Ambiente isolado: nenhum comando chega ao Arch Linux real. As cores do portfólio não são alteradas.</p>
                </div>
              )}
            </div>
          </div>
          <footer className="core-bottom">
            <span>THE CORE / VERTICAL SLICE 0.1</span>
            <span>{report.ready ? "Configuração didática: válida para os testes implementados" : "Montagem requer revisão"}</span>
            <button type="button" onClick={()=>setModule("hub")}>Retornar ao núcleo ↶</button>
          </footer>
        </div>
      )}
    </section>
  );
}
