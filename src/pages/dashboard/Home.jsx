import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiServices } from "../../services/apiServices";
import { useEffect, useState } from "react";

const GET_INSPIRED_TILES = [
  { title: "Discover how AI campaigns grow sales", tag: "Campaign" },
  { title: "Launch a brand in under a week", tag: "Branding" },
  { title: "Automate your client conversations", tag: "AI Ops" },
];

export function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const userName = localStorage.getItem("user_name") || "Andrey";
  const firstName = userName.split(" ")[0];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const projectsRes = await apiServices.get_projects().catch(() => null);
        const tasksRes = await apiServices.get_tasks().catch(() => null);
        if (cancelled) return;
        setProjects(projectsRes?.projects || []);
        setTasks(tasksRes?.tasks || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasProjects = projects.length > 0;

  const workflow = useMemo(() => {
    const total = tasks.length || 0;
    const counts = { approved: 0, done: 0, new: 0 };
    tasks.forEach((t) => {
      const s = String(t.status || "").toLowerCase();
      if (s === "done" || s === "3" || s.includes("approve")) counts.done += 1;
      else counts.new += 1;
    });
    const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
    return {
      approved: pct(counts.approved),
      done: pct(counts.done),
      newPct: total ? 100 - pct(counts.done) - pct(counts.approved) : 100,
      total,
    };
  }, [tasks]);

  const completion = useMemo(() => {
    if (!tasks.length) return 0;
    const done = tasks.filter((t) => String(t.status).toLowerCase() === "done").length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">
          Hello, {firstName}
          <br />
          <strong>{hasProjects ? "Welcome back" : "Let's create a project"}</strong>
        </h1>
        <button type="button" className="portal-cta" onClick={() => navigate("/new-projects")}>
          {hasProjects ? "Create new project" : "Create my first project"}
        </button>
      </div>

      <div className="portal-grid-2">
        <div className="portal-card">
          {hasProjects ? (
            <>
              <p className="portal-card-title">Welcome back!</p>
              <h2 className="portal-card-heading">Keep the momentum going</h2>
              <p className="portal-card-copy">
                You have {projects.length} active {projects.length === 1 ? "project" : "projects"}. Pick up
                where you left off or start something new.
              </p>
            </>
          ) : (
            <>
              <p className="portal-card-title">Welcome!</p>
              <h2 className="portal-card-heading">Create your first project</h2>
              <p className="portal-card-copy">
                Every great achievement starts with the first step. Give your project a name, set your
                goals, and start adding tasks.
              </p>
              <button
                type="button"
                className="portal-cta"
                style={{ marginTop: "1.4rem" }}
                onClick={() => navigate("/new-projects")}
              >
                Create my first project
              </button>
            </>
          )}
        </div>

        <div className="portal-card">
          <h2 className="portal-card-heading">Your Overall Progress</h2>
          {hasProjects ? (
            <>
              <p className="portal-card-copy" style={{ marginBottom: "1rem" }}>From all projects</p>
              <div className="portal-progress-track">
                <div className="portal-progress-fill" style={{ width: `${Math.max(completion, 6)}%` }}>
                  {completion}%
                </div>
                <span className="portal-progress-end">100%</span>
              </div>
              <p className="portal-progress-label">
                Task completion <strong>{completion}%</strong>
              </p>
            </>
          ) : (
            <p className="portal-card-copy">
              Here you'll see the percentage of completed tasks across all your projects.
            </p>
          )}
        </div>
      </div>

      <div className="portal-grid-2" style={{ marginTop: "1.2rem" }}>
        <div className="portal-card">
          <h2 className="portal-card-heading">Workflow</h2>
          {hasProjects ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", alignItems: "center", gap: "1.2rem" }}>
              <div>
                <div className="portal-workflow-row">
                  <span>
                    <span className="portal-workflow-dot" style={{ background: "#00c074" }} />
                    Approved
                  </span>
                  <span>{workflow.approved} %</span>
                </div>
                <div className="portal-workflow-row">
                  <span>
                    <span className="portal-workflow-dot" style={{ background: "#6a4cff" }} />
                    Done
                  </span>
                  <span>{workflow.done} %</span>
                </div>
                <div className="portal-workflow-row">
                  <span>
                    <span className="portal-workflow-dot" style={{ background: "#2e60ff" }} />
                    New
                  </span>
                  <span>{workflow.newPct} %</span>
                </div>
              </div>
              <div
                className="portal-donut"
                style={{
                  background: `conic-gradient(#00c074 0 ${workflow.approved}%, #6a4cff ${workflow.approved}% ${workflow.approved + workflow.done}%, #2e60ff ${workflow.approved + workflow.done}% 100%)`,
                }}
              />
            </div>
          ) : (
            <p className="portal-card-copy">
              As your tasks move forward, this chart will show you which stage each one is in (e.g., To-do,
              In Progress, Done).
            </p>
          )}
        </div>

        <div className="portal-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.8rem" }}>
            <h2 className="portal-card-heading" style={{ marginBottom: 0 }}>Task List</h2>
            {hasProjects ? (
              <input
                type="text"
                placeholder="Search tasks"
                style={{
                  height: 34,
                  borderRadius: 8,
                  border: "1px solid var(--portal-border)",
                  background: "var(--portal-surface-muted)",
                  color: "var(--portal-text)",
                  padding: "0 0.6rem",
                  fontSize: 12,
                  width: 180,
                }}
              />
            ) : null}
          </div>

          {tasks.length ? (
            <table className="portal-task-table">
              <thead>
                <tr>
                  <th style={{ width: 24 }}></th>
                  <th>Task</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.slice(0, 6).map((t, i) => (
                  <tr key={t.id ?? i}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td style={{ color: "var(--portal-text)" }}>{t.task_name || t.name}</td>
                    <td>{t.type || "—"}</td>
                    <td>{t.due_date || t.date || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="portal-card-copy">
              {loading
                ? "Loading your tasks..."
                : "You don't have any tasks yet. Create a project and add your first task to see it here."}
            </p>
          )}
        </div>
      </div>

      <div style={{ marginTop: "2.2rem" }}>
        <h2 className="portal-card-heading" style={{ textAlign: "center" }}>Get inspired</h2>
        <div className="portal-grid-3" style={{ marginTop: "1rem" }}>
          {GET_INSPIRED_TILES.map((tile) => (
            <div key={tile.title} className="portal-card" style={{ minHeight: 160 }}>
              <p className="portal-card-title">{tile.tag}</p>
              <h3 className="portal-card-heading" style={{ fontSize: 16 }}>{tile.title}</h3>
              <p className="portal-card-copy">Explore ideas and best practices to launch faster.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
