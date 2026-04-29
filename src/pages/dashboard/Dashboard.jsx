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
          {filtered.map((p, i) => {
            const details = getProjectDetails(p);
            return (
              <button
                key={p.id ?? i}
                type="button"
                className={`portal-project-card ${i === 0 ? "is-accent" : ""}`}
                onClick={() => navigate(`/my-projects/${p.id ?? ""}`)}
              >
                <h3 className="portal-project-title">{details.title}</h3>
                <p className="portal-project-meta">
                  Created: {formatDate(details.created) || "Not set"}
                </p>
                {/*
                <div className="portal-project-details">
                  <p><strong>Service:</strong> {details.service}</p>
                  <p><strong>Category:</strong> {details.category}</p>
                  <p><strong>Status:</strong> {details.status}</p>
                  <p><strong>Priority:</strong> {details.priority}</p>
                  {details.due ? <p><strong>Due:</strong> {formatDate(details.due)}</p> : null}
                  {details.owner ? <p><strong>Owner:</strong> {details.owner}</p> : null}
                  {details.model ? <p><strong>Model:</strong> {details.model}</p> : null}
                  {details.tags ? <p><strong>Tags:</strong> {details.tags}</p> : null}
                </div>
                */}
                <div className="portal-project-footer">
                  <span>{details.service}</span>
                  <span>...</span>
                </div>
              </button>
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
