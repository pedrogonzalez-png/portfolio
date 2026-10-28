/**
 * Deterministic, damped particle motion. Separated from WebGL for unit tests.
 * A burst temporarily pulls particles away from the letter targets, then
 * spring forces restore the original typography.
 */
export interface ParticleState {
  positions: Float32Array;
  velocities: Float32Array;
  targets: Float32Array;
  seeds: Float32Array;
  energy: Float32Array;
  count: number;
}

export interface ParticleInput {
  dt: number;
  time: number;
  burstAge: number;
  width: number;
  pointerX: number;
  pointerY: number;
  pointerVX: number;
  pointerVY: number;
  pointerActive: boolean;
}

export function burstEnvelope(age: number): number {
  if (age < 0 || age >= 2.5) return 0;
  const rise = Math.min(1, age / 0.14);
  const fall = Math.min(1, Math.max(0, (2.5 - age) / 1.4));
  return rise * fall;
}

export function advanceParticles(data: ParticleState, input: ParticleInput): void {
  const dt = Math.min(Math.max(input.dt, 0), 0.04);
  if (dt <= 0) return;
  const burst = burstEnvelope(input.burstAge);
  const distanceX = Math.min(250, Math.max(115, input.width * 0.19));
  const distanceY = Math.min(152, distanceX * 0.64);
  const damping = Math.exp(-6.7 * dt);
  const spring = 29;
  const pointerSpeed = Math.min(1, Math.hypot(input.pointerVX, input.pointerVY) / 750);
  const pos = data.positions;
  const vel = data.velocities;
  const targets = data.targets;

  for (let i = 0; i < data.count; i++) {
    const j = 3 * i;
    const seed = data.seeds[i];
    const angle = seed * Math.PI * 2.0 + targets[j] * 0.0037;
    const swirl = input.time * 0.38 + targets[j + 1] * 0.012;

    // Global pulse is not restricted to a tiny radius around the mouse.
    // Distinct directions form an airy swirl rather than a uniform explosion.
    const tx = targets[j]
      + Math.cos(angle + swirl) * distanceX * burst * (0.48 + seed * 0.85)
      + Math.sin(input.time * 0.8 + seed * 19) * 0.38;
    const ty = targets[j + 1]
      + Math.sin(angle * 1.3 + swirl) * distanceY * burst * (0.48 + seed * 0.85)
      + Math.cos(input.time * 0.7 + seed * 17) * 0.38;
    const tz = targets[j + 2] + (seed - 0.5) * 90 * burst;

    let localX = 0;
    let localY = 0;
    if (input.pointerActive) {
      const dx = pos[j] - input.pointerX;
      const dy = pos[j + 1] - input.pointerY;
      const distSq = dx * dx + dy * dy;
      const falloff = Math.exp(-distSq / (125 * 125));
      const invDist = 1 / Math.sqrt(distSq + 40);
      localX = falloff * (dx * invDist * (1400 + pointerSpeed * 2700)
        + input.pointerVX * 1.65 - dy * invDist * 440 * pointerSpeed);
      localY = falloff * (dy * invDist * (1400 + pointerSpeed * 2700)
        + input.pointerVY * 1.65 + dx * invDist * 440 * pointerSpeed);
    }

    vel[j] = (vel[j] + ((tx - pos[j]) * spring + localX) * dt) * damping;
    vel[j + 1] = (vel[j + 1] + ((ty - pos[j + 1]) * spring + localY) * dt) * damping;
    vel[j + 2] = (vel[j + 2] + (tz - pos[j + 2]) * spring * dt) * damping;

    pos[j] += vel[j] * dt;
    pos[j + 1] += vel[j + 1] * dt;
    pos[j + 2] += vel[j + 2] * dt;
    const speed = Math.hypot(vel[j], vel[j + 1], vel[j + 2]);
    data.energy[i] = Math.min(1, speed / 230 + burst * 0.32);
  }
}
