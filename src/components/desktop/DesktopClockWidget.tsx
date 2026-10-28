import { useEffect, useState } from "react";
import type { ThemePalette } from "../../stores/themes";

/** Web adaptation of the reference DigitalClock.qml: actual visitor-local time/date. */
export function DesktopClockWidget({ palette }: { palette: ThemePalette }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const time = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(now);
  const date = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  }).format(now);
  return (
    <div className="desktop-clock-widget" role="group" aria-label="Widget relógio digital"
      style={{
        backgroundColor: palette.surfaceContainerHigh,
        borderColor: palette.outline, color: palette.text,
      }}>
      <span className="desktop-clock-kicker" style={{ color: palette.accentYellow }}>
        DIGITAL / LOCAL
      </span>
      <time className="desktop-clock-time" dateTime={now.toISOString()}>{time}</time>
      <span className="desktop-clock-date">{date}</span>
    </div>
  );
}
