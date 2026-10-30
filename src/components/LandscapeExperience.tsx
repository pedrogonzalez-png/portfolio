import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import "../styles/mobile-landscape-experience.css";

/**
 * Mobile-only experience frame. Mobile browsers usually do NOT allow a normal
 * website to force screen orientation; rotating the viewport with CSS is a
 * reliable fallback that displays the complete landscape interface even while
 * the phone itself is held upright.
 *
 * The portal bypasses project carousel transforms / stacking contexts and
 * gives the original game / site / theme page the entire mobile viewport.
 */
const MOBILE_QUERY = "(pointer: coarse) and (max-width: 1280px)";

function isMobileExperience() {
  return typeof window !== "undefined" &&
    Boolean(window.matchMedia?.(MOBILE_QUERY)?.matches);
}

export function LandscapeExperience({
  children,
  title,
  closing = false,
}: {
  children: ReactNode;
  title: string;
  closing?: boolean;
}) {
  const [mobile, setMobile] = useState(isMobileExperience);

  useEffect(() => {
    const query = window.matchMedia?.(MOBILE_QUERY);
    if (!query) return;
    const onChange = () => setMobile(query.matches);
    onChange();
    query.addEventListener?.("change", onChange);
    return () => query.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (!mobile) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [mobile]);

  if (!mobile) return <>{children}</>;
  return createPortal(
    <div className="mobile-landscape-experience" role="dialog" aria-modal="true" aria-label={title}>
      <div className={"mobile-landscape-stage" + (closing ? " is-closing" : "")}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
