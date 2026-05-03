import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, ExternalLink, FileText, Image as ImageIcon, Trash2 } from "lucide-react";
import { apiServices } from "../../services/apiServices";

function formatServiceType(value) {
  if (!value) return "Other";
  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function isImageMime(mime, url) {
  if (mime && mime.startsWith("image/")) return true;
  if (typeof url === "string" && /\.(png|jpe?g|gif|webp|svg)$/i.test(url)) return true;
  return false;
}

function resolveUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  // Relative URLs (e.g. /uploads/abc.png) are served by the API host.
  const apiUrl = import.meta.env.VITE_PUBLIC_API_URL || "";
  try {
    const apiOrigin = new URL(apiUrl).origin;
    return `${apiOrigin}${url}`;
  } catch {
    return url;
  }
}

async function downloadFile(url, filename) {
  const response = await fetch(url, { mode: "cors" });
  if (!response.ok) throw new Error(`Fetch failed (${response.status})`);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
}

export default function MyFiles() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all | uploaded | generated

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiServices.list_files();
        if (cancelled) return;
        setFiles(res?.files || []);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load files.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (filter === "uploaded") return files.filter((f) => f.source === "upload");
    if (filter === "generated") return files.filter((f) => f.source === "generated");
    return files;
  }, [files, filter]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((file) => {
      const cat = file.category || "Uncategorized";
      const sub = formatServiceType(file.service_type);
      if (!map.has(cat)) map.set(cat, new Map());
      const subMap = map.get(cat);
      if (!subMap.has(sub)) subMap.set(sub, []);
      subMap.get(sub).push(file);
    });
    return Array.from(map.entries()).map(([category, subMap]) => ({
      category,
      sections: Array.from(subMap.entries()).map(([service, items]) => ({
        service,
        items,
      })),
    }));
  }, [filtered]);

  const handleDelete = async (file) => {
    if (!file?.id) return;
    if (!window.confirm(`Remove ${file.file_name}? This won't delete the underlying file.`)) {
      return;
    }
    try {
      await apiServices.delete_file(file.id);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch (err) {
      setError(err?.message || "Failed to delete file.");
    }
  };

  const handleDownload = async (file) => {
    setError("");
    try {
      await downloadFile(resolveUrl(file.url), file.file_name || `file-${file.id}`);
    } catch (err) {
      setError(err?.message || "Download failed. Try opening the file and saving manually.");
    }
  };

  const totals = useMemo(
    () => ({
      all: files.length,
      uploaded: files.filter((f) => f.source === "upload").length,
      generated: files.filter((f) => f.source === "generated").length,
    }),
    [files]
  );

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <div>
          <h1 className="portal-page-title">My Files</h1>
          <p className="portal-card-copy" style={{ marginTop: 4 }}>
            Everything you&apos;ve uploaded or AOG has generated for your projects, grouped by category.
          </p>
        </div>
      </div>

      <div className="portal-tab-row" style={{ marginTop: "1rem" }}>
        {[
          { id: "all", label: `All (${totals.all})` },
          { id: "generated", label: `Generated (${totals.generated})` },
          { id: "uploaded", label: `Uploaded (${totals.uploaded})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            className={`portal-tab ${filter === t.id ? "is-active" : ""}`}
            onClick={() => setFilter(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error ? (
        <div
          style={{
            background: "rgba(232,77,77,0.1)",
            border: "1px solid rgba(232,77,77,0.3)",
            color: "var(--portal-danger)",
            padding: "0.7rem 0.9rem",
            borderRadius: 8,
            margin: "0.6rem 0 1rem",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="portal-card-copy">Loading your files…</p>
      ) : filtered.length === 0 ? (
        <div className="portal-card">
          <h2 className="portal-card-heading">Nothing here yet</h2>
          <p className="portal-card-copy">
            Upload files inside any service form, or generate logos / mockups, and they&apos;ll
            appear here grouped by category.
          </p>
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
        grouped.map((group) => (
          <section key={group.category} className="files-category">
            <h2 className="files-category-title">{group.category}</h2>
            {group.sections.map((sub) => (
              <div key={sub.service} className="files-section">
                <h3 className="files-section-title">{sub.service}</h3>
                <div className="files-grid">
                  {sub.items.map((file) => {
                    const url = resolveUrl(file.url);
                    const isImage = isImageMime(file.mime_type, file.url);
                    return (
                      <article key={file.id} className="files-card">
                        <div className="files-card-preview">
                          {isImage ? (
                            <img src={url} alt={file.file_name || "file"} loading="lazy" />
                          ) : (
                            <FileText size={32} />
                          )}
                        </div>
                        <div className="files-card-body">
                          <div className="files-card-name" title={file.file_name}>
                            {isImage ? <ImageIcon size={12} /> : <FileText size={12} />}
                            <span>{file.file_name || `file-${file.id}`}</span>
                          </div>
                          <div className="files-card-meta">
                            <span>{file.source === "generated" ? "Generated" : "Uploaded"}</span>
                            <span>·</span>
                            <span>{formatDate(file.created_at)}</span>
                          </div>
                          {file.project_name ? (
                            <div className="files-card-project">{file.project_name}</div>
                          ) : null}
                          <div className="files-card-actions">
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="files-card-action"
                              aria-label="Open in new tab"
                            >
                              <ExternalLink size={13} />
                            </a>
                            <button
                              type="button"
                              className="files-card-action"
                              onClick={() => handleDownload(file)}
                              aria-label="Download"
                            >
                              <Download size={13} />
                            </button>
                            <button
                              type="button"
                              className="files-card-action"
                              onClick={() => handleDelete(file)}
                              aria-label="Remove from My Files"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        ))
      )}
    </div>
  );
}
