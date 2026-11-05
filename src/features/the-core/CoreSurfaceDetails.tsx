/**
 * Lightweight procedural surface detail for THE CORE.
 *
 * Small decals, mesh perforations and PCB traces are painted into a handful
 * of canvas textures. This adds close-up realism without thousands of extra
 * individual WebGL objects or third-party assets.
 */
import { useEffect, useMemo } from "react";
import { CanvasTexture, DoubleSide, SRGBColorSpace, type Texture } from "three";
import type { V3 } from "./CoreVisualParts";

function makeTexture(width: number, height: number, paint: (ctx: CanvasRenderingContext2D) => void): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) paint(ctx);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function usePaintedTexture(
  width: number,
  height: number,
  painter: (ctx: CanvasRenderingContext2D) => void,
  keys: readonly (string | number)[],
): Texture {
  // Keys intentionally list all semantic inputs; painter runs on regeneration only.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const texture = useMemo(() => makeTexture(width, height, painter), [width, height, ...keys]);
  useEffect(() => () => { texture.dispose(); }, [texture]);
  return texture;
}

function ink(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, size: number,
  color = "#b7d0d8", weight = 700) {
  ctx.fillStyle = color;
  ctx.font = weight + " " + size + "px 'DejaVu Sans',Arial,sans-serif";
  ctx.fillText(text, x, y);
}

function stripes(ctx: CanvasRenderingContext2D, x: number, y: number, w: number,
  color: string, count: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  for (let i = 0; i < count; i++) {
    const px = x + (i / Math.max(1, count - 1)) * w;
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.lineTo(px, y + 12);
    ctx.stroke();
  }
}

export function EngravedLabel({ position, size, title, subtitle, accent = "#c4ae83" }: {
  position: V3; size: [number, number]; title: string; subtitle?: string; accent?: string;
}) {
  const texture = usePaintedTexture(512, 128, (ctx) => {
    ctx.clearRect(0, 0, 512, 128);
    ctx.fillStyle = "rgba(9,15,25,.92)";
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, 9, 128);
    ctx.fillRect(22, 18, 178, 4);
    ink(ctx, 24, 72, title.toUpperCase().slice(0, 27), title.length > 14 ? 31 : 41, "#d5e0e7");
    if (subtitle) ink(ctx, 25, 110, subtitle.toUpperCase().slice(0, 48), 19, "#889bab", 500);
    stripes(ctx, 414, 20, 78, accent, 7);
  }, [title, subtitle || "", accent]);
  return (
    <mesh position={position} raycast={() => {}}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} side={DoubleSide} depthWrite={false} />
    </mesh>
  );
}

export function PerforatedMesh({ position, size, rotation = [0, 0, 0], opacity = 0.82, scale = 1 }: {
  position: V3; size: [number, number]; rotation?: V3; opacity?: number; scale?: number;
}) {
  const texture = usePaintedTexture(256, 512, (ctx) => {
    ctx.clearRect(0, 0, 256, 512);
    ctx.fillStyle = "#687b86";
    ctx.fillRect(0, 0, 256, 512);
    ctx.globalCompositeOperation = "destination-out";
    for (let y = 12; y < 512; y += 19) {
      for (let x = 10 + (Math.floor(y / 19) % 2) * 9; x < 256; x += 19) {
        ctx.beginPath();
        ctx.arc(x, y, 6.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalCompositeOperation = "source-over";
  }, []);
  return (
    <mesh position={position} rotation={rotation} scale={[scale, scale, 1]} raycast={() => {}}>
      <planeGeometry args={size} />
      <meshStandardMaterial map={texture} transparent opacity={opacity}
        alphaTest={0.42} metalness={0.56} roughness={0.52}
        side={DoubleSide} depthWrite={false} />
    </mesh>
  );
}

export function PCBPrint({ position, size = [1.12, 1.55], accent = "#96a2a2" }: {
  position: V3; size?: [number, number]; accent?: string;
}) {
  const texture = usePaintedTexture(512, 768, (ctx) => {
    ctx.clearRect(0, 0, 512, 768);
    // A subtle substrate, copper traces, component identifiers and solder pads.
    ctx.fillStyle = "#13282a";
    ctx.fillRect(0, 0, 512, 768);
    ctx.strokeStyle = "#416562";
    ctx.lineWidth = 2;
    for (let i = 0; i < 55; i++) {
      const x = (i * 89 + 27) % 502;
      const y = (i * 67 + 35) % 755;
      const endX = Math.max(12, Math.min(497, x + (i % 2 ? -64 : 68)));
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + (i % 3 ? 16 : 44));
      ctx.lineTo(endX, y + (i % 3 ? 16 : 44));
      ctx.stroke();
      ctx.fillStyle = i % 7 === 0 ? accent : "#617b74";
      ctx.fillRect(endX - 3, y + (i % 3 ? 13 : 41), 6, 6);
    }
    for (let y = 32; y < 730; y += 47) {
      for (let x = 18; x < 492; x += 55) {
        ctx.strokeStyle = "rgba(151,179,163,.26)";
        ctx.strokeRect(x, y, 9, 6);
      }
    }
    ink(ctx, 28, 35, "THE CORE / ENGINEERING SAMPLE", 17, "#bac7c2", 600);
    ink(ctx, 28, 743, "PCB  /  REV DEMO  /  LAB 01", 15, "#b5b9a8", 500);
    ink(ctx, 340, 405, "PCIe", 18, "#9fbaac");
    ink(ctx, 29, 198, "CPU", 18, "#a5c3b1");
    ink(ctx, 348, 204, "DDR", 17, "#a5c3b1");
  }, [accent]);
  return (
    <mesh position={position} raycast={() => {}}>
      <planeGeometry args={size}/>
      <meshStandardMaterial map={texture} side={DoubleSide}
        metalness={0.27} roughness={0.66}/>
    </mesh>
  );
}

export function DesktopScreen({ position, size, accent, secondary }: {
  position: V3; size: [number, number]; accent: string; secondary: string;
}) {
  const texture = usePaintedTexture(1024, 576, (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 1024, 576);
    gradient.addColorStop(0, "#101724");
    gradient.addColorStop(0.55, "#1b2432");
    gradient.addColorStop(1, "#070d17");
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1024, 576);
    // Soft streaks and illuminated planets represent an original wallpaper.
    const bloom = ctx.createRadialGradient(730, 248, 16, 730, 248, 330);
    bloom.addColorStop(0, accent + "bb"); bloom.addColorStop(.38, secondary + "52");
    bloom.addColorStop(1, "#121a2500");
    ctx.fillStyle = bloom; ctx.fillRect(360, 0, 664, 576);
    ctx.strokeStyle = secondary + "7e"; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.ellipse(738, 267, 184, 90, -0.52, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#0d1521df"; ctx.fillRect(0, 0, 1024, 47);
    ctx.fillStyle = accent; ctx.fillRect(0, 0, 6, 47);
    ink(ctx, 26, 32, "ARCH  /  HYPRLAND", 25, "#dae3eb");
    ink(ctx, 781, 31, "THE CORE  LAB", 20, "#b8c7d2", 500);
    // Terminal (left), file manager (right) and window header controls.
    ctx.fillStyle = "#0b121ee6"; ctx.fillRect(35, 76, 525, 404);
    ctx.strokeStyle = accent + "aa"; ctx.lineWidth = 3; ctx.strokeRect(35, 76, 525, 404);
    ctx.fillStyle = "#202d3d"; ctx.fillRect(37, 77, 522, 48);
    ink(ctx, 62, 109, "kitty  /  fish", 21, "#e1e5ec", 600);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.arc(486 + i * 20, 99, 6, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? accent : "#7d8a9a"; ctx.fill();
    }
    ink(ctx, 67, 164, "pedro@arch ~  >", 25, secondary);
    ink(ctx, 67, 204, "neofetch", 24, "#8dc5d0", 500);
    ink(ctx, 67, 252, "OS     Arch Linux", 21, "#a9b9c8", 500);
    ink(ctx, 67, 286, "WM     Hyprland", 21, "#a9b9c8", 500);
    ink(ctx, 67, 320, "GPU    Radeon RX 7600", 21, "#a9b9c8", 500);
    ink(ctx, 67, 354, "SHELL  fish", 21, "#a9b9c8", 500);
    ink(ctx, 67, 434, ">", 27, secondary);
    ctx.fillStyle = "#111929e9"; ctx.fillRect(607, 86, 370, 295);
    ctx.strokeStyle = secondary + "bb"; ctx.strokeRect(607, 86, 370, 295);
    ctx.fillStyle = "#27374a"; ctx.fillRect(608, 87, 369, 46);
    ink(ctx, 628, 120, "arquivos   /home/pedro", 20, "#dee5ee", 600);
    ["Pictures", "Projects", ".config", "Downloads"].forEach((name, i) => {
      ctx.fillStyle = accent + "88"; ctx.fillRect(633, 155 + i * 48, 19, 21);
      ink(ctx, 672, 174 + i * 48, name, 21, "#bbcbd7", 500);
    });
    ctx.fillStyle = "#0b121edf"; ctx.fillRect(280, 525, 464, 35);
    ["▣", "◆", "⌘", "▥", "◈"].forEach((name, i) => ink(ctx, 319 + i * 82, 551, name, 27, secondary));
  }, [accent, secondary]);
  return (
    <mesh position={position} raycast={() => {}}>
      <planeGeometry args={size}/>
      <meshBasicMaterial map={texture} toneMapped={false}/>
    </mesh>
  );
}

export function AnodizedStripe({ position, size = [0.6, 0.07], accent }: {
  position: V3; size?: [number, number]; accent: string;
}) {
  const texture = usePaintedTexture(512, 80, ctx => {
    ctx.fillStyle = "#1c2732"; ctx.fillRect(0, 0, 512, 80);
    ctx.fillStyle = accent; ctx.fillRect(0, 0, 9, 80);
    ctx.fillStyle = "#73838d";
    for (let x = 32; x < 480; x += 13) ctx.fillRect(x, 25, 2, 30);
    ink(ctx, 389, 22, "LAB", 14, "#c1cad2");
  }, [accent]);
  return <mesh position={position} raycast={() => {}}>
    <planeGeometry args={size}/>
    <meshBasicMaterial map={texture} toneMapped={false}/>
  </mesh>;
}
