import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, Loader2, Newspaper, Pause, Play, Plus, Settings } from "lucide-react";
import { apiServices } from "../../../services/apiServices";

// WordPress Blog Engine Content Hub. Mirror of BlogEngineHub but bound
// to WordPress endpoints. Top: optional Autopilot banner with live
// status + queued/published + Pause/Resume. Sidebar: connected WP site
// + last-30d stats + next-up keyword queue. Main: tab filter + article
// rows (title, keyword, status, SEO score).

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

export default function WordPressBlogHub() {
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
        apiServices.wp_blog_engine_library({ filter: "all" }),
        apiServices.wordpress_connections_list(),
        apiServices.wp_blog_engine_stats(),
        apiServices.wp_blog_engine_autopilots_list(),
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
  const primaryConn = connections.find((c) => c.is_primary) || connections[0];
  const queuedKeywords = activeAutopilot
    ? (activeAutopilot.keywords || []).slice(0, 4).map((k) => ({
        keyword: k,
        used: articles.some((a) => (a.keyword || "").toLowerCase() === k.toLowerCase()),
      }))
    : [];

  async function togglePause(autopilotId, current) {
    setPauseBusy(autopilotId);
    try {
      await apiServices.wp_blog_engine_autopilot_patch({
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
      <header className="svc-page-hero">
        <div className="svc-page-hero-content">
          <span className="svc-page-hero-tile"><Newspaper size={22} /></span>
          <div>
            <h1 className="svc-page-hero-title">
              WordPress Blog Engine
              {loading ? (
                <span className="sk-block sk-pill" style={{ width: 130 }} />
              ) : primaryConn ? (
                <span className="sm-hub-badge is-success">{primaryConn.site_name || primaryConn.site_url} · Connected</span>
              ) : (
                <span className="sm-hub-badge">No site connected yet</span>
              )}
            </h1>
            <p className="svc-page-hero-sub">Generate SEO / GEO / AEO articles and publish straight to WordPress. One at a time, or fully on autopilot.</p>
          </div>
        </div>
        <div className="svc-page-hero-actions">
          <button
            type="button"
            className="sm-hub-action-secondary"
            onClick={() => navigate("/new-projects/ai-integrations/wp-blog/connections")}
          >
            <Settings size={13} /> Sites
          </button>
          <button
            type="button"
            className="sm-hub-action-primary"
            onClick={() => navigate("/new-projects/ai-integrations/wp-blog/create")}
          >
            <Plus size={14} /> Create article
          </button>
        </div>
      </header>

      {error ? <div className="sm-banner is-error"><AlertTriangle size={14} /><span>{error}</span></div> : null}

      {/* Autopilot banner */}
      {activeAutopilot ? (
        <div className="be-autopilot-banner">
          <div className="be-ap-glow" />
          <div className="be-ap-icon">📰</div>
          <div className="be-ap-body">
            <div className="be-ap-title">
              WordPress Autopilot
              <span className="be-ap-live"><span className="be-ap-dot" /> ACTIVE</span>
            </div>
            <div className="be-ap-sub">
              Publishing {CADENCE_LABEL[activeAutopilot.cadence] || activeAutopilot.cadence} to {activeAutopilot.category_name || "your blog"} ·
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
        <aside className="sm-hub-side">
          <section className="sm-side-card">
            <span className="sm-side-label">WordPress site</span>
            {loading ? (
              <>
                <div className="be-conn-row"><span className="sk-block sk-line is-sm" /><span className="sk-block sk-line is-sm" /></div>
                <div className="be-conn-row"><span className="sk-block sk-line is-sm" /><span className="sk-block sk-line is-md" /></div>
                <div className="be-conn-row"><span className="sk-block sk-line is-sm" /><span className="sk-block sk-line is-md" /></div>
                <div className="be-conn-row"><span className="sk-block sk-line is-sm" /><span className="sk-block sk-line is-sm" /></div>
              </>
            ) : primaryConn ? (
              <>
                <div className="be-conn-row"><span className="be-conn-dot" /><span>Status</span><span className="be-conn-val is-good">Connected</span></div>
                <div className="be-conn-row"><span>Site</span><span className="be-conn-val">{primaryConn.site_name || primaryConn.site_url}</span></div>
                <div className="be-conn-row"><span>User</span><span className="be-conn-val">@{primaryConn.username}</span></div>
                <div className="be-conn-row"><span>Auto-publish</span><span className="be-conn-val is-good">{activeAutopilot ? "On" : "Off"}</span></div>
              </>
            ) : (
              <button
                type="button"
                className="sm-side-link"
                onClick={() => navigate("/new-projects/ai-integrations/wp-blog/connections")}
              >
                No site yet, connect one <ArrowRight size={12} />
              </button>
            )}
          </section>

          <section className="sm-side-card">
            <span className="sm-side-label">Last 30 days</span>
            {loading ? (
              <div className="sm-stat-grid">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="sm-stat-box">
                    <span className="sk-block sk-line is-lg" />
                    <span className="sk-block sk-line is-sm" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="sm-stat-grid">
                <div className="sm-stat-box"><span className="sm-stat-num">{stats?.published_30d ?? 0}</span><span className="sm-stat-lab">Published</span></div>
                <div className="sm-stat-box"><span className="sm-stat-num">{stats?.queued ?? 0}</span><span className="sm-stat-lab">Queued</span></div>
                <div className="sm-stat-box"><span className="sm-stat-num">{stats?.avg_seo ?? 0}</span><span className="sm-stat-lab">Avg SEO</span></div>
                <div className="sm-stat-box"><span className="sm-stat-num">{stats?.drafts ?? 0}</span><span className="sm-stat-lab">Drafts</span></div>
              </div>
            )}
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
            <div className="be-article-list" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="sk-article-row">
                  <span className="sk-block sk-square" />
                  <div className="sk-body">
                    <span className="sk-block sk-line is-md" />
                    <span className="sk-block sk-line is-sm" />
                  </div>
                  <div className="sk-right">
                    <span className="sk-block sk-pill" />
                    <span className="sk-block sk-line is-xs" />
                  </div>
                </div>
              ))}
            </div>
          ) : !visible.length ? (
            <div className="sm-empty">
              <div className="sm-empty-icon">📰</div>
              <h3>{filter === "all" ? "No articles yet" : `No ${filter} articles`}</h3>
              <p>Hit <strong>Create article</strong> to get started, or set up Autopilot to keep the queue full.</p>
              <button
                type="button"
                className="sm-hub-action-primary"
                onClick={() => navigate("/new-projects/ai-integrations/wp-blog/create")}
              >
                <Plus size={14} /> Create article
              </button>
            </div>
          ) : (
            <div className="be-article-list">
              {visible.map((a) => {
                const pill = STATUS_PILL[a.status] || STATUS_PILL.draft;
                return (
                  <article
                    key={a.id}
                    className="be-article-row"
                    onClick={() => navigate(`/new-projects/ai-integrations/wp-blog/create?article=${a.id}`)}
                  >
                    {a.featured_url ? (
                      <img className="be-ar-thumb-img" src={a.featured_url} alt={a.title} />
                    ) : (
                      <span className="be-ar-thumb" style={{ background: "linear-gradient(150deg,#21759b,#1e3a5f)" }}>📰</span>
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
              onClick={() => navigate("/new-projects/ai-integrations/wp-blog/create?mode=autopilot")}
            >
              + Add keywords <ArrowRight size={13} />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
