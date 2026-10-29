import { useRef } from "react";
import type { KeyboardEvent, PointerEvent, ReactNode } from "react";
import { moveDesktopPosition, positionWithinDesktop } from "../../services/desktopElements";
import type { DesktopPosition } from "../../services/desktopElements";

export function DesktopMovable({ position, onMove, onMoveStart, label, onRemove, children, areaRef }: {
  position: DesktopPosition;
  onMove: (position: DesktopPosition) => void;
  onMoveStart?: () => void;
  label: string;
  onRemove: () => void;
  children: ReactNode;
  areaRef: React.RefObject<HTMLDivElement | null>;
}) {
  const dragRef = useRef<{
    pointer: number; clientX: number; clientY: number;
    origin: DesktopPosition; width: number; height: number;
  } | null>(null);

  const start = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || !areaRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    event.preventDefault();
    onMoveStart?.();
    dragRef.current = {
      pointer: event.pointerId, clientX: event.clientX, clientY: event.clientY,
      origin: position, width: rect.width, height: rect.height,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointer !== event.pointerId) return;
    onMove(positionWithinDesktop({
      x: drag.origin.x + (event.clientX - drag.clientX) * 100 / drag.width,
      y: drag.origin.y + (event.clientY - drag.clientY) * 100 / drag.height,
    }));
  };
  const finish = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragRef.current?.pointer !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const next = moveDesktopPosition(position, event.key, event.shiftKey ? 5 : 2);
    if (next === position || (next.x === position.x && next.y === position.y)) return;
    event.preventDefault();
    onMoveStart?.();
    onMove(next);
  };

  return (
    <div className="desktop-editable-element" style={{ left: position.x + "%", top: position.y + "%" }}>
      <div className="desktop-element-controls">
        <button type="button" className="desktop-element-handle"
          aria-label={"Mover " + label + " (arrastar ou usar setas)"}
          title="Arraste ou use as setas; Shift + seta move mais"
          onPointerDown={start} onPointerMove={move}
          onPointerUp={finish} onPointerCancel={finish} onKeyDown={onKeyDown}>
          <span aria-hidden="true">⠿</span> Mover
        </button>
        <button type="button" className="desktop-element-remove"
          aria-label={"Remover " + label} onClick={onRemove}>✕</button>
      </div>
      {children}
    </div>
  );
}
