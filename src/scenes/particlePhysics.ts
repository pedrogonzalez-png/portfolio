/**
 * Damped particle motion for the typographic hero.
 * Localized interactions are calculated against ORIGINAL letter positions.
 * Therefore scattering a letter never causes faraway letters to get dragged
 * into the influence area just because their particles moved.
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
  burstX: number;
  burstY: number;
  width: number;
  pointerX: number;
  pointerY: number;
  pointerVX: number;
  pointerVY: number;
  pointerActive: boolean;
}

/** Short pulse: fast opening, then rebuilding in ~1 second. */
export function burstEnvelope(age: number): number {
  if (age < 0 || age >= 1.25) return 0;
  const onset = Math.min(1, age / 0.09);
  const tail = Math.max(0, 1 - Math.max(0, age - 0.09) / 1.16);
  return onset * tail * tail;
}

export function advanceParticles(data: ParticleState, input: ParticleInput): void {
  const dt = Math.min(Math.max(input.dt, 0), 0.04);
  if (dt <= 0) return;

  const burst = burstEnvelope(input.burstAge);
  // ~one letter and its immediate neighbors; responsive to screen width.
  const sigma = Math.min(68, Math.max(42, input.width * 0.064));
  const cutoffSq = (sigma * 2.65) ** 2;
  const twoSigmaSq = 2 * sigma * sigma;
  const damping = Math.exp(-13.6 * dt);
  const spring = 74;
  const pointerSpeed = Math.min(1, Math.hypot(input.pointerVX, input.pointerVY) / 750);
  const pos = data.positions;
  const vel = data.velocities;
  const targets = data.targets;

  for (let i = 0; i < data.count; i++) {
    const j = 3 * i;
    const seed = data.seeds[i];
    const origX = targets[j];
    const origY = targets[j + 1];

    const dxBurst = origX - input.burstX;
    const dyBurst = origY - input.burstY;
    const radiusSq = dxBurst * dxBurst + dyBurst * dyBurst;
    const influence = burst > 0 && radiusSq < cutoffSq
      ? Math.exp(-radiusSq / twoSigmaSq)
      : 0;

    const angle = seed * Math.PI * 2 + origX * 0.008;
    const radialLength = Math.sqrt(radiusSq + 80);
    // Local particles fly apart and swirl, while distant letters remain intact.
    const burstOffsetX = influence * burst * (
      dxBurst / radialLength * 91 +
      Math.cos(angle + input.time * 0.8) * (50 + seed * 50)
    );
    const burstOffsetY = influence * burst * (
      dyBurst / radialLength * 71 +
      Math.sin(angle + input.time * 0.8) * (42 + seed * 42)
    );

    const tx = origX + burstOffsetX + Math.sin(input.time * 0.8 + seed * 19) * 0.30;
    const ty = origY + burstOffsetY + Math.cos(input.time * 0.7 + seed * 17) * 0.30;
    const tz = targets[j + 2] + influence * burst * (seed - 0.5) * 35;

    let localX = 0;
    let localY = 0;
    if (input.pointerActive) {
      // Only the original neighborhood of the pointer can be stirred.
      const dxHome = origX - input.pointerX;
      const dyHome = origY - input.pointerY;
      const homeSq = dxHome * dxHome + dyHome * dyHome;
      if (homeSq < cutoffSq) {
        const falloff = Math.exp(-homeSq / twoSigmaSq);
        const dx = pos[j] - input.pointerX;
        const dy = pos[j + 1] - input.pointerY;
        const invDist = 1 / Math.sqrt(dx * dx + dy * dy + 60);
        localX = falloff * (
          dx * invDist * (950 + pointerSpeed * 1800) +
          input.pointerVX * 1.15 - dy * invDist * 340 * pointerSpeed
        );
        localY = falloff * (
          dy * invDist * (950 + pointerSpeed * 1800) +
          input.pointerVY * 1.15 + dx * invDist * 340 * pointerSpeed
        );
      }
    }

    vel[j] = (vel[j] + ((tx - pos[j]) * spring + localX) * dt) * damping;
    vel[j + 1] = (vel[j + 1] + ((ty - pos[j + 1]) * spring + localY) * dt) * damping;
    vel[j + 2] = (vel[j + 2] + (tz - pos[j + 2]) * spring * dt) * damping;

    pos[j] += vel[j] * dt;
    pos[j + 1] += vel[j + 1] * dt;
    pos[j + 2] += vel[j + 2] * dt;
    const speed = Math.hypot(vel[j], vel[j + 1], vel[j + 2]);
    data.energy[i] = Math.min(1, speed / 220 + influence * burst * 0.28);
  }
}
