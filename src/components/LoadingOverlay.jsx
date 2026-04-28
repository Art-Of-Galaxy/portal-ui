import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useLoading } from "../context/LoadingContext";

export function LoadingOverlay() {
  const { state } = useLoading();
  const { open, messages, intervalMs, label } = state;
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("in");

  // Reset position when the overlay (re)opens or the message list changes.
  useEffect(() => {
    if (open) {
      setIndex(0);
      setPhase("in");
    }
  }, [open, messages]);

  useEffect(() => {
    if (!open || !messages || messages.length <= 1) return undefined;
    const tick = setInterval(() => {
      setPhase("out");
      setTimeout(() => {
        setIndex((i) => (i + 1) % messages.length);
        setPhase("in");
      }, 220);
    }, Math.max(800, intervalMs || 2500));
    return () => clearInterval(tick);
  }, [open, messages, intervalMs]);

  if (!open) return null;

  const text = (messages && messages[index]) || "Thinking…";

  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-overlay-card">
        <div className="loading-overlay-orb">
          <Sparkles size={20} />
          <span className="loading-overlay-pulse" aria-hidden="true" />
        </div>

        {label ? <p className="loading-overlay-label">{label}</p> : null}

        <p className={`loading-overlay-text loading-overlay-text-${phase}`}>{text}</p>

        <div className="loading-overlay-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
