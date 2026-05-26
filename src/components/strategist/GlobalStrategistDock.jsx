import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles, X, ChevronDown, RefreshCw, Maximize2 } from "lucide-react";
import AIStrategist from "./AIStrategist";

// Floating dashboard-wide AOG Assistant. Sits in the bottom-right of every
// authenticated page. The dock keeps minimal state of its own (open/closed,
// minimised) and lets the embedded AIStrategist handle the actual chat
// session, which is persisted server-side under service="global".
//
// Two ways the assistant routes the user into a service:
//  1. The LLM emits a `route` field in its response. We navigate immediately.
//  2. A user-tapped chip whose label matches a known service keyword. We
//     navigate before sending it as a message (cheaper than a round-trip).

const GLOBAL_CHECKLIST = [
  { id: "context",  label: "What you need" },
  { id: "service",  label: "Right service" },
  { id: "handoff",  label: "Pick up where you left off" },
];

const SERVICE_DEEP_LINKS = [
  { match: /start\s+logo|logo\s+(design|generation)/i,   path: "/new-projects/branding-design/logo" },
  { match: /brand\s+guidelines/i,                        path: "/new-projects/branding-design/brand-guidelines" },
  { match: /rebrand/i,                                   path: "/new-projects/branding-design/rebranding" },
  { match: /e[-\s]?commerce\s+mockups?/i,                path: "/new-projects/branding-design/ecommerce-mockups" },
  { match: /resume.*last|my\s+projects/i,                path: "/my-projects" },
  { match: /ai\s+manager|full\s+manager/i,               path: "/ai-manager" },
];

// Routes where the dock should stay hidden (login/signup, etc.). Also
// hidden on the AI Manager page itself because that page IS the full chat
// surface and having the dock on top would be confusing.
const HIDE_ON = [
  /^\/login/,
  /^\/signup/,
  /^\/auth\/callback/,
  /^\/forgot-password/,
  /^\/create-project$/,
  /^\/ai-manager/,
];

const PERSIST_KEY = "aog.strategist.session.global";

export default function GlobalStrategistDock() {
  const [open, setOpen] = useState(false);
  const [minimised, setMinimised] = useState(false);
  // Bumping this remounts the embedded AIStrategist, which is the simplest
  // way to throw away the current conversation state from outside.
  const [resetSeed, setResetSeed] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const hidden = HIDE_ON.some((re) => re.test(location.pathname));

  // Collapse on route change so the dock doesn't obscure the page the user
  // just landed on.
  useEffect(() => {
    setOpen(false);
    setMinimised(false);
  }, [location.pathname]);

  // Chip clicks are intercepted at the AIStrategist level via DOM bubble.
  // If the chip matches a known service keyword, we navigate immediately
  // and skip sending the round-trip to the strategist (LLM round-trip
  // would just say "great, here you go" anyway).
  useEffect(() => {
    if (!open) return undefined;
    function handler(e) {
      const target = e.target?.closest?.(".strategist-dock .strategist-chip");
      if (!target) return;
      const label = target.textContent || "";
      const hit = SERVICE_DEEP_LINKS.find((s) => s.match.test(label));
      if (hit) {
        e.stopPropagation();
        navigate(hit.path);
        setOpen(false);
      }
    }
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [open, navigate]);

  if (hidden) return null;

  function handleRoute(route) {
    if (!route || typeof route !== "string") return;
    navigate(route);
    setOpen(false);
  }

  function handleStartFresh() {
    try { localStorage.removeItem(PERSIST_KEY); } catch { /* ignore */ }
    setResetSeed((n) => n + 1);
  }

  if (!open) {
    return (
      <button
        type="button"
        className="strategist-dock-launcher"
        onClick={() => setOpen(true)}
        aria-label="Open AOG Assistant"
      >
        <Sparkles size={16} />
        <span>Ask AOG</span>
      </button>
    );
  }

  return (
    <div className={`strategist-dock ${minimised ? "is-minimised" : ""}`}>
      <header className="strategist-dock-header">
        <div className="strategist-dock-title">
          <span className="strategist-dock-avatar">AG</span>
          <div>
            <strong>AOG Assistant</strong>
            <span>Cross-service guide</span>
          </div>
        </div>
        <div className="strategist-dock-actions">
          <button
            type="button"
            onClick={handleStartFresh}
            aria-label="Start fresh"
            title="Start fresh"
          >
            <RefreshCw size={13} />
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); navigate("/ai-manager"); }}
            aria-label="Open full AI Manager"
            title="Open full AI Manager"
          >
            <Maximize2 size={13} />
          </button>
          <button
            type="button"
            onClick={() => setMinimised((v) => !v)}
            aria-label={minimised ? "Expand" : "Minimise"}
          >
            <ChevronDown size={14} style={{ transform: minimised ? "rotate(180deg)" : undefined }} />
          </button>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close">
            <X size={14} />
          </button>
        </div>
      </header>

      {!minimised ? (
        <div className="strategist-dock-body">
          <AIStrategist
            key={resetSeed}
            service="global"
            checklistSteps={GLOBAL_CHECKLIST}
            header={null}
            onRoute={handleRoute}
          />
        </div>
      ) : null}
    </div>
  );
}
