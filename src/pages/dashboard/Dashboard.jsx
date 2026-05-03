import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownUp, Clock, FilePlus2, Loader2, LayoutGrid, List, Star, Trash2 } from "lucide-react";
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

function formatRelative(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day} day${day === 1 ? "" : "s"} ago`;
  const mo = Math.round(day / 30);
  if (mo < 12) return `${mo} month${mo === 1 ? "" : "s"} ago`;
  const yr = Math.round(mo / 12);
  return `${yr} year${yr === 1 ? "" : "s"} ago`;
}

function formatServiceType(value) {
  if (!value) return "Project";
  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusLabel(value) {
  const labels = { 1: "In Progress", 2: "Pending", 3: "Done" };
  return labels[value] || value || "Pending";
}

function priorityLabel(value) {
  const labels = { 1: "Low", 2: "Medium", 3: "High" };
  return labels[value] || value || "Low";
}

function getProjectDetails(project) {
  return {
    title: project.project_name || project.name || "Untitled project",
    created: project.created_at || project.created_date || project.startDate,
    due: project.due_date || project.endDate,
    service: formatServiceType(project.service_type),
    category: project.category || "General",
    status: project.status_label || statusLabel(project.status),
    priority: project.priority_label || priorityLabel(project.priority),
    owner: project.ownerId || project.assignee || project.user_email || "",
    model: project.model || "",
    tags: project.tags || "",
  };
}

export function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tab, setTab] = useState("all");
  const [view, setView] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async (project, event) => {
    event.stopPropagation();
    if (!project?.id || deletingId) return;
    const confirmed = window.confirm(
      `Delete "${project.project_name || "this project"}"? This can't be undone.`
    );
    if (!confirmed) return;

    setDeletingId(project.id);
    setDeleteError("");
    try {
      const res = await apiServices.delete_project(project.id);
      if (!res?.success) throw new Error(res?.message || "Delete failed");
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
    } catch (err) {
      setDeleteError(err?.message || "Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  };

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

      {deleteError ? (
        <div
          style={{
            background: "rgba(232,77,77,0.1)",
            border: "1px solid rgba(232,77,77,0.3)",
            color: "var(--portal-danger)",
            padding: "0.6rem 0.9rem",
            borderRadius: 8,
            margin: "0.6rem 0",
            fontSize: 13,
          }}
        >
          {deleteError}
        </div>
      ) : null}

      {loading && view === "grid" ? (
        <div className="portal-project-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="portal-project-card portal-project-card-skeleton">
              <div className="portal-project-card-body">
                <div className="skeleton-line skeleton-line-lg" />
                <div className="skeleton-line skeleton-line-sm" />
                <div className="skeleton-line" />
                <div className="skeleton-line skeleton-line-block" />
              </div>
            </div>
          ))}
          <div className="portal-project-card portal-project-loader">
            <Loader2 size={20} className="portal-spin" />
            <span>Loading recent projects…</span>
          </div>
        </div>
      ) : view === "grid" ? (
        <div className="portal-project-grid">
          {filtered.map((p, i) => {
            const details = getProjectDetails(p);
            const description =
              p.tags ||
              (details.category && details.category !== "General"
                ? `Saved under ${details.category}.`
                : "AI-generated brief saved to this project.");
            const lastSeenAt = p.updated_at || details.created;
            return (
              <div
                key={p.id ?? i}
                role="button"
                tabIndex={0}
                className="portal-project-card"
                onClick={() => navigate(`/my-projects/${p.id ?? ""}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/my-projects/${p.id ?? ""}`);
                  }
                }}
              >
                <div className="portal-project-card-body">
                  <div className="portal-project-card-header">
                    <h3 className="portal-project-title">{details.service}</h3>
                    <p className="portal-project-meta">
                      Created: {formatDate(details.created) || "Not set"}
                    </p>
                  </div>

                  {/* <hr className="portal-project-divider" /> */}

                  <div className="portal-project-card-body-wrapper">

                    <p className="portal-project-brand">
                      <strong>Brand:</strong> {details.title}
                    </p>
                    <p className="portal-project-body">{description}</p>

                    <div className="portal-project-footer">
                      <span>Last viewed {formatRelative(lastSeenAt) || "recently"}</span>
                      <button
                        type="button"
                        className="portal-project-menu-btn"
                        onClick={(event) => handleDelete(p, event)}
                        disabled={deletingId === p.id}
                        aria-label="Delete project"
                        title="Delete project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>


                  </div>
                </div>
              </div>
            );
          })}
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
                  <th>Created</th>
                  <th>Service</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const details = getProjectDetails(p);
                  return (
                    <tr
                      key={p.id ?? i}
                      className="portal-project-list-row"
                      tabIndex={0}
                      role="button"
                      onClick={() => navigate(`/my-projects/${p.id ?? ""}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          navigate(`/my-projects/${p.id ?? ""}`);
                        }
                      }}
                    >
                      <td style={{ color: "var(--portal-text)" }}>{details.title}</td>
                      <td>{formatDate(details.created) || "Not set"}</td>
                      <td>{details.service}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
