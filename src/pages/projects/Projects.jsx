import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, FolderKanban, Plus, Search } from "lucide-react";
import { apiServices } from "../../services/apiServices";

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function statusClass(label) {
  const l = String(label || "").toLowerCase();
  if (l.includes("progress")) return "status-progress";
  if (l.includes("done")) return "status-done";
  return "status-pending";
}

const ALL = "__all__";

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(ALL);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiServices.get_my_projects();
        if (cancelled) return;
        const rows = res?.projects || res?.data || [];
        setProjects(Array.isArray(rows) ? rows : []);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load projects");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [projects]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (categoryFilter !== ALL && p.category !== categoryFilter) return false;
      if (!q) return true;
      const hay = [
        p.project_name,
        p.category,
        p.service_type,
        p.status_label,
        p.priority_label,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [projects, search, categoryFilter]);

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <div>
          <h1 className="portal-page-title">My Projects</h1>
          <p className="portal-card-copy" style={{ marginTop: 4 }}>
            Every service request you submit lands here, organised by category.
          </p>
        </div>
        <button
          type="button"
          className="portal-cta"
          onClick={() => navigate("/new-projects")}
        >
          <Plus size={16} /> New project
        </button>
      </div>

      <div className="proj-toolbar">
        <div className="proj-search">
          <Search size={14} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects"
          />
        </div>
        <div className="proj-filter">
          <button
            type="button"
            className={categoryFilter === ALL ? "is-active" : ""}
            onClick={() => setCategoryFilter(ALL)}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={categoryFilter === c ? "is-active" : ""}
              onClick={() => setCategoryFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="portal-card">
          <p className="portal-card-copy" style={{ color: "var(--portal-danger)" }}>{error}</p>
        </div>
      ) : null}

      {loading ? (
        <p className="portal-card-copy">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="portal-card proj-empty">
          <h3>No projects yet</h3>
          <p>Submit a service request from the New Projects page and it will appear here.</p>
          <button
            type="button"
            className="portal-cta"
            style={{ marginTop: "1rem" }}
            onClick={() => navigate("/new-projects")}
          >
            Start a project
          </button>
        </div>
      ) : (
        <div className="proj-list">
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              className="proj-row"
              onClick={() => navigate(`/my-projects/${p.id}`)}
            >
              <div className="proj-row-name">
                <strong>{p.project_name || "Untitled project"}</strong>
                <span>
                  {p.service_type ? p.service_type.replace(/_/g, " ") : "Project"}
                  {p.model ? ` · ${p.model}` : ""}
                </span>
              </div>
              <span className="proj-pill">
                <FolderKanban size={12} style={{ marginRight: 4, verticalAlign: -2 }} />
                {p.category || "Uncategorised"}
              </span>
              <span className={`proj-pill ${statusClass(p.status_label)}`}>
                {p.status_label || "Pending"}
              </span>
              <span className="proj-row-meta">
                {formatDate(p.created_at || p.created_date)}
              </span>
              <ChevronRight size={16} className="proj-row-arrow" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
