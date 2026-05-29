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
  checklistSteps = [],
  header = null,
  onReadyToGenerate,
  onSessionChange,
  onRoute,
  generateLabel = "",
  generating = false,
  requiredFields = [],
  chatOnly = false,
  /* When set, drives which session is loaded (instead of the localStorage
     "last session" heuristic). The AI Manager uses this to switch
     between multiple parallel conversations. */
  activeSessionId = null,
}, ref) {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [brief, setBrief] = useState({});
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendingMode, setSendingMode] = useState("thinking");
  const [loadingSession, setLoadingSession] = useState(true);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  // Load or create a session on mount. Three modes:
  //   1. activeSessionId set    -> load that session
  //   2. localStorage has an id -> resume
  //   3. otherwise              -> start a fresh one
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingSession(true);
      setError("");
      try {
        // Mode 1: parent told us exactly which session to load.
        if (activeSessionId) {
          try {
            const res = await apiServices.strategist_get(activeSessionId);
            if (cancelled) return;
            if (res?.success && res.session) {
              applySession(res.session);
              setLoadingSession(false);
              return;
            }
          } catch {
            /* fall through to fresh */
          }
        }
        // Mode 2: resume from localStorage.
        const existingId = activeSessionId ? null : readSessionId(service);
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
        // Mode 3: start fresh.
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
  }, [service, activeSessionId]);

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

  // Latest assistant turn's chips + whether they're multi-select.
  // Multi-select state is persisted via a `chip_meta` attachment on the
  // message so a page reload preserves the mode.
  const lastAssistantChips = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const m = messages[i];
      if (m.role === "assistant" && Array.isArray(m.suggestions) && m.suggestions.length) {
        const meta = (Array.isArray(m.attachments) ? m.attachments : [])
          .find((a) => a && a.type === "chip_meta");
        return { items: m.suggestions, multi: Boolean(meta?.multi_select) };
      }
      if (m.role === "user") break;
    }
    return { items: [], multi: false };
  }, [messages]);

  // Local accumulator for multi-select chip picks. Cleared whenever the
  // chip set changes (new assistant turn).
  const [pickedChips, setPickedChips] = useState([]);
  const chipsFingerprint = `${lastAssistantChips.multi ? "m" : "s"}:${lastAssistantChips.items.join("|")}`;
  useEffect(() => { setPickedChips([]); }, [chipsFingerprint]);

  async function sendMessage(text) {
    const trimmed = (text || "").trim();
    if (!trimmed || sending || !session?.id) return;
    setInput("");
    setError("");

    // Heuristic: when the user explicitly asks for a logo / generation,
    // we expect the next turn to invoke generate_logo_design, which
    // takes ~15-30s. Mark sendingMode so the typing indicator shows a
    // shimmer card with an honest expectation instead of an opaque
    // three-dot loader (this is why generation felt "stuck").
    const looksLikeGeneration = /\b(make|generate|create|design|build)\b.*\b(logo|brand|concept|design)\b/i.test(trimmed)
      || /\b(go\s+ahead|do\s+it|ready|okay|yes|please)\b/i.test(trimmed);
    setSendingMode(looksLikeGeneration ? "generating" : "thinking");

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
      setSendingMode("thinking");
    }
  }

  function handleChipClick(label) {
    // Chips that look like placeholders ("Type your brand name...") focus
    // the input rather than being sent as a literal answer.
    if (/^[^A-Za-z0-9]?\s*type\s+your/i.test(label)) {
      document.getElementById("strategist-composer")?.focus();
      return;
    }
    // Multi-select mode: toggle the pick into local state instead of
    // sending immediately. User confirms with the "Send N answers" button.
    if (lastAssistantChips.multi) {
      setPickedChips((prev) => (
        prev.includes(label) ? prev.filter((v) => v !== label) : [...prev, label]
      ));
      return;
    }
    sendMessage(label);
  }

  function handleSubmitPickedChips() {
    if (!pickedChips.length) return;
    sendMessage(pickedChips.join(", "));
    setPickedChips([]);
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
              <div className="strategist-msg-bubble strategist-msg-bubble-thinking">
                {sendingMode === "generating" ? (
                  /* Generation can take 15-30s. Show a shimmer card
                     with concrete expectation copy so the chat doesn't
                     feel frozen. */
                  <div className="strategist-thinking-card">
                    <div className="strategist-thinking-title">
                      <span className="strategist-typing">
                        <span /><span /><span />
                      </span>
                      Generating concepts
                    </div>
                    <div className="strategist-thinking-sub">
                      This usually takes 15 to 30 seconds. I&apos;m calling the image model now.
                    </div>
                    <div className="strategist-shimmer-grid" aria-hidden="true">
                      <span /><span /><span /><span />
                    </div>
                  </div>
                ) : (
                  <span className="strategist-typing">
                    <span /><span /><span />
                  </span>
                )}
              </div>
            </div>
          ) : null}

          {/* Quick-reply chips. In single-select mode (the default) a tap
              auto-submits the chip. In multi-select mode the user ticks
              chips and confirms with the "Send N" button. */}
          {!sending && lastAssistantChips.items.length ? (
            <div className={`strategist-chips ${lastAssistantChips.multi ? "is-multi" : ""}`}>
              {lastAssistantChips.items.map((s) => {
                const isPicked = pickedChips.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    className={`strategist-chip ${isPicked ? "is-picked" : ""}`}
                    onClick={() => handleChipClick(s)}
                    aria-pressed={lastAssistantChips.multi ? isPicked : undefined}
                  >
                    {lastAssistantChips.multi && isPicked ? (
                      <Check size={11} className="strategist-chip-tick" />
                    ) : null}
                    {s}
                  </button>
                );
              })}
              {lastAssistantChips.multi ? (
                <button
                  type="button"
                  className="strategist-chip-submit"
                  onClick={handleSubmitPickedChips}
                  disabled={!pickedChips.length}
                >
                  {pickedChips.length
                    ? `Send ${pickedChips.length} answer${pickedChips.length === 1 ? "" : "s"}`
                    : "Pick one or more"}
                </button>
              ) : null}
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

  // File-list attachment: list_user_files returns this so the manager
  // can show the user's recent files inline (image thumbs + names).
  if (attachment.type === "file_list" && Array.isArray(attachment.files)) {
    const files = attachment.files.filter((f) => f && f.url);
    if (!files.length) return null;
    return (
      <div className="strategist-attachment strategist-attachment-files">
        <div className="strategist-attachment-header">
          <strong>{attachment.title || "Your files"}</strong>
          <span>{files.length} file{files.length === 1 ? "" : "s"}</span>
        </div>
        <ul className="strategist-attachment-filelist">
          {files.map((f) => {
            const isImage = String(f.mime_type || "").startsWith("image/")
              || /\.(png|jpe?g|gif|webp|svg|bmp)(\?|#|$)/i.test(f.url);
            return (
              <li key={f.id || f.url}>
                <a href={f.url} target="_blank" rel="noreferrer" className="strategist-attachment-file">
                  <span className="strategist-attachment-file-thumb">
                    {isImage
                      ? <img src={f.url} alt="" referrerPolicy="no-referrer" />
                      : <span className="strategist-attachment-file-ext">
                          {(f.name || "file").split(".").pop().slice(0, 4).toUpperCase()}
                        </span>}
                  </span>
                  <span className="strategist-attachment-file-meta">
                    <span className="strategist-attachment-file-name">{f.name || "Untitled"}</span>
                    <span className="strategist-attachment-file-sub">
                      {[f.category, f.source].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

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

// Defaults moved into the function signature above. defaultProps on
// forwardRef components is unsupported and emits a console warning in
// React 18+ / required removal in React 19.

// forwardRef wrapper: parent pages get an imperative handle with
// `startOver()` so they can host their own Start-over button outside
// the chat shell (the AI Manager page does this).
const AIStrategistForwarded = forwardRef(AIStrategist);
AIStrategistForwarded.displayName = "AIStrategist";

// propTypes go on the FORWARDED component, not the inner render fn.
// Attaching them to the inner function triggered:
//   "forwardRef render functions do not support propTypes or defaultProps".
AIStrategistForwarded.propTypes = {
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
  activeSessionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default AIStrategistForwarded;
