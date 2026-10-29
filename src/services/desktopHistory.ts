import type { DesktopPosition } from "./desktopElements";

export interface PositionSnapshot {
  clock: DesktopPosition;
  cards: { id: string; position: DesktopPosition }[];
}
export interface PositionHistory {
  past: PositionSnapshot[];
  future: PositionSnapshot[];
}
export const HISTORY_LIMIT = 30;
export const emptyPositionHistory = (): PositionHistory => ({ past: [], future: [] });

export function snapshotPositions(
  clock: DesktopPosition,
  cards: readonly { id: string; position: DesktopPosition }[],
): PositionSnapshot {
  return {
    clock: { ...clock },
    cards: cards.map(({ id, position }) => ({ id, position: { ...position } })),
  };
}
export function samePositions(a: PositionSnapshot, b: PositionSnapshot): boolean {
  return a.clock.x === b.clock.x && a.clock.y === b.clock.y &&
    a.cards.length === b.cards.length && a.cards.every((item, index) =>
      item.id === b.cards[index].id &&
      item.position.x === b.cards[index].position.x &&
      item.position.y === b.cards[index].position.y);
}

/** Called once at drag start, or before one keyboard nudge. */
export function checkpointPositions(history: PositionHistory, current: PositionSnapshot): PositionHistory {
  return {
    past: [...history.past, current].slice(-HISTORY_LIMIT),
    future: [],
  };
}
export function undoPositions(history: PositionHistory, current: PositionSnapshot): {
  history: PositionHistory; snapshot: PositionSnapshot | null;
} {
  const target = history.past.at(-1);
  if (!target) return { history, snapshot: null };
  return {
    snapshot: target,
    history: {
      past: history.past.slice(0, -1),
      future: [...history.future, current].slice(-HISTORY_LIMIT),
    },
  };
}
export function redoPositions(history: PositionHistory, current: PositionSnapshot): {
  history: PositionHistory; snapshot: PositionSnapshot | null;
} {
  const target = history.future.at(-1);
  if (!target) return { history, snapshot: null };
  return {
    snapshot: target,
    history: {
      past: [...history.past, current].slice(-HISTORY_LIMIT),
      future: history.future.slice(0, -1),
    },
  };
}
