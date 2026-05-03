import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FolderKanban, Trash2 } from "lucide-react";
import { apiServices } from "../../services/apiServices";
import BrandGuidelinesView from "./BrandGuidelinesView";
import RebrandingView from "./RebrandingView";
import EcommerceMockupsView from "./EcommerceMockupsView";
import LogoDesignView from "./LogoDesignView";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function statusClass(label) {
  const l = String(label || "").toLowerCase();
  if (l.includes("progress")) return "status-progress";
  if (l.includes("done")) return "status-done";
  return "status-pending";
}

function safeParseJSON(value) {
  if (value == null) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!project?.id || deleting) return;
    const confirmed = window.confirm(
      `Delete "${project.project_name || "this project"}"? This can't be undone.`
    );
    if (!confirmed) return;
    setDeleting(true);
    setError("");
    try {
      const res = await apiServices.delete_project(project.id);
      if (!res?.success) throw new Error(res?.message || "Delete failed");
      navigate("/my-projects");
    } catch (err) {
      setError(err?.message || "Failed to delete project");
      setDeleting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiServices.get_project_by_id(id);
        if (cancelled) return;
        if (!res?.success) {
          setError(res?.message || "Project not found");
          return;
        }
        setProject(res.project);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load project");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="portal-page">
        <p className="portal-card-copy">Loading project…</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="portal-page">
        <button
          type="button"
          className="portal-back-link"
          onClick={() => navigate("/my-projects")}
        >
          <ArrowLeft size={16} />
          Back to My Projects
        </button>
        <div className="portal-card">
          <h2 className="portal-card-heading">We couldn&apos;t open that project</h2>
          <p className="portal-card-copy">{error || "Project not found."}</p>
        </div>
      </div>
    );
  }

  const output = safeParseJSON(project.output_data);
  const serviceType = project.service_type;

  const renderOutput = () => {
    if (!output) {
      return (
        <div className="portal-card">
          <h3 className="portal-card-heading">Output</h3>
          <p className="portal-card-copy">No AI output captured for this project.</p>
        </div>
      );
    }
    if (serviceType === "brand_guidelines") {
      return (
        <BrandGuidelinesView
          guidelines={output}
          brandName={project.project_name}
          model={project.model}
        />
      );
    }
    if (serviceType === "rebranding") {
      return (
        <RebrandingView
          rebranding={output}
          brandName={project.project_name}
          model={project.model}
        />
      );
    }
    if (serviceType === "ecommerce_mockups") {
      return (
        <EcommerceMockupsView
          mockups={output}
          productName={project.project_name}
          model={project.model}
        />
      );
    }
    if (serviceType === "logo_design") {
      return (
        <LogoDesignView
          images={output.images || []}
          prompt={output.prompt}
          brandName={project.project_name}
          model={project.model}
          seed={output.seed}
          errors={output.errors}
        />
      );
    }
    return (
      <div className="portal-card">
        <h3 className="portal-card-heading">Output</h3>
        <pre
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            fontSize: 12,
            color: "var(--portal-text-muted)",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          {JSON.stringify(output, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="portal-page">
      <button
        type="button"
        className="portal-back-link"
        onClick={() => navigate("/my-projects")}
      >
        <ArrowLeft size={16} />
        Back to My Projects
      </button>

      <div className="proj-detail-head">
        <div className="proj-detail-head-info">
          <h1>{project.project_name}</h1>
          <div className="proj-detail-tags">
            {project.category ? (
              <span className="proj-pill"><FolderKanban size={12} style={{ marginRight: 4, verticalAlign: -2 }} />{project.category}</span>
            ) : null}
            <span className={`proj-pill ${statusClass(project.status_label)}`}>{project.status_label}</span>
            <span className="proj-pill">{project.priority_label} priority</span>
            <span style={{ alignSelf: "center" }}>
              Created {formatDate(project.created_at || project.created_date)}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="proj-detail-delete"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 size={14} />
          {deleting ? "Deleting…" : "Delete project"}
        </button>
      </div>

      {error ? (
        <div
          style={{
            background: "rgba(232,77,77,0.1)",
            border: "1px solid rgba(232,77,77,0.3)",
            color: "var(--portal-danger)",
            padding: "0.6rem 0.9rem",
            borderRadius: 8,
            margin: "0.6rem 0 1rem",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      ) : null}

      {renderOutput()}
    </div>
  );
}
