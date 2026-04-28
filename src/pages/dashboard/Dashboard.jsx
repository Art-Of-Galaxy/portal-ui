import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownUp, Clock, FilePlus2, LayoutGrid, List, Star } from "lucide-react";
import { apiServices } from "../../services/apiServices";

const TABS = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "recent", label: "Recently viewed", icon: Clock },
  { id: "favorites", label: "Favorites", icon: Star },
];

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tab, setTab] = useState("all");
  const [view, setView] = useState("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiServices.get_projects();
        if (!cancelled) setProjects(res?.projects || []);
      } catch {
        if (!cancelled) setProjects([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (tab === "favorites") return projects.filter((p) => p.favorite);
    return projects;
  }, [projects, tab]);

  return (
    <div className="portal-page">
      <div className="portal-tab-row">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              className={`portal-tab ${tab === t.id ? "is-active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
        <span className="portal-tab-spacer" />
        <button type="button" className="portal-icon-btn" aria-label="Sort">
          <ArrowDownUp size={16} />
        </button>
        <div className="portal-view-toggle">
          <button
            type="button"
            className={view === "grid" ? "is-active" : ""}
            onClick={() => setView("grid")}
          >
            <LayoutGrid size={14} /> Grid
          </button>
          <button
            type="button"
            className={view === "list" ? "is-active" : ""}
            onClick={() => setView("list")}
          >
            <List size={14} /> List
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="portal-project-grid">
          {filtered.map((p, i) => (
            <button
              key={p.id ?? i}
              type="button"
              className={`portal-project-card ${i === 0 ? "is-accent" : ""}`}
              onClick={() => navigate(`/my-projects/${p.id ?? ""}`)}
            >
              <h3 className="portal-project-title">{p.name || "Untitled"}</h3>
              <p className="portal-project-meta">
                Created: {formatDate(p.startDate)}
              </p>
              <p className="portal-project-body">
                <strong>Brand:</strong> {p.brand || p.ownerId || "—"}
                {p.summary ? ` — ${p.summary}` : ""}
              </p>
              <div className="portal-project-footer">
                <span>Last viewed recently</span>
                <span>•••</span>
              </div>
            </button>
          ))}
          <button
            type="button"
            className="portal-project-card portal-project-new"
            onClick={() => navigate("/new-projects")}
          >
            <FilePlus2 size={28} />
            <span>
              Create a
              <br />
              New Project
            </span>
          </button>
        </div>
      ) : (
        <div className="portal-card">
          {filtered.length === 0 ? (
            <p className="portal-card-copy">
              {loading ? "Loading..." : "No projects yet. Create your first project to see it here."}
            </p>
          ) : (
            <table className="portal-task-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id ?? i}>
                    <td style={{ color: "var(--portal-text)" }}>{p.name}</td>
                    <td>{p.status || "—"}</td>
                    <td>{p.priority || "—"}</td>
                    <td>{formatDate(p.startDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
