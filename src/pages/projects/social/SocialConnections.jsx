import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Check, Info, Link as LinkIcon, Loader2, Plug, Plus, RefreshCw, Share2, Trash2 } from "lucide-react";
import { apiServices } from "../../../services/apiServices";

// Connected accounts page. Lists every active connection from the
// backend, lets the user start the OAuth flow per platform (Meta in
// one go for IG + FB, Google for YouTube), and lets them disconnect.

const PLATFORMS = [
  { key: "meta",    label: "Instagram + Facebook", sub: "One sign-in connects both via Meta Business.", icon: "📷" },
  { key: "youtube", label: "YouTube",              sub: "Connect your channel to publish Shorts.",       icon: "▶" },
];

function platformBadgeClass(p) {
  if (p === "instagram") return "sm-plat-badge is-ig";
  if (p === "facebook")  return "sm-plat-badge is-fb";
  if (p === "youtube")   return "sm-plat-badge is-yt";
  return "sm-plat-badge";
}

function platformIcon(p) {
  return ({ instagram: "📷", facebook: "f", youtube: "▶" })[p] || "•";
}

export default function SocialConnections() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState(null);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState(null);

  const callbackStatus = params.get("status");
  const callbackError = params.get("error");
  const callbackConnected = params.get("connected");
  const igMissing = params.get("ig_missing") === "1";
  const pagesWithoutIg = params.get("pages_without_ig") || "";

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiServices.social_connections_list();
      if (res?.success) setConnections(res.connections || []);
    } catch (err) {
      setError(err?.message || "Could not load connected accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Surface the OAuth callback outcome and clear the query so reload
  // doesn't flash the banner again.
  useEffect(() => {
    if (!callbackStatus) return;
    if (callbackStatus === "ok") {
      setBanner({ kind: "success", text: `Connected ${callbackConnected || ""} account${Number(callbackConnected) === 1 ? "" : "s"}.` });
    } else if (callbackStatus === "denied") {
      setBanner({ kind: "warn", text: "You declined the connection request. No accounts were linked." });
    } else if (callbackStatus === "error") {
      setBanner({ kind: "error", text: `Connection failed: ${callbackError || "unknown error"}.` });
    }
    const next = new URLSearchParams(params);
    next.delete("status"); next.delete("error"); next.delete("connected");
    // Keep ig_missing so the dedicated banner below stays visible
    // until the user resolves it (the toast banner auto-dismisses).
    setParams(next, { replace: true });
    const t = setTimeout(() => setBanner(null), 6000);
    return () => clearTimeout(t);
  }, [callbackStatus, callbackError, callbackConnected, params, setParams]);

  // Re-connecting maps to the same /start endpoint as a brand-new
  // connect: Meta and Google both treat re-grants as a fresh
  // OAuth round and refresh the stored tokens via upsert.
  async function handleReconnect(platform) {
    const key = platform === "youtube" ? "youtube" : "meta";
    await handleConnect(key);
  }

  function dismissIgMissing() {
    const next = new URLSearchParams(params);
    next.delete("ig_missing"); next.delete("pages_without_ig");
    setParams(next, { replace: true });
  }

  async function handleConnect(platformKey) {
    setBusyKey(platformKey);
    setError("");
    try {
      const res = await apiServices.social_connections_start({ platform: platformKey });
      if (!res?.success || !res.authorize_url) {
        throw new Error(res?.message || "Could not start OAuth.");
      }
      // Same-tab redirect. The provider will redirect back to our
      // /api/social-connections/callback/{provider}, which then 302s
      // the browser back to this page with ?status=...
      window.location.href = res.authorize_url;
    } catch (err) {
      setError(err?.message || "Could not start the connection flow.");
      setBusyKey(null);
    }
  }

  async function handleDisconnect(id) {
    if (!window.confirm("Disconnect this account? You'll need to reconnect to publish to it.")) return;
    setBusyKey(`disc-${id}`);
    try {
      await apiServices.social_connections_disconnect({ id });
      setConnections((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err?.message || "Could not disconnect.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="portal-page sm-page">
      <button
        type="button"
        className="portal-back-link"
        onClick={() => navigate("/new-projects/social")}
      >
        <ArrowLeft size={16} />
        Back to Social Media Studio
      </button>

      <header className="svc-page-hero">
        <div className="svc-page-hero-content">
          <span className="svc-page-hero-tile"><Share2 size={22} /></span>
          <div>
            <h1 className="svc-page-hero-title">Connected accounts</h1>
            <p className="svc-page-hero-sub">Connect Instagram, Facebook, and YouTube so the agent can post and schedule for you.</p>
          </div>
        </div>
      </header>

      {banner ? (
        <div className={`sm-banner is-${banner.kind}`}>
          {banner.kind === "success" ? <Check size={14} /> : <AlertTriangle size={14} />}
          <span>{banner.text}</span>
        </div>
      ) : null}

      {error ? (
        <div className="sm-banner is-error">
          <AlertTriangle size={14} />
          <span>{error}</span>
        </div>
      ) : null}

      {igMissing ? (
        <div className="sm-banner is-warn sm-ig-missing">
          <Info size={14} />
          <div style={{ flex: 1 }}>
            <strong>Connected {pagesWithoutIg ? `${pagesWithoutIg} Facebook Page${pagesWithoutIg === "1" ? "" : "s"}` : "your Pages"}, but no Instagram account was linked.</strong>
            <p>
              Instagram only publishes through this portal when your account is set to <strong>Business</strong> or <strong>Creator</strong> and linked to a Facebook Page you admin.
              {' '}On the Instagram app: <em>Settings → Account type and tools → Switch to professional account</em>, pick a category, then under <em>Linked accounts</em> connect your Facebook Page. Come back here and hit Reconnect on the Meta tile to refresh.
            </p>
          </div>
          <button type="button" className="sm-banner-dismiss" onClick={dismissIgMissing} aria-label="Dismiss">×</button>
        </div>
      ) : null}

      <section className="sm-conn-section">
        <h2 className="sm-section-title">Connect a new account</h2>
        <div className="sm-conn-grid">
          {PLATFORMS.map((p) => (
            <button
              key={p.key}
              type="button"
              className="sm-conn-cta"
              onClick={() => handleConnect(p.key)}
              disabled={busyKey === p.key}
            >
              <span className="sm-conn-cta-icon">{p.icon}</span>
              <span className="sm-conn-cta-body">
                <span className="sm-conn-cta-title">{p.label}</span>
                <span className="sm-conn-cta-sub">{p.sub}</span>
              </span>
              <span className="sm-conn-cta-arrow">
                {busyKey === p.key ? <Loader2 size={14} className="bg-spin" /> : <Plug size={14} />}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="sm-conn-section">
        <h2 className="sm-section-title">Active connections</h2>
        {loading ? (
          <ul className="sm-conn-list" aria-busy="true">
            {[0, 1].map((i) => (
              <li key={i} className="sk-conn-row">
                <span className="sk-block sk-circle" />
                <div className="sk-conn-body">
                  <span className="sk-block sk-line is-md" />
                  <span className="sk-block sk-line is-sm" />
                </div>
                <span className="sk-block sk-pill" />
              </li>
            ))}
          </ul>
        ) : !connections.length ? (
          <div className="sm-empty">
            <div className="sm-empty-icon"><LinkIcon size={26} /></div>
            <h3>No accounts connected yet</h3>
            <p>Connect at least one account above to start publishing.</p>
          </div>
        ) : (
          <ul className="sm-conn-list">
            {connections.map((c) => {
              const needsReauth = c.state === "reauth_required";
              return (
                <li key={c.id} className={`sm-conn-row ${needsReauth ? "is-reauth" : ""}`}>
                  <span className={platformBadgeClass(c.platform)}>{platformIcon(c.platform)}</span>
                  <div className="sm-conn-meta">
                    <span className="sm-conn-name">{c.account_name || c.account_handle || c.account_id}</span>
                    <span className="sm-conn-sub">
                      {c.account_handle ? `@${c.account_handle.replace(/^@/, "")} · ` : ""}
                      {c.platform.charAt(0).toUpperCase() + c.platform.slice(1)}
                    </span>
                  </div>
                  {needsReauth ? (
                    <span className="sm-conn-status is-warn">
                      <AlertTriangle size={11} /> Reconnect required
                    </span>
                  ) : (
                    <span className="sm-conn-status">
                      <span className="sm-conn-dot" /> Connected
                    </span>
                  )}
                  {needsReauth ? (
                    <button
                      type="button"
                      className="sm-conn-reconnect"
                      onClick={() => handleReconnect(c.platform)}
                      disabled={busyKey === "meta" || busyKey === "youtube"}
                      title="Reconnect"
                    >
                      {busyKey === "meta" || busyKey === "youtube" ? <Loader2 size={12} className="bg-spin" /> : <RefreshCw size={12} />}
                      Reconnect
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="sm-conn-disconnect"
                    onClick={() => handleDisconnect(c.id)}
                    disabled={busyKey === `disc-${c.id}`}
                    title="Disconnect"
                  >
                    {busyKey === `disc-${c.id}` ? <Loader2 size={13} className="bg-spin" /> : <Trash2 size={13} />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <button
        type="button"
        className="sm-back-cta"
        onClick={() => navigate("/new-projects/social")}
      >
        <Plus size={14} /> Done, take me back
      </button>
    </div>
  );
}
