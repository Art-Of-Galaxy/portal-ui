import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, Loader2, Pause, Play, Plus, Settings, Store } from "lucide-react";
import { apiServices } from "../../../services/apiServices";

// Blog Engine Content Hub. Top: optional Autopilot banner showing live
// status + queued/published counts + Pause/Resume. Sidebar: connected
// Shopify store + last-30d stats + next-up keyword queue. Main: tab
// filter + article rows (title, keyword, status, SEO score).

const STATUS_PILL = {
  published: { cls: "be-st-live",  label: "✓ Live" },
  scheduled: { cls: "be-st-sched", label: "📅 Scheduled" },
  draft:     { cls: "be-st-draft", label: "— Draft" },
  publishing:{ cls: "be-st-sched", label: "⏳ Publishing" },
  failed:    { cls: "be-st-failed",label: "! Failed" },
};

const CADENCE_LABEL = {
  daily: "7× / week",
  "3x":  "3× / week",
  "2x":  "2× / week",
  weekly:"1× / week",
  biweekly:"2× / month",
  monthly:"1× / month",
};

function relTime(value) {
  if (!value) return "";
  const t = new Date(value).getTime();
  if (Number.isNaN(t)) return String(value);
  const diff = Date.now() - t;
  if (diff < 60_000) return "now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function articleCover(a) {
  if (a.featured_url) return null; // image rendered separately
  // Fallback gradient swatch when no featured image
  return "linear-gradient(150deg,#0f766e,#134e4a)";
}

export default function BlogEngineHub() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [autopilots, setAutopilots] = useState([]);
  const [connections, setConnections] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pauseBusy, setPauseBusy] = useState(null);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const [lib, conn, st, autos] = await Promise.all([
        apiServices.blog_engine_library({ filter: "all" }),
        apiServices.shopify_connections_list(),
        apiServices.blog_engine_stats(),
        apiServices.blog_engine_autopilots_list(),
      ]);
      if (lib?.success) setArticles(lib.articles || []);
      if (conn?.success) setConnections(conn.connections || []);
      if (st?.success) setStats(st.stats);
      if (autos?.success) setAutopilots(autos.autopilots || []);
    } catch (err) {
      setError(err?.message || "Could not load the engine.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const counts = {
    all:       articles.length,
    published: articles.filter((a) => a.status === "published").length,
    scheduled: articles.filter((a) => a.status === "scheduled" || a.status === "publishing").length,
    draft:     articles.filter((a) => a.status === "draft").length,
  };

  const visible = filter === "all"
    ? articles
    : articles.filter((a) => (filter === "scheduled" ? (a.status === "scheduled" || a.status === "publishing") : a.status === filter));

  const activeAutopilot = autopilots.find((a) => a.status === "active");
  const primaryConn = connections[0];
  const queuedKeywords = activeAutopilot
    ? (activeAutopilot.keywords || []).slice(0, 4).map((k) => ({
        keyword: k,
        used: articles.some((a) => (a.keyword || "").toLowerCase() === k.toLowerCase()),
      }))
    : [];

  async function togglePause(autopilotId, current) {
    setPauseBusy(autopilotId);
    try {
      await apiServices.blog_engine_autopilot_patch({
        id: autopilotId,
        status: current === "active" ? "paused" : "active",
      });
      await refresh();
    } catch (err) {
      setError(err?.message || "Could not update autopilot.");
    } finally {
      setPauseBusy(null);
    }
  }

  return (
    <div className="portal-page sm-page">
      <div className="sm-hub-header-row">
        <div>
          <h1 className="sm-hub-title">Blog Engine</h1>
          <div className="sm-hub-badges">
            <span className="sm-hub-badge is-accent">📝 Shopify Blog</span>
            {primaryConn ? (
              <span className="sm-hub-badge is-success">{primaryConn.shop_name || primaryConn.shop_domain} · Connected</span>
            ) : (
              <span className="sm-hub-badge">No store connected yet</span>
            )}
          </div>
        </div>
        <div className="sm-hub-actions">
          <button
            type="button"
            className="sm-hub-action-secondary"
            onClick={() => navigate("/new-projects/ai-integrations/shopify-blog/connections")}
          >
            <Settings size={13} /> Stores
          </button>
          <button
            type="button"
            className="sm-hub-action-primary"
            onClick={() => navigate("/new-projects/ai-integrations/shopify-blog/create")}
          >
            <Plus size={14} /> Create article
          </button>
        </div>
      </div>

      {error ? <div className="sm-banner is-error"><AlertTriangle size={14} /><span>{error}</span></div> : null}

      {/* Autopilot banner */}
      {activeAutopilot ? (
        <div className="be-autopilot-banner">
          <div className="be-ap-glow" />
          <div className="be-ap-icon">🌸</div>
          <div className="be-ap-body">
            <div className="be-ap-title">
              Blog Autopilot
              <span className="be-ap-live"><span className="be-ap-dot" /> ACTIVE</span>
            </div>
            <div className="be-ap-sub">
              Publishing {CADENCE_LABEL[activeAutopilot.cadence] || activeAutopilot.cadence} to {activeAutopilot.blog_title || "your blog"} ·
              next article {activeAutopilot.next_publish_at ? new Date(activeAutopilot.next_publish_at).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" }) : "scheduling"}
            </div>
          </div>
          <div className="be-ap-stats">
            <div><div className="be-ap-num">{counts.scheduled}</div><div className="be-ap-lab">queued</div></div>
            <div><div className="be-ap-num">{counts.published}</div><div className="be-ap-lab">published</div></div>
            <div><div className="be-ap-num">{CADENCE_LABEL[activeAutopilot.cadence] || ""}</div><div className="be-ap-lab">cadence</div></div>
          </div>
          <button
            type="button"
            className="be-ap-toggle"
            onClick={() => togglePause(activeAutopilot.id, activeAutopilot.status)}
            disabled={pauseBusy === activeAutopilot.id}
          >
            {pauseBusy === activeAutopilot.id ? <Loader2 size={12} className="bg-spin" /> : <Pause size={12} />}
            Pause
          </button>
        </div>
      ) : autopilots.find((a) => a.status === "paused") ? (
        <div className="be-autopilot-banner is-paused">
          <div className="be-ap-icon">⏸</div>
          <div className="be-ap-body">
            <div className="be-ap-title">Autopilot paused</div>
            <div className="be-ap-sub">No new articles will be drafted or auto-published until you resume.</div>
          </div>
          <button
            type="button"
            className="be-ap-toggle"
            onClick={() => togglePause(autopilots.find((a) => a.status === "paused").id, "paused")}
            disabled={pauseBusy !== null}
          >
            <Play size={12} /> Resume
          </button>
        </div>
      ) : null}

      <div className="sm-hub-grid">
        {/* SIDEBAR */}
        <aside className="sm-hub-side">
          <section className="sm-side-card">
            <span className="sm-side-label">Shopify connection</span>
            {primaryConn ? (
              <>
                <div className="be-conn-row"><span className="be-conn-dot" /><span>Status</span><span className="be-conn-val is-good">Connected</span></div>
                <div className="be-conn-row"><span>Store</span><span className="be-conn-val">{primaryConn.shop_domain}</span></div>
                <div className="be-conn-row"><span>Target blog</span><span className="be-conn-val">{primaryConn.default_blog_title || "Default"}</span></div>
                <div className="be-conn-row"><span>Auto-publish</span><span className="be-conn-val is-good">{activeAutopilot ? "On" : "Off"}</span></div>
              </>
            ) : (
              <button
                type="button"
                className="sm-side-link"
                onClick={() => navigate("/new-projects/ai-integrations/shopify-blog/connections")}
              >
                No store yet, connect one <ArrowRight size={12} />
              </button>
            )}
          </section>

          <section className="sm-side-card">
            <span className="sm-side-label">Last 30 days</span>
            <div className="sm-stat-grid">
              <div className="sm-stat-box"><span className="sm-stat-num">{stats?.published_30d ?? 0}</span><span className="sm-stat-lab">Published</span></div>
              <div className="sm-stat-box"><span className="sm-stat-num">{stats?.queued ?? 0}</span><span className="sm-stat-lab">Queued</span></div>
              <div className="sm-stat-box"><span className="sm-stat-num">{stats?.avg_seo ?? 0}</span><span className="sm-stat-lab">Avg SEO</span></div>
              <div className="sm-stat-box"><span className="sm-stat-num">{stats?.drafts ?? 0}</span><span className="sm-stat-lab">Drafts</span></div>
            </div>
          </section>

          {queuedKeywords.length ? (
            <section className="sm-side-card">
              <span className="sm-side-label">Keyword bank · next up</span>
              {queuedKeywords.map((k) => (
                <div key={k.keyword} className="be-kw-row">
                  <span className="be-kw-dot" />
                  <span style={{ flex: 1, fontSize: 11.5, color: "var(--portal-text-muted)" }}>{k.keyword}</span>
                  <span className={`be-kw-pill ${k.used ? "is-done" : "is-queued"}`}>{k.used ? "done" : "queued"}</span>
                </div>
              ))}
            </section>
          ) : null}

          <div className="sm-model-card">
            ⚙ Blog Agent · Claude Sonnet · SEO + GEO + AEO
          </div>
        </aside>

        {/* MAIN */}
        <div className="sm-hub-main">
          <div className="sm-hub-main-topbar">
            <div>
              <h2 className="sm-main-title">Article library</h2>
              <p className="sm-main-sub">Everything the engine has written, live, scheduled, and drafted. Tap any row to edit or reschedule.</p>
            </div>
          </div>

          <div className="sm-tabs">
            {[
              { id: "all",       label: "All" },
              { id: "published", label: "Published" },
              { id: "scheduled", label: "Scheduled" },
              { id: "draft",     label: "Drafts" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                className={`sm-tab ${filter === t.id ? "is-active" : ""}`}
                onClick={() => setFilter(t.id)}
              >
                {t.label} <span className="sm-tab-count">{counts[t.id] ?? 0}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="sm-loading"><Loader2 size={14} className="bg-spin" /> Loading articles...</div>
          ) : !visible.length ? (
            <div className="sm-empty">
              <div className="sm-empty-icon">📝</div>
              <h3>{filter === "all" ? "No articles yet" : `No ${filter} articles`}</h3>
              <p>Hit <strong>Create article</strong> to get started, or set up Autopilot to keep the queue full.</p>
              <button
                type="button"
                className="sm-hub-action-primary"
                onClick={() => navigate("/new-projects/ai-integrations/shopify-blog/create")}
              >
                <Plus size={14} /> Create article
              </button>
            </div>
          ) : (
            <div className="be-article-list">
              {visible.map((a) => {
                const pill = STATUS_PILL[a.status] || STATUS_PILL.draft;
                const grad = articleCover(a);
                return (
                  <article
                    key={a.id}
                    className="be-article-row"
                    onClick={() => navigate(`/new-projects/ai-integrations/shopify-blog/create?article=${a.id}`)}
                  >
                    {a.featured_url ? (
                      <img className="be-ar-thumb-img" src={a.featured_url} alt={a.title} />
                    ) : (
                      <span className="be-ar-thumb" style={{ background: grad || "var(--portal-surface-muted)" }}>📝</span>
                    )}
                    <div className="be-ar-main">
                      <div className="be-ar-title">{a.title || a.keyword || "Untitled article"}</div>
                      <div className="be-ar-meta">
                        {a.keyword ? <span className="be-ar-kw">{a.keyword}</span> : null}
                        {a.word_count ? <span>{a.word_count.toLocaleString()}w</span> : null}
                        {Number.isInteger(a.seo_score) ? (
                          <span className="be-ar-seo">
                            SEO <span className="be-seo-pip"><span className="be-seo-pip-fill" style={{ width: `${a.seo_score}%` }} /></span> {a.seo_score}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="be-ar-right">
                      <span className={`be-ar-status ${pill.cls}`}>{pill.label}</span>
                      <span className="be-ar-date">
                        {a.status === "published" && a.published_at
                          ? `Live · ${relTime(a.published_at)} ago`
                          : a.status === "scheduled" && a.scheduled_for
                            ? new Date(a.scheduled_for).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" })
                            : `Updated ${relTime(a.updated_at)} ago`}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <section className="sm-cta-banner">
            <div>
              <div className="sm-cta-title">Add more keywords to the autopilot</div>
              <p className="sm-cta-sub">Feed the engine a fresh keyword list and it keeps the queue full automatically.</p>
            </div>
            <button
              type="button"
              className="sm-cta-btn"
              onClick={() => navigate("/new-projects/ai-integrations/shopify-blog/create?mode=autopilot")}
            >
              + Add keywords <ArrowRight size={13} />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
