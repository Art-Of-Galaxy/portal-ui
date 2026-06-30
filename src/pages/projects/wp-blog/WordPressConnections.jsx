import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Check, ExternalLink, Globe, Loader2, Plug, RefreshCw, Trash2 } from "lucide-react";
import { apiServices } from "../../../services/apiServices";

// Connect, list, and disconnect WordPress sites. One user can have many
// sites. Each row shows the site URL, username, optional default
// category, and the state. App passwords are entered inline (no OAuth
// dance) and validated against the WP REST API before storing.

export default function WordPressConnections() {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [busyKey, setBusyKey] = useState(null);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState(null);

  const [siteUrl, setSiteUrl] = useState("");
  const [username, setUsername] = useState("");
  const [appPassword, setAppPassword] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiServices.wordpress_connections_list();
      if (res?.success) setConnections(res.connections || []);
    } catch (err) {
      setError(err?.message || "Could not load connected sites.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function handleConnect(e) {
    e?.preventDefault?.();
    setError("");
    if (!siteUrl.trim() || !username.trim() || !appPassword.trim()) {
      setError("Site URL, username and Application Password are all required.");
      return;
    }
    setBusy(true);
    try {
      const res = await apiServices.wordpress_connections_connect({
        site_url: siteUrl.trim(),
        username: username.trim(),
        app_password: appPassword,
      });
      if (!res?.success) throw new Error(res?.message || "Could not connect to WordPress.");
      setBanner({ kind: "success", text: `Connected ${res.connection?.site_name || res.connection?.site_url || "your site"}.` });
      setSiteUrl(""); setUsername(""); setAppPassword("");
      await refresh();
      const t = setTimeout(() => setBanner(null), 6000);
      return () => clearTimeout(t);
    } catch (err) {
      setError(err?.message || "Could not connect.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDisconnect(id) {
    if (!window.confirm("Disconnect this site? Scheduled articles tied to it will stop publishing.")) return;
    setBusyKey(`disc-${id}`);
    try {
      await apiServices.wordpress_connections_disconnect({ id });
      setConnections((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err?.message || "Could not disconnect.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleSetPrimary(connection) {
    setBusyKey(`prim-${connection.id}`);
    try {
      await apiServices.wordpress_connections_set_primary({ id: connection.id });
      setConnections((prev) => prev.map((c) => ({ ...c, is_primary: c.id === connection.id })));
    } catch (err) {
      setError(err?.message || "Could not update primary site.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="portal-page sh-page">
      <button
        type="button"
        className="portal-back-link"
        onClick={() => navigate("/new-projects/ai-integrations/wp-blog")}
      >
        <ArrowLeft size={16} /> Back to WordPress Blog Engine
      </button>

      <header className="svc-page-hero">
        <div className="svc-page-hero-content">
          <span className="svc-page-hero-tile"><Globe size={22} /></span>
          <div>
            <h1 className="svc-page-hero-title">Connected WordPress sites</h1>
            <p className="svc-page-hero-sub">Connect one or more WordPress sites. The Blog Engine will publish articles directly to the site you pick.</p>
          </div>
        </div>
      </header>

      <div className="svc-page-shell">
        {banner ? (
          <div className={`sm-banner is-${banner.kind}`}>
            {banner.kind === "success" ? <Check size={14} /> : <AlertTriangle size={14} />}
            <span>{banner.text}</span>
          </div>
        ) : null}

        {error ? <div className="sm-banner is-error"><AlertTriangle size={14} /><span>{error}</span></div> : null}

        <section className="sm-conn-section">
          <h2 className="sm-section-title">Connect a new site</h2>
          <form onSubmit={handleConnect} className="sh-connect-form">
            <div className="be-meta-field">
              <div className="be-meta-flabel"><span>Site URL</span></div>
              <input
                type="url"
                className="be-meta-input"
                placeholder="https://yourblog.com"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                disabled={busy}
                required
              />
            </div>
            <div className="be-meta-field">
              <div className="be-meta-flabel"><span>WordPress username</span></div>
              <input
                type="text"
                className="be-meta-input"
                placeholder="your-wp-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={busy}
                required
              />
            </div>
            <div className="be-meta-field">
              <div className="be-meta-flabel"><span>Application Password</span></div>
              <input
                type="password"
                className="be-meta-input"
                placeholder="abcd 1234 efgh 5678 ijkl 9012"
                value={appPassword}
                onChange={(e) => setAppPassword(e.target.value)}
                disabled={busy}
                required
              />
            </div>
            <p className="sh-connect-hint">
              In your WP admin, go to <strong>Users → Profile → Application Passwords</strong>. Name it &quot;AOG Portal&quot;, click <strong>Add New Application Password</strong>, copy the generated password and paste it above. WordPress will only show it once.
              {" "}
              <a href="https://wordpress.org/documentation/article/application-passwords/" target="_blank" rel="noreferrer">
                Docs <ExternalLink size={11} style={{ display: "inline", verticalAlign: "middle" }} />
              </a>
            </p>
            <div style={{ marginTop: 12 }}>
              <button type="submit" className="sm-conn-cta" disabled={busy} style={{ width: "auto", padding: "0 18px" }}>
                {busy ? <Loader2 size={14} className="bg-spin" /> : <Plug size={14} />}
                Connect site
              </button>
            </div>
          </form>
        </section>

        <section className="sm-conn-section">
          <h2 className="sm-section-title">Your sites</h2>
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
              <div className="sm-empty-icon"><Globe size={26} /></div>
              <h3>No sites connected yet</h3>
              <p>Add your first WordPress site above to start publishing.</p>
            </div>
          ) : (
            <ul className="sm-conn-list">
              {connections.map((c) => {
                const needsReauth = c.state === "reauth_required";
                const showPrimaryToggle = connections.length > 1;
                return (
                  <li key={c.id} className={`sm-conn-row ${needsReauth ? "is-reauth" : ""} ${c.is_primary ? "is-primary" : ""}`}>
                    <span className="sh-store-badge"><Globe size={14} /></span>
                    <div className="sm-conn-meta">
                      <span className="sm-conn-name">
                        {c.site_name || c.site_url}
                        {c.is_primary && showPrimaryToggle ? <span className="sm-conn-primary-pill">Primary</span> : null}
                      </span>
                      <span className="sm-conn-sub">
                        {c.site_url} {c.username ? `· @${c.username}` : ""}
                        {c.default_category_name ? ` · ${c.default_category_name}` : ""}
                      </span>
                    </div>
                    {needsReauth ? (
                      <span className="sm-conn-status is-warn"><AlertTriangle size={11} /> Reconnect required</span>
                    ) : (
                      <span className="sm-conn-status"><span className="sm-conn-dot" /> Connected</span>
                    )}
                    {showPrimaryToggle && !c.is_primary && !needsReauth ? (
                      <button
                        type="button"
                        className="sm-conn-reconnect"
                        onClick={() => handleSetPrimary(c)}
                        disabled={busyKey === `prim-${c.id}`}
                        title="Use this site as the publishing target"
                      >
                        {busyKey === `prim-${c.id}` ? <Loader2 size={12} className="bg-spin" /> : <RefreshCw size={12} />}
                        Set primary
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
      </div>
    </div>
  );
}
