import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, X, Plus, MessageSquare, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import AIStrategist from "../components/strategist/AIStrategist";
import { apiServices } from "../services/apiServices";

// Full-page AI Manager. Same chat surface as the per-service strategists,
// but rendered with a chat-list sidebar so the user can keep multiple
// parallel conversations (like ChatGPT or Claude).
//
// The backend service is `manager`, which gives the model:
//   - a wider persona that knows every portal service,
//   - tool access (get_user_profile, list_user_projects, list_user_files,
//     generate_logo_design),
//   - a routing policy that does NOT auto-redirect — the user can choose
//     to deep-link to a custom form via the suggestion card.

const ACTIVE_KEY = "aog.manager.active_session";

export default function AIManager() {
  const navigate = useNavigate();
  const strategistRef = useRef(null);

  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [activeId, setActiveId] = useState(() => {
    try { return Number(localStorage.getItem(ACTIVE_KEY)) || null; } catch { return null; }
  });
  const [suggestedRoute, setSuggestedRoute] = useState("");
  const [busy, setBusy] = useState(false);
  // Per-row menu state: id of the chat whose 3-dot menu is open, or null.
  const [menuOpenId, setMenuOpenId] = useState(null);
  // Close the menu when the user clicks anywhere else.
  useEffect(() => {
    if (menuOpenId == null) return undefined;
    const onDocClick = () => setMenuOpenId(null);
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [menuOpenId]);

  // Load the full chat list whenever the page mounts (or after we
  // create / start a new chat).
  //
  // Active-chat resolution rules (no auto-create on page load — that's
  // what produced the wall of "Untitled chat" rows the user was seeing):
  //   1. If the cached activeId still exists in the list, keep it.
  //   2. Otherwise prefer an EMPTY chat (title is null, meaning the LLM
  //      never named it, meaning the user never sent a turn). Reusing it
  //      avoids accumulating more "Untitled chat" stubs every visit.
  //   3. Otherwise the most recently updated chat.
  //   4. Otherwise null — the chat panel renders an empty-state CTA.
  const refreshSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await apiServices.strategist_list({ service: "manager" });
      const list = res?.success && Array.isArray(res.sessions) ? res.sessions : [];
      setSessions(list);

      setActiveId((current) => {
        if (current && list.some((s) => s.id === current)) return current;
        const emptyOne = list.find((s) => !s.title);
        if (emptyOne) return emptyOne.id;
        if (list.length) return list[0].id;
        return null;
      });
    } catch {
      /* keep empty; create-new still works */
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => { refreshSessions(); }, [refreshSessions]);

  // Persist the active id so reload returns to the same chat.
  useEffect(() => {
    try {
      if (activeId) localStorage.setItem(ACTIVE_KEY, String(activeId));
      else localStorage.removeItem(ACTIVE_KEY);
    } catch { /* ignore */ }
  }, [activeId]);

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

  function handleDismissRoute() { setSuggestedRoute(""); }

  async function handleNewChat() {
    if (busy) return;
    // If there's already an untitled, untouched chat sitting around,
    // reuse it instead of spawning yet another "Untitled chat" row.
    // Title becomes non-null as soon as the LLM names the conversation
    // on the first user turn, so a null title is a reliable "never
    // used" signal.
    const existingEmpty = sessions.find((s) => !s.title);
    if (existingEmpty) {
      setActiveId(existingEmpty.id);
      setSuggestedRoute("");
      return;
    }
    setBusy(true);
    try {
      const fresh = await apiServices.strategist_start({ service: "manager" });
      if (fresh?.success && fresh.session?.id) {
        setActiveId(fresh.session.id);
        // Prepend so it shows at the top of the list.
        setSessions((prev) => [
          { id: fresh.session.id, service: "manager", title: null, updated_at: new Date().toISOString() },
          ...prev,
        ]);
      }
    } catch { /* surfaced via AIStrategist error state */ } finally {
      setBusy(false);
    }
  }

  function handleSwitchChat(id) {
    if (!id || id === activeId) return;
    setActiveId(id);
    setSuggestedRoute("");
  }

  async function handleDeleteChat(id) {
    if (!id) return;
    setMenuOpenId(null);
    // Optimistic removal so the click feels instant.
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeId === id) {
      // Switch to the next available chat (or null if this was the
      // last one) so the chat panel doesn't hang on a deleted id.
      const remaining = sessions.filter((s) => s.id !== id);
      setActiveId(remaining.length ? remaining[0].id : null);
    }
    try {
      await apiServices.strategist_delete({ session_id: id });
    } catch {
      // If the server rejected, repull the list so the row reappears.
      refreshSessions();
    }
  }

  // After AIStrategist tells us the live session was updated (new title
  // when the LLM names the chat, new updated_at after each turn), patch
  // the cached row so the sidebar shows fresh info.
  const handleSessionChange = useCallback((s) => {
    if (!s?.id) return;
    setSessions((prev) => {
      const idx = prev.findIndex((r) => r.id === s.id);
      // Always stamp with the local "right now" because this callback
      // fires the moment a turn finishes. The backend's updated_at is
      // authoritative on the next reload but we don't want to depend
      // on it for the sidebar's relative time.
      const patch = {
        id: s.id,
        service: s.service || "manager",
        title: s.title || null,
        updated_at: new Date().toISOString(),
      };
      if (idx === -1) return [patch, ...prev];
      const next = prev.slice();
      next[idx] = { ...next[idx], ...patch };
      // Move to the top so the most recently-used chat is always first.
      next.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      return next;
    });
  }, []);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeId) || null,
    [sessions, activeId]
  );

  const header = (
    <div className="strategist-header-row">
      <div className="strategist-header-titlewrap">
        <h2 className="strategist-header-title">
          {activeSession?.title || "AOG AI Manager"}
        </h2>
        <span className="strategist-header-sub">
          Knows every service, your projects, and your files
        </span>
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

      <div className="ai-manager-shell">
        {/* -------- Chat list sidebar -------- */}
        <aside className="ai-manager-chatlist">
          <button
            type="button"
            className="ai-manager-newchat"
            onClick={handleNewChat}
            disabled={busy}
          >
            {busy ? <Loader2 size={14} className="strategist-spin" /> : <Plus size={14} />}
            New chat
          </button>

          <div className="ai-manager-chatlist-label">Conversations</div>

          {sessionsLoading && !sessions.length ? (
            <div className="ai-manager-chatlist-empty">
              <Loader2 size={14} className="strategist-spin" /> Loading...
            </div>
          ) : null}

          {!sessionsLoading && !sessions.length ? (
            <div className="ai-manager-chatlist-empty">
              No chats yet. Start one with <strong>New chat</strong>.
            </div>
          ) : null}

          <ul className="ai-manager-chatlist-items">
            {sessions.map((s) => (
              <li key={s.id} className="ai-manager-chatlist-row">
                <button
                  type="button"
                  className={`ai-manager-chatlist-item ${activeId === s.id ? "is-active" : ""}`}
                  onClick={() => handleSwitchChat(s.id)}
                >
                  <MessageSquare size={13} />
                  <span className="ai-manager-chatlist-title">
                    {s.title || "Untitled chat"}
                  </span>
                  <span className="ai-manager-chatlist-time">
                    {formatRelative(s.updated_at)}
                  </span>
                </button>
                <button
                  type="button"
                  className="ai-manager-chatlist-menu-btn"
                  aria-label="Chat options"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId((open) => (open === s.id ? null : s.id));
                  }}
                >
                  <MoreHorizontal size={14} />
                </button>
                {menuOpenId === s.id ? (
                  <div className="ai-manager-chatlist-menu" role="menu">
                    <button
                      type="button"
                      role="menuitem"
                      className="ai-manager-chatlist-menu-item is-danger"
                      onClick={(e) => {
                        // Stop bubble so the document-level handler
                        // doesn't also fire (it would just close the
                        // already-closed menu, but cleaner this way).
                        e.stopPropagation();
                        handleDeleteChat(s.id);
                      }}
                    >
                      <Trash2 size={13} /> Delete chat
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </aside>

        {/* -------- Active chat panel --------
            We deliberately do NOT mount AIStrategist with a null
            activeSessionId. The component's "no id" path falls through
            to strategist_start, which is exactly the auto-create that
            spammed the sidebar with Untitled chat rows. Instead we show
            an empty-state CTA and only mount the chat once the user
            either picks an existing conversation or clicks New chat. */}
        <div className="ai-manager-chatpanel">
          {activeId ? (
            <AIStrategist
              ref={strategistRef}
              service="manager"
              chatOnly
              activeSessionId={activeId}
              header={header}
              onRoute={handleRoute}
              onSessionChange={handleSessionChange}
            />
          ) : (
            <div className="ai-manager-empty">
              <div className="ai-manager-empty-icon">
                <MessageSquare size={28} />
              </div>
              <h2>No chat selected</h2>
              <p>
                Pick a conversation from the left to pick up where you left off,
                or start a fresh one whenever you&apos;re ready.
              </p>
              <button
                type="button"
                className="ai-manager-empty-cta"
                onClick={handleNewChat}
                disabled={busy}
              >
                {busy ? <Loader2 size={14} className="strategist-spin" /> : <Plus size={14} />}
                Start a new chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Tiny relative-time helper so chat list rows show "2m" / "1h" / "Mon".
function formatRelative(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  if (diff < 60_000) return "now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
