import { useEffect, useRef } from "react";
import { useTheme } from "../stores/themeContext";

type Dot = {
  tx: number;
  ty: number;
  x: number;
  y: number;
  seed: number;
};

/**
 * Canvas 2D particle typography for touch devices and WebGL-free browsers.
 * Keeps the real accessible h1 in the DOM; only hides its fallback text after
 * visible particles have been successfully drawn.
 */
export function ParticleNameCanvas({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const title = document.getElementById("hero-name");
    const label = title?.querySelector<HTMLElement>(".hero-title-fallback");
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context || !title || !label) return;

    let destroyed = false;
    let visible = true;
    let frame = 0;
    let previous = 0;
    let start = performance.now();
    let dots: Dot[] = [];
    let width = 1;
    let height = 1;
    let lastMove = -10000;
    let lastPulse = -10000;
    let pulseX = -1000;
    let pulseY = -1000;
    let pointerX = -1000;
    let pointerY = -1000;
    let hovered = false;
    let idleFired = false;
    let ready = false;

    const motion = !reducedMotion;
    const bronze = theme.palette.accentPrimary;
    const gold = theme.palette.accentYellow;

    function measure() {
      if (destroyed || !canvas || !context || !title || !label) return;
      const rect = title.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      if (width < 90 || height < 16) return;

      const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      // Use an independent raster surface so the actual visible canvas stays
      // transparent and dots only follow pixels belonging to the letters.
      const raster = document.createElement("canvas");
      raster.width = width;
      raster.height = height;
      const sample = raster.getContext("2d", { willReadFrequently: true });
      if (!sample) return;
      const style = getComputedStyle(title);
      sample.fillStyle = "#fff";
      sample.textAlign = "center";
      sample.textBaseline = "middle";
      sample.font = `${style.fontWeight || "700"} ${style.fontSize} ${style.fontFamily}`;
      const content = label.textContent?.trim() || "PEDRO GONZALEZ";
      sample.fillText(content, width / 2, height / 2, width - 8);

      const pixels = sample.getImageData(0, 0, width, height).data;
      const stride = width < 500 ? 3 : 4;
      const collected: Dot[] = [];
      for (let y = 0; y < height; y += stride) {
        for (let x = 0; x < width; x += stride) {
          if (pixels[(y * width + x) * 4 + 3] < 140) continue;
          const seed = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
          const r = Math.abs(seed);
          const angle = r * Math.PI * 2 + collected.length * 2.39996;
          const spread = motion ? (24 + r * 46) : 0;
          collected.push({
            tx: x, ty: y,
            x: x + Math.cos(angle) * spread,
            y: y + Math.sin(angle) * spread,
            seed: r,
          });
        }
      }
      if (!collected.length) return;
      dots = collected;
      start = performance.now();
      previous = 0;
      drawFrame(start);
      if (!ready) {
        title.classList.add("particles-ready", "has-canvas-particles");
        ready = true;
      }
      // drawFrame already scheduled its next frame when motion is enabled.
    }

    function drawFrame(now: number) {
      if (destroyed || !context || !visible) return;
      // Limit the dense canvas typography to ~30fps on small touch screens.
      if (motion && width < 600 && previous && now - previous < 30) {
        frame = requestAnimationFrame(drawFrame);
        return;
      }
      const dt = previous ? Math.min(48, now - previous) / 16.667 : 1;
      previous = now;
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "source-over";
      const age = now - lastPulse;
      const envelope = motion && age >= 0 && age < 1300
        ? Math.sin(Math.PI * Math.min(1, age / 1300)) ** 2 : 0;
      for (const dot of dots) {
        const distance = Math.hypot(dot.tx - pulseX, dot.ty - pulseY);
        const local = Math.max(0, 1 - distance / 100);
        const pressure = envelope * local * local;
        const angle = dot.seed * 6.283 + dot.tx * .04;
        const targetX = dot.tx + Math.cos(angle + now * .002) * pressure * 77;
        const targetY = dot.ty + Math.sin(angle + now * .002) * pressure * 58;
        const smoothing = motion ? 1 - Math.exp(-.15 * dt) : 1;
        dot.x += (targetX - dot.x) * smoothing;
        dot.y += (targetY - dot.y) * smoothing;

        // Tiny warm circular points: never a solid filled font.
        context.fillStyle = dot.seed > .43 ? gold : bronze;
        context.globalAlpha = .70 + dot.seed * .30;
        context.beginPath();
        context.arc(dot.x, dot.y, width < 500 ? 1.05 : 1.25, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;

      // If the pointer stays over the letters, scatter and re-form once.
      if (motion && hovered && !idleFired && now - lastMove > 920 && now - lastPulse > 850) {
        lastPulse = now;
        pulseX = pointerX;
        pulseY = pointerY;
        idleFired = true;
      }
      if (motion) frame = requestAnimationFrame(drawFrame);
    }

    const onMove = (event: PointerEvent) => {
      if (!motion || !title) return;
      const rect = title.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
      if (!inside) {
        hovered = false;
        return;
      }
      const moved = Math.hypot(x - pointerX, y - pointerY);
      const now = performance.now();
      if (moved > 3 || !hovered) {
        lastMove = now;
        idleFired = false;
      }
      if ((!hovered || moved > 55) && now - lastPulse > 400) {
        lastPulse = now;
        pulseX = x;
        pulseY = y;
      }
      hovered = true;
      pointerX = x;
      pointerY = y;
    };

    const onDown = (event: PointerEvent) => {
      if (!motion || !title) return;
      const rect = title.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      pulseX = x;
      pulseY = y;
      lastPulse = performance.now();
      idleFired = true;
    };

    const onLeave = () => { hovered = false; };
    const observer = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => measure()) : null;
    observer?.observe(title);
    const intersection = typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver((entries) => {
          visible = entries.some(entry => entry.isIntersecting);
          if (visible && motion) {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(drawFrame);
          } else {
            cancelAnimationFrame(frame);
          }
        }) : null;
    intersection?.observe(title);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("blur", onLeave);
    window.addEventListener("resize", measure, { passive: true });
    measure();
    document.fonts?.ready.then(() => { if (!destroyed) measure(); }).catch(() => {});

    return () => {
      destroyed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      intersection?.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("resize", measure);
      title.classList.remove("particles-ready", "has-canvas-particles");
    };
  }, [reducedMotion, theme.palette.accentPrimary, theme.palette.accentYellow]);

  return (
    <canvas
      ref={canvasRef}
      data-particle-name="2d"
      className="particle-name-canvas"
      aria-hidden="true"
    />
  );
}
