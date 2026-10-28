import { describe, expect, it } from "vitest";
import { advanceParticles, burstEnvelope, type ParticleState } from "../scenes/particlePhysics";

describe("particle disintegration physics", () => {
  it("creates an obvious pulse and eventually fully releases it", () => {
    expect(burstEnvelope(-1)).toBe(0);
    expect(burstEnvelope(0)).toBe(0);
    expect(burstEnvelope(0.45)).toBeGreaterThan(0.9);
    expect(burstEnvelope(2.5)).toBe(0);
  });

  it("scatters letters beyond 45px and then returns to their exact shapes", () => {
    const targets = new Float32Array([
      -160, 0, 0,
      -50, 30, 0,
      50, -30, 0,
      160, 0, 0,
    ]);
    const state: ParticleState = {
      count: 4,
      positions: new Float32Array(targets),
      velocities: new Float32Array(targets.length),
      targets,
      seeds: new Float32Array([0.15, 0.34, 0.64, 0.90]),
      energy: new Float32Array(4),
    };
    const distance = (index: number) => {
      const j = index * 3;
      return Math.hypot(
        state.positions[j] - targets[j],
        state.positions[j + 1] - targets[j + 1],
      );
    };
    for (let frame = 0; frame < 50; frame++) {
      advanceParticles(state, {
        dt: 1 / 60, time: frame / 60, burstAge: frame / 60,
        width: 500, pointerX: 100000, pointerY: 100000,
        pointerVX: 0, pointerVY: 0, pointerActive: false,
      });
    }
    const maxScatter = Math.max(...[0, 1, 2, 3].map(distance));
    expect(maxScatter).toBeGreaterThan(70);

    for (let frame = 50; frame < 320; frame++) {
      advanceParticles(state, {
        dt: 1 / 60, time: frame / 60, burstAge: frame / 60,
        width: 500, pointerX: 100000, pointerY: 100000,
        pointerVX: 0, pointerVY: 0, pointerActive: false,
      });
    }
    expect(Math.max(...[0, 1, 2, 3].map(distance))).toBeLessThan(3);
  });
});
