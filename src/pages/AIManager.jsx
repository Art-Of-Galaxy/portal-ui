import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, RefreshCw, ArrowRight, X } from "lucide-react";
import AIStrategist from "../components/strategist/AIStrategist";

// Full-page AI Manager. Same chat surface as the per-service strategists,
// but rendered in chat-only mode (no sidebar, no per-stage checklist)
// because the Manager works freely with the user. The backend service
// is `manager`, which gives the model:
//  - a wider persona that knows every portal service,
//  - tool access (list_user_projects, list_user_files, generate_logo_design),
//  - a routing policy that does NOT auto-redirect — the user can choose
//    to deep-link to a custom form via the suggestion card below the chat.

export default function AIManager() {
  const navigate = useNavigate();
  const [suggestedRoute, setSuggestedRoute] = useState("");
  const strategistRef = useRef(null);

  // When the LLM emits a `route`, surface it as a clickable suggestion
  // instead of auto-navigating away. This is the fix for "every time I
  // ask about a service it kicks me off the page".
  function handleRoute(route) {
    if (typeof route !== "string" || !route.trim()) return;
    setSuggestedRoute(route.trim());
  }

  function handleAcceptRoute() {
    if (!suggestedRoute) return;
    const target = suggestedRoute;
    setSuggestedRoute("");
    navigate(target);
  }

  function handleDismissRoute() {
    setSuggestedRoute("");
  }

  function handleStartOver() {
    strategistRef.current?.startOver?.();
  }

  const header = (
    <div className="strategist-header-row">
      <div className="strategist-header-titlewrap">
        <h2 className="strategist-header-title">AOG AI Manager</h2>
        <span className="strategist-header-sub">Knows every service, your projects, and your files</span>
      </div>
      <span className="strategist-header-tag">
        <Sparkles size={12} /> Full context
      </span>
    </div>
  );

  return (
    <div className="portal-page strategist-page ai-manager-page">
      <div className="ai-manager-topbar">
        <h1>AI Manager</h1>
        <button
          type="button"
          className="ai-manager-reset"
          onClick={handleStartOver}
          title="Start a fresh conversation"
        >
          <RefreshCw size={13} /> Start over
        </button>
      </div>

      {suggestedRoute ? (
        <div className="ai-manager-route-card">
          <div>
            <strong>Open the custom form?</strong>
            <p>
              I can take you to <code>{suggestedRoute}</code> if you&apos;d rather fill out the
              detailed brief yourself.
            </p>
          </div>
          <div className="ai-manager-route-actions">
            <button type="button" className="ai-manager-route-accept" onClick={handleAcceptRoute}>
              Take me there <ArrowRight size={13} />
            </button>
            <button
              type="button"
              className="ai-manager-route-dismiss"
              onClick={handleDismissRoute}
              aria-label="Stay in chat"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      ) : null}

      <AIStrategist
        ref={strategistRef}
        service="manager"
        chatOnly
        header={header}
        onRoute={handleRoute}
      />
    </div>
  );
}
