import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Check, Loader2, Plug, Store, Trash2 } from "lucide-react";
import { apiServices } from "../../../services/apiServices";

// Connect, list, and disconnect Shopify stores. One user can have many
// stores. Each row shows the shop domain, optional default blog, and
// the OAuth state. Reconnect = same /start endpoint.

export default function ShopifyConnections() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState(null);
  const [shopInput, setShopInput] = useState("");
  const [busyDelete, setBusyDelete] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiServices.shopify_connections_list();
      if (res?.success) setConnections(res.connections || []);
    } catch (err) {
      setError(err?.message || "Could not load connected stores.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Surface OAuth callback outcome via ?status= and clear it.
  useEffect(() => {
    const status = params.get("status");
    const shop = params.get("shop");
    if (!status) return;
    if (status === "ok") setBanner({ kind: "success", text: `Connected ${shop || "your store"}.` });
    else if (status === "error") setBanner({ kind: "error", text: `Connection failed: ${params.get("error") || "unknown"}` });
    const next = new URLSearchParams(params);
    next.delete("status"); next.delete("error"); next.delete("shop");
    setParams(next, { replace: true });
    const t = setTimeout(() => setBanner(null), 6000);
    return () => clearTimeout(t);
  }, [params, setParams]);

  async function handleConnect(e) {
    e?.preventDefault?.();
    const shop_domain = shopInput.trim();
    if (!shop_domain) {
      setError("Enter your Shopify domain first (yourstore.myshopify.com).");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await apiServices.shopify_connections_start({ shop_domain });
      if (!res?.success || !res.authorize_url) throw new Error(res?.message || "Could not start OAuth.");
      window.location.href = res.authorize_url;
    } catch (err) {
      setError(err?.message || "Could not start the connection flow.");
      setBusy(false);
    }
  }

  async function handleDisconnect(id) {
    if (!window.confirm("Disconnect this store? Scheduled articles tied to it will stop publishing.")) return;
    setBusyDelete(id);
    try {
      await apiServices.shopify_connections_disconnect({ id });
      setConnections((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err?.message || "Could not disconnect.");
    } finally {
      setBusyDelete(null);
    }
  }

  return (
    <div className="portal-page sh-page">
      <button
        type="button"
        className="portal-back-link"
        onClick={() => navigate("/new-projects/ai-integrations/shopify-blog")}
      >
        <ArrowLeft size={16} /> Back to Blog Engine
      </button>

      <header className="sh-page-header">
        <div>
          <h1>Connected Shopify stores</h1>
          <p>Connect one or more Shopify stores. The Blog Engine will publish articles directly to the store you pick.</p>
        </div>
      </header>

      {banner ? (
        <div className={`sm-banner is-${banner.kind}`}>
          {banner.kind === "success" ? <Check size={14} /> : <AlertTriangle size={14} />}
          <span>{banner.text}</span>
        </div>
      ) : null}

      {error ? <div className="sm-banner is-error"><AlertTriangle size={14} /><span>{error}</span></div> : null}

      <section className="sm-conn-section">
        <h2 className="sm-section-title">Connect a new store</h2>
        <form onSubmit={handleConnect} className="sh-connect-form">
          <div className="sh-connect-row">
            <Store size={16} />
            <input
              type="text"
              className="sh-connect-input"
              placeholder="yourstore.myshopify.com"
              value={shopInput}
              onChange={(e) => setShopInput(e.target.value)}
              disabled={busy}
              autoFocus
            />
            <button type="submit" className="sm-conn-cta" disabled={busy} style={{ width: "auto", padding: "0 18px" }}>
              {busy ? <Loader2 size={14} className="bg-spin" /> : <Plug size={14} />}
              Connect
            </button>
          </div>
          <p className="sh-connect-hint">
            Use your Shopify admin domain (ends in <code>.myshopify.com</code>). You can find it under <em>Settings → Domains → myshopify.com domain</em>.
          </p>
        </form>
      </section>

      <section className="sm-conn-section">
        <h2 className="sm-section-title">Your stores</h2>
        {loading ? (
          <div className="sm-loading"><Loader2 size={14} className="bg-spin" /> Loading...</div>
        ) : !connections.length ? (
          <div className="sm-empty">
            <div className="sm-empty-icon"><Store size={26} /></div>
            <h3>No stores connected yet</h3>
            <p>Add your first store above to start publishing.</p>
          </div>
        ) : (
          <ul className="sm-conn-list">
            {connections.map((c) => {
              const needsReauth = c.state === "reauth_required";
              return (
                <li key={c.id} className={`sm-conn-row ${needsReauth ? "is-reauth" : ""}`}>
                  <span className="sh-store-badge"><Store size={14} /></span>
                  <div className="sm-conn-meta">
                    <span className="sm-conn-name">{c.shop_name || c.shop_domain}</span>
                    <span className="sm-conn-sub">{c.shop_domain}{c.default_blog_title ? ` · ${c.default_blog_title}` : ""}</span>
                  </div>
                  {needsReauth ? (
                    <span className="sm-conn-status is-warn"><AlertTriangle size={11} /> Reconnect required</span>
                  ) : (
                    <span className="sm-conn-status"><span className="sm-conn-dot" /> Connected</span>
                  )}
                  <button
                    type="button"
                    className="sm-conn-disconnect"
                    onClick={() => handleDisconnect(c.id)}
                    disabled={busyDelete === c.id}
                    title="Disconnect"
                  >
                    {busyDelete === c.id ? <Loader2 size={13} className="bg-spin" /> : <Trash2 size={13} />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
