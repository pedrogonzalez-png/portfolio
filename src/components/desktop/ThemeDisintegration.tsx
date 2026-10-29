import { useId, useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import "../../styles/theme-disintegration.css";

/**
 * Not a rectangular wipe: the old DOM remains one intact, masked layer.
 * Hundreds of independent mask cells decay in a seeded right-to-left wave.
 * Scattered shards detach and drift, allowing the new desktop to appear
 * through irregular holes, rather than behind a moving vertical boundary.
 */
const COLUMNS = 45;
const ROWS = 16;
const MASK_DURATION = 1850;

function hash(n: number): number {
  const value = Math.sin(n * 127.1 + n * n * 0.017) * 43758.5453;
  return value - Math.floor(value);
}

export type FragmentCell = {
  x: number;
  y: number;
  delayMs: number;
  durationMs: number;
};

export function disintegrationCells(): FragmentCell[] {
  return Array.from({ length: COLUMNS * ROWS }, (_, index) => {
    const x = index % COLUMNS;
    const y = Math.floor(index / COLUMNS);
    // Right-hand cells vanish first, but adjacent fragments vary in time.
    // A tall, straight "curtain" edge never forms.
    const stagger = (1 - x / (COLUMNS - 1)) * 1150;
    const turbulence = (hash(index * 3 + 9) - 0.5) * 370 +
      Math.sin(y * 1.47 + x * 0.36) * 85;
    return {
      x, y,
      delayMs: Math.max(0, Math.round(stagger + turbulence)),
      durationMs: Math.round(125 + hash(index + 748) * 210),
    };
  });
}

export type FloatingShard = {
  x: number;
  y: number;
  delayMs: number;
  size: number;
  driftX: number;
  driftY: number;
  rotation: number;
  shade: number;
};

export function disintegrationShards(): FloatingShard[] {
  return Array.from({ length: 260 }, (_, i) => {
    // Deliberately distribute pieces over the entire scene, not on a
    // narrow vertical curtain or along a single leading line.
    const x = hash(i * 13 + 31) * 98 + 1;
    const y = hash(i * 29 + 57) * 98 + 1;
    return {
      x, y,
      delayMs: Math.max(0, Math.round((1 - x / 100) * 1140 +
        (hash(i * 7 + 3) - 0.5) * 240)),
      size: 3 + Math.round(hash(i * 11 + 84) * 12),
      driftX: -18 - Math.round(hash(i * 17 + 97) * 90),
      driftY: Math.round((hash(i * 19 + 23) - 0.5) * 130),
      rotation: Math.round((hash(i * 23 + 5) - 0.5) * 350),
      shade: i % 4,
    };
  });
}

const CELLS = disintegrationCells();
const SHARDS = disintegrationShards();

export function ThemeDisintegration({
  children,
  oldAccent,
  oldSecondary,
  newAccent,
  onFinished,
}: {
  children: ReactNode;
  oldAccent: string;
  oldSecondary: string;
  newAccent: string;
  onFinished: () => void;
}) {
  const rawId = useId();
  const maskId = useMemo(
    () => "preset-fracture-mask-" + rawId.replace(/[^a-zA-Z0-9_-]/g, ""),
    [rawId],
  );
  const colors = [oldAccent, oldSecondary, newAccent, "#f6d8b0"];

  return (
    <div className="preset-disintegrating" aria-hidden="true" data-effect="particle-disintegration">
      <svg className="preset-fracture-defs" width="0" height="0" aria-hidden="true"
        focusable="false">
        <defs>
          <mask id={maskId} maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox"
            maskType="luminance" x="0" y="0" width="1" height="1">
            {CELLS.map((cell, i) => (
              <rect key={i} className="preset-fracture-cell"
                x={cell.x / COLUMNS - 0.0006}
                y={cell.y / ROWS - 0.0006}
                width={1 / COLUMNS + 0.0012}
                height={1 / ROWS + 0.0012}
                fill="white"
                style={{
                  animationDelay: cell.delayMs + "ms",
                  animationDuration: cell.durationMs + "ms",
                }}/>
            ))}
          </mask>
        </defs>
      </svg>
      <div className="preset-fractured-desktop"
        style={{
          maskImage: 'url("#' + maskId + '")',
          WebkitMaskImage: 'url("#' + maskId + '")',
        }}>
        {children}
      </div>
      <div className="preset-fragment-cloud" aria-hidden="true">
        {SHARDS.map((shard,i) => (
          <span key={i} className="preset-fragment"
            style={{
              "--frag-x": shard.x + "%",
              "--frag-y": shard.y + "%",
              "--frag-size": shard.size + "px",
              "--frag-delay": shard.delayMs + "ms",
              "--frag-dx": shard.driftX + "px",
              "--frag-dy": shard.driftY + "px",
              "--frag-rot": shard.rotation + "deg",
              "--frag-color": colors[shard.shade],
            } as CSSProperties} />
        ))}
      </div>
      <div className="preset-disintegration-lifetime"
        style={{ animationDuration: MASK_DURATION + "ms" }}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget) onFinished();
        }}
      />
    </div>
  );
}
