import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, MessageCircle, Plus, Send, Settings, Sparkles } from "lucide-react";
import { apiServices } from "../../../services/apiServices";

// Social Media Studio Content Hub. Default landing when the user enters
// the service. Left column shows the brand identity, the connected
// platform accounts (clickable to /connections), this-week stats and
// content mix bars. Right column has tabs (All / Scheduled / Published
// / Drafts), the post grid, and CTAs.

const TYPE_EMOJI = {
  carousel: "🎠",
  reel:     "🎬",
  post:     "🖼",
  thumbnail: "▶",
  profile:  "👤",
  batch:    "⚡",
};

const TYPE_GRAD = {
  carousel:  "linear-gradient(150deg,#5540ff,#1e1b48)",
  reel:      "linear-gradient(160deg,#7c3aed,#4c1d95)",
  post:      "linear-gradient(150deg,#0057ff,#0d9488)",
  thumbnail: "linear-gradient(150deg,#dc2626,#7f1d1d)",
  profile:   "linear-gradient(150deg,#16a34a,#15803d)",
  batch:     "linear-gradient(135deg,#5540ff,#00ff89)",
};

const PLAT_BADGE_CLASS = {
  instagram: "is-ig",
  facebook:  "is-fb",
  youtube:   "is-yt",
};

function PlatformPill({ platform }) {
  const cls = PLAT_BADGE_CLASS[platform] || "";
  const ico = { instagram: "📷", facebook: "f", youtube: "▶" }[platform] || "•";
  return <span className={`sm-plat-badge ${cls}`}>{ico}</span>;
}

function StatusBadge({ status, lastError }) {
  // Status comes from derived_status when available: 'partial' = the
  // post is published but at least one platform attempt errored.
  if (status === "published") return <span className="sm-ps is-live">✓ Live</span>;
  if (status === "partial") {
    const tip = lastError?.message
      ? `${(lastError.platform || "").toUpperCase()}: ${lastError.message}`
      : "Some platforms failed to publish.";
    return (
      <span className="sm-ps is-partial" title={tip}>⚠ Partial</span>
    );
  }
  if (status === "scheduled") return <span className="sm-ps is-sched">📅 Scheduled</span>;
  if (status === "failed")    return <span className="sm-ps is-failed">! Failed</span>;
  return <span className="sm-ps is-draft">— Draft</span>;
}

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

function postCoverLabel(post) {
  // Compose 2 short lines from the spec. Falls back to caption snippet.
  const s = post.spec || {};
  const lines = [];
  if (s.tag) lines.push(s.tag);
  const headline = s.headline || s.hook || s.title || (post.caption || "").split("\n")[0];
  if (headline) lines.push(headline);
  return lines;
}

export default function SocialMediaHub() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [connections, setConnections] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [lib, conn, st] = await Promise.all([
          apiServices.social_media_library({ filter: "all" }),
          apiServices.social_connections_list(),
          apiServices.social_media_stats(),
        ]);
        if (cancelled) return;
        if (lib?.success) setPosts(lib.posts || []);
        if (conn?.success) setConnections(conn.connections || []);
        if (st?.success) setStats(st);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Could not load the studio.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const counts = useMemo(() => ({
    all:       posts.length,
    scheduled: posts.filter((p) => p.status === "scheduled").length,
    published: posts.filter((p) => p.status === "published").length,
    draft:     posts.filter((p) => p.status === "draft").length,
  }), [posts]);

  const visible = useMemo(() => (
    filter === "all" ? posts : posts.filter((p) => p.status === filter)
  ), [posts, filter]);

  const mix = stats?.content_mix || { carousel: 0, reel: 0, post: 0 };
  const mixTotal = mix.carousel + mix.reel + mix.post;
  const mixPct = (n) => (mixTotal ? Math.round((n / mixTotal) * 100) : 0);

  return (
    <div className="portal-page sm-page">
      <header className="svc-page-hero">
        <div className="svc-page-hero-content">
          <span className="svc-page-hero-tile"><Sparkles size={22} /></span>
          <div>
            <h1 className="svc-page-hero-title">
              Social Media Studio
              {/* <span className="sm-hub-badge is-accent">Content Hub</span> */}
              {loading ? (
                <span className="sk-block sk-pill" style={{ width: 130 }} />
              ) : (
                <span className="sm-hub-badge is-success">{connections.length} account{connections.length === 1 ? "" : "s"} connected</span>
              )}
            </h1>
            <p className="svc-page-hero-sub">Plan, generate, schedule, and publish across Instagram, Facebook, and YouTube from one hub.</p>
          </div>
        </div>
        <div className="svc-page-hero-actions">
          <button
            type="button"
            className="sm-hub-action-secondary"
            onClick={() => navigate("/new-projects/social/connections")}
          >
            <Settings size={13} /> Connections
          </button>
          <button
            type="button"
            className="sm-hub-action-primary"
            onClick={() => navigate("/new-projects/social/create")}
          >
            <Plus size={14} /> Create content
          </button>
        </div>
      </header>

      {error ? <div className="sm-banner is-error">{error}</div> : null}

      <div className="sm-hub-grid">
        {/* SIDEBAR */}
        <aside className="sm-hub-side">
          <section className="sm-side-card">
            <span className="sm-side-label">Connected accounts</span>
            {loading ? (
              [0, 1].map((i) => (
                <div key={i} className="sm-conn-row is-compact">
                  <span className="sk-block sk-circle" style={{ width: 28, height: 28 }} />
                  <div className="sm-conn-meta">
                    <span className="sk-block sk-line is-md" />
                    <span className="sk-block sk-line is-sm" />
                  </div>
                </div>
              ))
            ) : connections.length === 0 ? (
              <button
                type="button"
                className="sm-side-link"
                onClick={() => navigate("/new-projects/social/connections")}
              >
                No accounts yet, connect one <ArrowRight size={12} />
              </button>
            ) : (
              connections.map((c) => (
                <div key={c.id} className="sm-conn-row is-compact">
                  <PlatformPill platform={c.platform} />
                  <div className="sm-conn-meta">
                    <span className="sm-conn-name">{c.platform.charAt(0).toUpperCase() + c.platform.slice(1)}</span>
                    <span className="sm-conn-status"><span className="sm-conn-dot" /> Connected</span>
                  </div>
                  {c.account_handle ? (
                    <span className="sm-conn-handle">@{String(c.account_handle).replace(/^@/, "")}</span>
                  ) : null}
                </div>
              ))
            )}
          </section>

          <section className="sm-side-card">
            <span className="sm-side-label">This week</span>
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
                <div className="sm-stat-box">
                  <span className="sm-stat-num">{stats?.this_week?.posts_created ?? 0}</span>
                  <span className="sm-stat-lab">Posts created</span>
                </div>
                <div className="sm-stat-box">
                  <span className="sm-stat-num">{stats?.this_week?.scheduled ?? 0}</span>
                  <span className="sm-stat-lab">Scheduled</span>
                </div>
                <div className="sm-stat-box">
                  <span className="sm-stat-num">{stats?.this_week?.published_week ?? 0}</span>
                  <span className="sm-stat-lab">Published</span>
                </div>
                <div className="sm-stat-box">
                  <span className="sm-stat-num">{counts.draft}</span>
                  <span className="sm-stat-lab">Drafts</span>
                </div>
              </div>
            )}
          </section>

          <section className="sm-side-card">
            <span className="sm-side-label">Content mix</span>
            <div className="sm-mix-row">
              <span className="sm-mix-name">🎠 Carousel</span>
              <div className="sm-mix-bar"><div className="sm-mix-fill" style={{ width: `${mixPct(mix.carousel)}%`, background: "var(--portal-accent-solid)" }} /></div>
              <span className="sm-mix-pct">{mixPct(mix.carousel)}%</span>
            </div>
            <div className="sm-mix-row">
              <span className="sm-mix-name">🎬 Reels</span>
              <div className="sm-mix-bar"><div className="sm-mix-fill" style={{ width: `${mixPct(mix.reel)}%`, background: "var(--portal-brand-purple)" }} /></div>
              <span className="sm-mix-pct">{mixPct(mix.reel)}%</span>
            </div>
            <div className="sm-mix-row">
              <span className="sm-mix-name">🖼 Posts</span>
              <div className="sm-mix-bar"><div className="sm-mix-fill" style={{ width: `${mixPct(mix.post)}%`, background: "var(--portal-brand-blue)" }} /></div>
              <span className="sm-mix-pct">{mixPct(mix.post)}%</span>
            </div>
          </section>

          <div className="sm-model-card">
            ⚙ Social Media Agent · Claude Sonnet · Auto-publish active
          </div>
        </aside>

        {/* MAIN */}
        <div className="sm-hub-main">
          <div className="sm-hub-main-topbar">
            <div>
              <h2 className="sm-main-title">Your content library</h2>
              <p className="sm-main-sub">Everything generated, scheduled, and published, in one place. Tap any card to edit or reschedule.</p>
            </div>
          </div>

          <div className="sm-tabs">
            {[
              { id: "all",       label: "All" },
              { id: "scheduled", label: "Scheduled" },
              { id: "published", label: "Published" },
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
            <div className="sm-content-grid" aria-busy="true">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="sk-post-card">
                  <span className="sk-block sk-cover" />
                  <div className="sk-post-foot">
                    <span className="sk-block sk-line is-md" />
                    <span className="sk-block sk-line is-sm" />
                    <span className="sk-block sk-pill" />
                  </div>
                </div>
              ))}
            </div>
          ) : !visible.length ? (
            <div className="sm-empty">
              <div className="sm-empty-icon">📱</div>
              <h3>{filter === "all" ? "No content yet" : `No ${filter} posts`}</h3>
              <p>Hit <strong>Create content</strong> to get started.</p>
              <button
                type="button"
                className="sm-hub-action-primary"
                onClick={() => navigate("/new-projects/social/create")}
              >
                <Plus size={14} /> Create content
              </button>
            </div>
          ) : (
            <div className="sm-content-grid">
              {visible.map((p) => {
                const lines = postCoverLabel(p);
                const grad = TYPE_GRAD[p.content_type] || TYPE_GRAD.post;
                return (
                  <article key={p.id} className="sm-post-card" onClick={() => navigate(`/new-projects/social/create?post=${p.id}`)}>
                    <div className="sm-post-preview" style={{ background: p.cover_url ? "transparent" : grad }}>
                      {p.cover_url ? (
                        <img src={p.cover_url} alt={lines[0] || "Post cover"} />
                      ) : (
                        <>
                          <div className="sm-pp-top">
                            <span className="sm-pp-type">{TYPE_EMOJI[p.content_type] || "•"}</span>
                            <div className="sm-pp-platforms">
                              {p.platforms.map((pl) => <PlatformPill key={pl} platform={pl} />)}
                            </div>
                          </div>
                          <div>
                            {lines[0] ? <div className="sm-pp-tag">{lines[0]}</div> : null}
                            {lines[1] ? <div className="sm-pp-headline">{lines[1]}</div> : null}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="sm-post-foot">
                      <div className="sm-post-name">{p.spec?.headline || p.spec?.hook || (p.caption || "").split("\n")[0] || `${p.content_type} draft`}</div>
                      <div className="sm-post-status-row">
                        <StatusBadge status={p.derived_status || p.status} lastError={p.last_error} />
                        <span className="sm-ps-time">
                          {p.status === "scheduled" && p.scheduled_for
                            ? new Date(p.scheduled_for).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" })
                            : p.status === "published" && p.published_at
                              ? `Posted ${relTime(p.published_at)} ago`
                              : `Updated ${relTime(p.updated_at)} ago`}
                        </span>
                      </div>
                      {p.metrics ? (
                        <div className="sm-post-metrics">
                          {p.metrics.likes ? <span className="sm-pm"><Heart size={11} /> {p.metrics.likes}</span> : null}
                          {p.metrics.comments ? <span className="sm-pm"><MessageCircle size={11} /> {p.metrics.comments}</span> : null}
                          {p.metrics.shares ? <span className="sm-pm"><Send size={11} /> {p.metrics.shares}</span> : null}
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <section className="sm-cta-banner">
            <div>
              <div className="sm-cta-title">Running low on scheduled content?</div>
              <p className="sm-cta-sub">Let the agent plan and queue a full week across all your accounts in one go.</p>
            </div>
            <button
              type="button"
              className="sm-cta-btn"
              onClick={() => navigate("/new-projects/social/create?type=batch")}
            >
              ⚡ Plan my week <ArrowRight size={13} />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
