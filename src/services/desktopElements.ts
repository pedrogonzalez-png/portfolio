/** Browser-only editor state. Imported images are session-scoped blob URLs, not uploaded. */
export interface DesktopPosition { x: number; y: number }
export interface DesktopImageCard {
  id: string;
  url: string;
  name: string;
  position: DesktopPosition;
}
export const MAX_SESSION_CARDS = 20;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const acceptedExtensions: Record<string, RegExp> = {
  "image/png": /\.png$/i,
  "image/jpeg": /\.(jpe?g)$/i,
  "image/webp": /\.webp$/i,
};

export function isSupportedCardImage(file: File): boolean {
  return file.size > 0 && file.size <= MAX_IMAGE_BYTES &&
    (acceptedExtensions[file.type]?.test(file.name) ?? false);
}

export function positionWithinDesktop(position: DesktopPosition): DesktopPosition {
  return {
    x: Math.max(0, Math.min(84, position.x)),
    y: Math.max(0, Math.min(76, position.y)),
  };
}

export function moveDesktopPosition(
  current: DesktopPosition,
  key: string,
  step = 2,
): DesktopPosition {
  const offsets: Record<string, DesktopPosition> = {
    ArrowLeft: { x: -step, y: 0 },
    ArrowRight: { x: step, y: 0 },
    ArrowUp: { x: 0, y: -step },
    ArrowDown: { x: 0, y: step },
  };
  const offset = offsets[key];
  if (!offset) return current;
  return positionWithinDesktop({ x: current.x + offset.x, y: current.y + offset.y });
}
