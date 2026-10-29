import { describe, expect, it } from "vitest";
import { advanceParticles, burstEnvelope, type ParticleState } from "../scenes/particlePhysics";

function makeState(): ParticleState {
  const targets = new Float32Array([
    -320, 0, 0,
    0, 0, 0,
    55, 8, 0,
    130, -12, 0,
    320, 0, 0,
  ]);
  return {
    count: 5,
    positions: new Float32Array(targets),
    velocities: new Float32Array(targets.length),
    targets,
    seeds: new Float32Array([0.05, 0.12, 0.32, 0.64, 0.85]),
    energy: new Float32Array(5),
  };
}

function distance(state: ParticleState, index: number): number {
  const j = index * 3;
  return Math.hypot(
    state.positions[j] - state.targets[j],
    state.positions[j + 1] - state.targets[j + 1],
  );
}

function frame(state: ParticleState, time: number, options: {
  pointerX?: number;
  pointerVX?: number;
  pointerActive?: boolean;
} = {}) {
  advanceParticles(state, {
    dt: 1 / 60,
    time,
    burstAge: time,
    burstX: 0,
    burstY: 0,
    width: 1050,
    pointerX: options.pointerX ?? 100000,
    pointerY: 0,
    pointerVX: options.pointerVX ?? 0,
    pointerVY: 0,
    pointerActive: options.pointerActive ?? false,
  });
}

describe("localized particle interactions", () => {
  it("opens fast and finishes the burst sooner than the old 2.5s effect", () => {
    expect(burstEnvelope(-1)).toBe(0);
    expect(burstEnvelope(0.12)).toBeGreaterThan(0.8);
    expect(burstEnvelope(0.5)).toBeLessThan(0.6);
    expect(burstEnvelope(1.25)).toBe(0);
  });

  it("scatters a touched letter and its neighbors without moving distant letters", () => {
    const state = makeState();
    for (let i = 0; i < 24; i++) frame(state, i / 60);

    expect(distance(state, 1)).toBeGreaterThan(12); // touched letter
    expect(distance(state, 2)).toBeGreaterThan(15); // immediately adjacent
    expect(distance(state, 0)).toBeLessThan(1); // far left
    expect(distance(state, 4)).toBeLessThan(1); // far right
  });

  it("reforms touched letters quickly and without moving remote letters", () => {
    const state = makeState();
    for (let i = 0; i < 145; i++) frame(state, i / 60);

    expect(distance(state, 1)).toBeLessThan(2);
    expect(distance(state, 2)).toBeLessThan(2);
    expect(distance(state, 4)).toBeLessThan(1);
  });

  it("limits cursor wake to the same local neighborhood", () => {
    const state = makeState();
    for (let i = 0; i < 18; i++) {
      advanceParticles(state, {
        dt: 1 / 60,
        time: i / 60,
        burstAge: -10,
        burstX: 0,
        burstY: 0,
        width: 1050,
        pointerX: 0,
        pointerY: 0,
        pointerVX: 450,
        pointerVY: 0,
        pointerActive: true,
      });
    }
    expect(distance(state, 1)).toBeGreaterThan(3);
    expect(distance(state, 4)).toBeLessThan(1);
  });
});
