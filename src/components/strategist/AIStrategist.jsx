import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Check, Loader2, RefreshCw, Sparkles, Maximize2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { apiServices } from "../../services/apiServices";

// Brand-aligned SVG asset pack for the AI Strategist chat surface.
// Replaces the generic lucide icons in the composer / avatar so the
// chat matches the design files. Falls back gracefully if any asset
// is missing (each <img> just hides on error).
import aiStrategistAvatar from "../../assets/branding/logo/assets/AI_Strategist.svg";
import aiAttachIcon from "../../assets/branding/logo/assets/AI_Attach.svg";
import aiMicIcon from "../../assets/branding/logo/assets/AI_Mic.svg";
import aiVoiceIcon from "../../assets/branding/logo/assets/AI_Voice.svg";
import aiSendIcon from "../../assets/branding/logo/assets/AI_Send.svg";

// Reusable conversational AI Strategist surface. Owns the message loop,
// quick-reply chips, voice/attachment slots and the progress checklist.
// The hosting page only has to:
//   - pass the `service` ("logo_design", "global", etc.)
//   - render a `header` slot (title, sub-service pill, change-method link)
//   - listen for `onReadyToGenerate(brief, session)` to hand the brief
//     to its generator service
//
// State (session id, messages, brief, checklist) is persisted server-side
// so reloading the page resumes from the same place.

const PERSIST_KEY = (service) => `aog.strategist.session.${service}`;

function readSessionId(service) {
  try {
    const raw = window.localStorage.getItem(PERSIST_KEY(service));
    const id = raw ? Number(raw) : NaN;
    return Number.isInteger(id) ? id : null;
  } catch {
    return null;
  }
}

function writeSessionId(service, id) {
  try {
    if (id == null) {
      window.localStorage.removeItem(PERSIST_KEY(service));
    } else {
      window.localStorage.setItem(PERSIST_KEY(service), String(id));
    }
  } catch { /* ignore */ }
}

function defaultRequiredCheck(brief, requiredFields) {
  if (!brief || typeof brief !== "object") return false;
  if (!Array.isArray(requiredFields) || !requiredFields.length) return true;
  return requiredFields.every((key) => {
    const v = brief[key];
    if (Array.isArray(v)) return v.length > 0;
    return typeof v === "string" ? v.trim().length > 0 : Boolean(v);
  });
}

function AIStrategist({
  service,
  checklistSteps,
  header,
  onReadyToGenerate,
  onSessionChange,
  onRoute,
  generateLabel,
  generating,
  requiredFields,
  chatOnly,
}, ref) {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [brief, setBrief] = useState({});
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  // Load or create a session on mount. The session id persists in
  // localStorage so refresh resumes the same conversation.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingSession(true);
      setError("");
      try {
        const existingId = readSessionId(service);
        if (existingId) {
          try {
            const res = await apiServices.strategist_get(existingId);
            if (cancelled) return;
            if (res?.success && res.session?.state === "in_progress") {
              applySession(res.session);
              setLoadingSession(false);
              return;
            }
          } catch {
            // session missing or expired; fall through to a fresh one
          }
        }
        const fresh = await apiServices.strategist_start({ service });
        if (cancelled) return;
        if (!fresh?.success) throw new Error(fresh?.message || "Could not start session");
        applySession(fresh.session);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Could not start the strategist.");
      } finally {
        if (!cancelled) setLoadingSession(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const applySession = (s) => {
    setSession(s);
    writeSessionId(service, s.id);
    setMessages(Array.isArray(s.messages) ? s.messages : []);
    setChecklist(Array.isArray(s.checklist) ? s.checklist : []);
    setBrief(s.brief || {});
    setReady(Boolean(s.ready_to_generate));
    if (typeof onSessionChange === "function") onSessionChange(s);
  };

  const lastAssistantSuggestions = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const m = messages[i];
      if (m.role === "assistant" && Array.isArray(m.suggestions) && m.suggestions.length) {
        return m.suggestions;
      }
      if (m.role === "user") break;
    }
    return [];
  }, [messages]);

  async function sendMessage(text) {
    const trimmed = (text || "").trim();
    if (!trimmed || sending || !session?.id) return;
    setInput("");
    setError("");

    // Optimistic user bubble; we replace messages from the server response.
    setMessages((prev) => [
      ...prev,
      { id: `tmp-${Date.now()}`, role: "user", content: trimmed, suggestions: [] },
    ]);
    setSending(true);
    try {
      const res = await apiServices.strategist_turn({
        session_id: session.id,
        message: trimmed,
      });
      if (!res?.success) throw new Error(res?.message || "Strategist could not reply");
      // Reload to pick up canonical message history (and persisted ids).
      const full = await apiServices.strategist_get(session.id);
      if (full?.success) applySession(full.session);
      setReady(Boolean(res.ready_to_generate));
      // Route deep-link: if the LLM emitted a route in this turn, hand
      // it to the host to decide whether to navigate.
      if (res.route && typeof onRoute === "function") onRoute(res.route);
    } catch (err) {
      setError(err?.message || "Something went wrong. Try again?");
      setMessages((prev) => prev.filter((m) => !String(m.id || "").startsWith("tmp-")));
    } finally {
      setSending(false);
    }
  }

  function handleChipClick(label) {
    // Chips that look like placeholders ("Type your brand name...") focus
    // the input rather than being sent as a literal answer.
    if (/^[^A-Za-z0-9]?\s*type\s+your/i.test(label)) {
      document.getElementById("strategist-composer")?.focus();
      return;
    }
    sendMessage(label);
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input);
  }

  const handleStartOver = useCallback(async () => {
    if (sending) return;
    writeSessionId(service, null);
    setSession(null);
    setMessages([]);
    setChecklist([]);
    setBrief({});
    setReady(false);
    setError("");
    setLoadingSession(true);
    try {
      const fresh = await apiServices.strategist_start({ service });
      if (!fresh?.success) throw new Error(fresh?.message || "Could not restart");
      applySession(fresh.session);
    } catch (err) {
      setError(err?.message || "Could not restart the strategist.");
    } finally {
      setLoadingSession(false);
    }
    // applySession depends on onSessionChange which the parent owns; treat
    // it as stable for this hook's purposes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sending, service]);

  // Imperative handle: parent pages (e.g. AIManager) can hold the
  // Start over button outside this component and trigger reset via ref.
  useImperativeHandle(ref, () => ({
    startOver: handleStartOver,
    isBusy: () => sending || loadingSession,
  }), [handleStartOver, sending, loadingSession]);

  function handleGenerate() {
    if (typeof onReadyToGenerate === "function") {
      onReadyToGenerate(brief, session);
    }
  }

  return (
    <div className={`strategist-shell ${chatOnly ? "is-chat-only" : ""}`}>
      {/* -------- Sidebar with persona + checklist --------
          Hidden entirely in chat-only mode (e.g. the AI Manager, which
          wants a free-form full-width chat without the per-service
          checklist scaffolding). */}
      {!chatOnly ? (
      <aside className="strategist-side">
        <div className="strategist-side-persona">
          <span className="strategist-avatar">
            <img src={aiStrategistAvatar} alt="" />
          </span>
          <div>
            <strong>AOG Strategist</strong>
            <span>Brand &amp; Design AI</span>
          </div>
        </div>
        <hr className="strategist-side-divider" />
        <div className="strategist-side-section">
          <span className="strategist-side-label">Covering Today</span>
          <ol className="strategist-checklist">
            {checklistSteps.map((step, i) => {
              const entry = checklist.find((c) => c.id === step.id) || {};
              const status = entry.status || (i === 0 ? "active" : "pending");
              return (
                <li key={step.id} className={`strategist-checklist-item is-${status}`}>
                  <span className="strategist-checklist-marker">
                    {status === "done" ? <Check size={11} /> : i + 1}
                  </span>
                  <span className="strategist-checklist-label">{step.label}</span>
                </li>
              );
            })}
          </ol>
        </div>
        {/* Manual override: once the brief has all required fields, expose
            a "Generate now" button in the sidebar even if the LLM hasn't
            flipped ready_to_generate yet. Stops the user getting stuck. */}
        {typeof onReadyToGenerate === "function" ? (
          <button
            type="button"
            className={`strategist-side-generate ${defaultRequiredCheck(brief, requiredFields) ? "is-ready" : ""}`}
            onClick={handleGenerate}
            disabled={!defaultRequiredCheck(brief, requiredFields) || generating}
            title={defaultRequiredCheck(brief, requiredFields)
              ? "Generate now with what we have so far"
              : "Fill in a few more details first"}
          >
            <Sparkles size={12} />
            {generating ? "Generating..." : "Generate now"}
          </button>
        ) : null}
        <button
          type="button"
          className="strategist-side-reset"
          onClick={handleStartOver}
          disabled={sending || loadingSession}
        >
          <RefreshCw size={12} /> Start over
        </button>
      </aside>
      ) : null}

      {/* -------- Main chat panel -------- */}
      <section className="strategist-chat">
        <header className="strategist-chat-header">{header}</header>

        <div className="strategist-chat-scroll" ref={scrollRef}>
          {loadingSession ? (
            <div className="strategist-chat-loading">
              <Loader2 size={16} className="strategist-spin" /> Waking up the strategist...
            </div>
          ) : null}

          {messages.map((m) => (
            <MessageRow key={m.id} message={m} />
          ))}

          {sending ? (
            <div className="strategist-msg is-assistant">
              <span className="strategist-msg-avatar">
                <img src={aiStrategistAvatar} alt="" />
              </span>
              <div className="strategist-msg-bubble">
                <span className="strategist-typing">
                  <span /><span /><span />
                </span>
              </div>
            </div>
          ) : null}

          {/* Quick-reply chips: shown under the last assistant message. */}
          {!sending && lastAssistantSuggestions.length ? (
            <div className="strategist-chips">
              {lastAssistantSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="strategist-chip"
                  onClick={() => handleChipClick(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}

          {/* Hide the generate card entirely when the host didn't pass a
              handler (e.g. the global dock, where there's nothing to
              generate). For per-service pages, show it once the LLM flips
              ready_to_generate. */}
          {typeof onReadyToGenerate === "function" && ready ? (
            <div className="strategist-ready-card">
              <strong>Ready when you are.</strong>
              <p>I have everything I need to generate your concepts.</p>
              <button
                type="button"
                className="strategist-ready-btn"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 size={14} className="strategist-spin" /> {generateLabel || "Generating..."}
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> {generateLabel || "I'm ready, generate"}
                  </>
                )}
              </button>
            </div>
          ) : null}

          {error ? <div className="strategist-error">{error}</div> : null}
        </div>

        {/* -------- Composer -------- */}
        <form className="strategist-composer" onSubmit={handleSubmit}>
          <button
            type="button"
            className="strategist-composer-icon"
            aria-label="Attach a file"
            title="Attach (coming soon)"
            disabled
          >
            <img src={aiAttachIcon} alt="" />
          </button>
          <input
            id="strategist-composer"
            className="strategist-composer-input"
            placeholder="Type your answer here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending || loadingSession}
          />
          <button
            type="button"
            className="strategist-composer-icon"
            aria-label="Voice (coming soon)"
            title="Voice (coming soon)"
            disabled
          >
            <img src={aiMicIcon} alt="" />
          </button>
          <button
            type="button"
            className="strategist-composer-icon"
            aria-label="Pause"
            title="Pause"
            disabled
          >
            <img src={aiVoiceIcon} alt="" />
          </button>
          <button
            type="submit"
            className="strategist-composer-send"
            disabled={!input.trim() || sending || loadingSession}
            aria-label="Send"
          >
            {sending
              ? <Loader2 size={16} className="strategist-spin" />
              : <img src={aiSendIcon} alt="" />}
          </button>
        </form>
      </section>
    </div>
  );
}

function MessageRow({ message }) {
  const isAssistant = message.role === "assistant";
  const attachments = Array.isArray(message.attachments) ? message.attachments : [];
  return (
    <div className={`strategist-msg ${isAssistant ? "is-assistant" : "is-user"}`}>
      {isAssistant ? (
        <span className="strategist-msg-avatar">
          <img src={aiStrategistAvatar} alt="" />
        </span>
      ) : null}
      <div className="strategist-msg-bubble-wrap">
        {message.content ? (
          <div className="strategist-msg-bubble">
            {String(message.content).split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        ) : null}
        {attachments.map((att, i) => (
          <AttachmentCard key={`${message.id}-att-${i}`} attachment={att} />
        ))}
      </div>
      {!isAssistant ? <span className="strategist-msg-avatar is-user">A</span> : null}
    </div>
  );
}

MessageRow.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    role: PropTypes.string,
    content: PropTypes.string,
    attachments: PropTypes.array,
  }).isRequired,
};

function AttachmentCard({ attachment }) {
  const [previewIndex, setPreviewIndex] = useState(-1);

  const images = useMemo(() => (
    attachment?.type === "logo_concepts" && Array.isArray(attachment.images)
      ? attachment.images.filter((img) => img && img.url)
      : []
  ), [attachment]);

  // Keyboard nav while the lightbox is open. Esc closes, arrows step.
  useEffect(() => {
    if (previewIndex < 0 || !images.length) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setPreviewIndex(-1);
      else if (e.key === "ArrowRight") setPreviewIndex((i) => (i + 1) % images.length);
      else if (e.key === "ArrowLeft") setPreviewIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewIndex, images.length]);

  if (!attachment || typeof attachment !== "object") return null;
  if (attachment.type !== "logo_concepts" || !images.length) return null;

  // 3+ images flow into a 4-up row (small thumbs), 1-2 stay 2-up.
  const gridClass = images.length >= 3 ? "is-compact" : "is-roomy";

  return (
    <div className="strategist-attachment strategist-attachment-images">
      <div className="strategist-attachment-header">
        <strong>Logo concepts for {attachment.brand_name || "your brand"}</strong>
        <span>{images.length} variation{images.length === 1 ? "" : "s"}</span>
      </div>
      <div className={`strategist-attachment-grid ${gridClass}`}>
        {images.map((img, i) => (
          <button
            key={img.url || i}
            type="button"
            className="strategist-attachment-tile"
            onClick={() => setPreviewIndex(i)}
            title={img.label || `Concept ${i + 1}`}
          >
            <img src={img.url} alt={img.label || `Concept ${i + 1}`} />
            <span className="strategist-attachment-tile-zoom" aria-hidden="true">
              <Maximize2 size={12} />
            </span>
            <span className="strategist-attachment-caption">
              {img.label || `Concept ${i + 1}`}
            </span>
          </button>
        ))}
      </div>

      {/* Lightbox overlay. Click backdrop to close, Esc / ← / → for kb nav.
          Reuses the same .logo-preview-overlay visual already used by the
          full Logo Design result page so behaviour is consistent. */}
      {previewIndex >= 0 && images[previewIndex] ? (
        <div
          className="logo-preview-overlay"
          onClick={() => setPreviewIndex(-1)}
        >
          <div className="logo-preview-counter">
            {images[previewIndex].label || `Concept ${previewIndex + 1}`} of {images.length}
          </div>

          {images.length > 1 ? (
            <button
              type="button"
              className="logo-preview-nav is-prev"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewIndex((i) => (i - 1 + images.length) % images.length);
              }}
              aria-label="Previous concept"
            >
              <ChevronLeft size={22} />
            </button>
          ) : null}

          <button
            type="button"
            className="logo-preview-close"
            onClick={(e) => { e.stopPropagation(); setPreviewIndex(-1); }}
            aria-label="Close preview"
          >
            <X size={18} />
          </button>

          <div
            className="logo-preview-frame"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={images[previewIndex].url} alt={images[previewIndex].label || `Concept ${previewIndex + 1}`} />
          </div>

          {images.length > 1 ? (
            <button
              type="button"
              className="logo-preview-nav is-next"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewIndex((i) => (i + 1) % images.length);
              }}
              aria-label="Next concept"
            >
              <ChevronRight size={22} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

AttachmentCard.propTypes = {
  attachment: PropTypes.object.isRequired,
};

AIStrategist.propTypes = {
  service: PropTypes.string.isRequired,
  checklistSteps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  header: PropTypes.node,
  onReadyToGenerate: PropTypes.func,
  onSessionChange: PropTypes.func,
  onRoute: PropTypes.func,
  generateLabel: PropTypes.string,
  generating: PropTypes.bool,
  requiredFields: PropTypes.arrayOf(PropTypes.string),
  chatOnly: PropTypes.bool,
};

AIStrategist.defaultProps = {
  checklistSteps: [],
  header: null,
  onReadyToGenerate: undefined,
  onSessionChange: undefined,
  onRoute: undefined,
  generateLabel: "",
  generating: false,
  requiredFields: [],
  chatOnly: false,
};

// forwardRef wrapper: parent pages get an imperative handle with
// `startOver()` so they can host their own Start-over button outside
// the chat shell (the AI Manager page does this).
const AIStrategistForwarded = forwardRef(AIStrategist);
AIStrategistForwarded.displayName = "AIStrategist";
export default AIStrategistForwarded;
