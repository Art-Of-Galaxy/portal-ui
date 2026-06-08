import { useState } from "react";
import PropTypes from "prop-types";
import {
  AlertTriangle,
  BookOpen,
  Check,
  Download,
  Eye,
  PenTool,
  Palette,
  Smartphone,
  Sparkles,
  Type,
} from "lucide-react";
import { apiServices } from "../../services/apiServices";

// Brand Guidelines output. Shows the brand identity sidebar (essence,
// personality, mood, palette, type) on the left and a 6 card deliverable
// grid on the right. Matches the structure of the source HTML mockup but
// uses the portal accent (purple) + brand green tokens, not teal.

const ICON_MAP = {
  book: BookOpen,
  sparkles: Sparkles,
  palette: Palette,
  smartphone: Smartphone,
  pen: PenTool,
  type: Type,
};

function safeFilename(brand, slug, ext = "html") {
  const safe = String(brand || "brand")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "brand";
  return `${safe}-${slug}.${ext}`;
}

async function downloadViaPresign(url, filename) {
  if (!url) return;
  try {
    const res = await apiServices.presigned_download({ url, filename });
    const target = res?.presigned_url || url;
    const link = document.createElement("a");
    link.href = target;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch {
    window.open(url, "_blank", "noopener");
  }
}

function DeliverableCard({ deliverable, brandName, onPreview }) {
  const Icon = ICON_MAP[deliverable.icon] || BookOpen;
  const cover =
    deliverable.preview_url ||
    (deliverable.kind === "image_pack" ? deliverable.images?.[0]?.url : null);
  const disabled = !deliverable.url && !cover;
  const ext = deliverable.kind === "image_pack" ? "png" : "html";

  return (
    <article className="bg-deliv-card">
      <div
        className="bg-deliv-preview"
        style={{ background: deliverable.kind === "image_pack" && cover ? "transparent" : "var(--portal-surface-muted)" }}
      >
        {deliverable.kind === "image_pack" && cover ? (
          <img src={cover} alt={`${deliverable.name} preview`} />
        ) : (
          <span
            className="bg-deliv-icon"
            style={{ background: `${deliverable.accent || "#5540ff"}1a`, color: deliverable.accent || "#5540ff" }}
          >
            <Icon size={22} />
          </span>
        )}
      </div>
      <div className="bg-deliv-body">
        <h3 className="bg-deliv-name">{deliverable.name}</h3>
        <p className="bg-deliv-desc">{deliverable.description}</p>
        <div className="bg-deliv-actions">
          <button
            type="button"
            className="bg-deliv-btn is-view"
            disabled={disabled}
            onClick={() => onPreview(deliverable)}
          >
            <Eye size={13} /> View
          </button>
          <button
            type="button"
            className="bg-deliv-btn is-download"
            disabled={disabled}
            onClick={() =>
              deliverable.kind === "image_pack"
                ? downloadViaPresign(deliverable.images[0].url, safeFilename(brandName, `${deliverable.id}-1`, ext))
                : downloadViaPresign(deliverable.url, safeFilename(brandName, deliverable.id, ext))
            }
          >
            <Download size={13} /> Download
          </button>
        </div>
      </div>
    </article>
  );
}

DeliverableCard.propTypes = {
  deliverable: PropTypes.object.isRequired,
  brandName: PropTypes.string,
  onPreview: PropTypes.func.isRequired,
};

function PreviewOverlay({ deliverable, onClose }) {
  if (!deliverable) return null;
  return (
    <div
      className="bg-deliv-overlay"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div className="bg-deliv-overlay-frame" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="bg-deliv-overlay-close" onClick={onClose}>×</button>
        {deliverable.kind === "image_pack" ? (
          <div className="bg-deliv-overlay-imagepack">
            {(deliverable.images || []).map((img, i) => (
              <img key={i} src={img.url} alt={`${deliverable.name} ${i + 1}`} />
            ))}
          </div>
        ) : (
          <iframe
            title={`${deliverable.name} preview`}
            src={deliverable.url}
            className="bg-deliv-overlay-iframe"
          />
        )}
      </div>
    </div>
  );
}

PreviewOverlay.propTypes = {
  deliverable: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default function BrandGuidelinesView({
  guidelines,
  deliverables = [],
  brandName = "",
  description = "",
  tagline = "",
  statusLabel = "",
  projectId = null,
  errors,
}) {
  const [previewing, setPreviewing] = useState(null);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [revisionSent, setRevisionSent] = useState(false);
  const [revisionSubmitting, setRevisionSubmitting] = useState(false);
  const [revisionError, setRevisionError] = useState("");
  const [downloadingAll, setDownloadingAll] = useState(false);

  if (!guidelines || typeof guidelines !== "object") {
    return (
      <div className="portal-card">
        <p className="portal-card-copy">No output to display yet.</p>
      </div>
    );
  }

  const moods = Array.isArray(guidelines.mood_keywords) ? guidelines.mood_keywords : [];
  const verbal = guidelines.verbal_identity || {};
  const typo = guidelines.typography || {};
  const colors = guidelines.color_system || {};
  const palette = []
    .concat(Array.isArray(colors.primary) ? colors.primary : [])
    .concat(Array.isArray(colors.secondary) ? colors.secondary : [])
    .slice(0, 4);

  const resolvedStatus = (statusLabel || "Done").toLowerCase();
  const statusCls = resolvedStatus.includes("progress")
    ? "is-progress"
    : resolvedStatus.includes("done")
      ? "is-done"
      : "is-pending";

  async function handleDownloadAll() {
    if (downloadingAll) return;
    setDownloadingAll(true);
    try {
      for (const d of deliverables) {
        if (d.kind === "document" && d.url) {
          await downloadViaPresign(d.url, safeFilename(brandName, d.id, "html"));
        } else if (d.kind === "image_pack" && Array.isArray(d.images)) {
          for (let i = 0; i < d.images.length; i += 1) {
            const img = d.images[i];
            if (img?.url) {
              await downloadViaPresign(img.url, safeFilename(brandName, `${d.id}-${i + 1}`, "png"));
            }
          }
        }
      }
    } finally {
      setDownloadingAll(false);
    }
  }

  async function handleSubmitRevision() {
    if (revisionSubmitting) return;
    const notes = revisionNotes.trim();
    if (!notes) { setRevisionError("Please tell us what to change."); return; }
    setRevisionSubmitting(true);
    setRevisionError("");
    try {
      const res = await apiServices.create_revision({
        project_id: projectId || null,
        service_type: "brand_guidelines",
        concept_index: 0,
        notes,
      });
      if (!res?.success) throw new Error(res?.message || "Could not submit revision.");
      setRevisionSent(true);
      setRevisionNotes("");
      setRevisionOpen(false);
      setTimeout(() => setRevisionSent(false), 5000);
    } catch (err) {
      setRevisionError(err?.message || "Could not submit. Try again?");
    } finally {
      setRevisionSubmitting(false);
    }
  }

  return (
    <div className="bg-result-page">
      <div className="bg-result-header-row">
        <div>
          <h1 className="bg-result-project-title">{brandName || "Brand"}</h1>
          <div className="bg-result-meta-row">
            <span className="bg-result-badge is-category">Branding &amp; Design</span>
            <span className={`bg-result-badge ${statusCls}`}>{statusLabel || "Done"}</span>
            {tagline ? <span className="bg-result-badge is-muted">{tagline}</span> : null}
          </div>
        </div>
      </div>

      {Array.isArray(errors) && errors.length ? (
        <div className="bg-result-banner is-warn">
          <AlertTriangle size={14} />
          <span>{errors[0]}</span>
        </div>
      ) : null}

      <div className="bg-result-grid">
        {/* SIDEBAR */}
        <aside className="bg-result-side">
          <section className="bg-identity-card">
            <div className="bg-identity-status">
              <span className="bg-identity-dot" />
              <span className="bg-identity-status-txt">Branding &amp; Design · {statusLabel || "Done"}</span>
            </div>
            <h2 className="bg-identity-name">{brandName}</h2>
            {guidelines.brand_essence ? (
              <p className="bg-identity-sub">{guidelines.brand_essence}</p>
            ) : null}
          </section>

          {description || guidelines.brand_summary ? (
            <section className="bg-side-card">
              <span className="bg-side-label">Brand essence</span>
              <p className="bg-side-body">{description || guidelines.brand_summary}</p>
            </section>
          ) : null}

          {verbal.voice ? (
            <section className="bg-side-card">
              <span className="bg-side-label">Personality</span>
              <p className="bg-side-body">{verbal.voice}</p>
              {verbal.tone ? (
                <p className="bg-side-body-muted">Voice: {verbal.tone}</p>
              ) : null}
            </section>
          ) : null}

          {moods.length ? (
            <section className="bg-side-card">
              <span className="bg-side-label">Brand mood</span>
              <div className="bg-side-mood-wrap">
                {moods.map((m) => (
                  <span key={m} className="bg-side-mood-tag">{m}</span>
                ))}
              </div>
            </section>
          ) : null}

          {palette.length ? (
            <section className="bg-side-card">
              <span className="bg-side-label">Color palette</span>
              <div className="bg-side-swatch-row">
                {palette.map((sw) => (
                  <div key={sw.hex} className="bg-side-swatch-item">
                    <span
                      className="bg-side-swatch-circle"
                      style={{ background: sw.hex }}
                      title={sw.name}
                    />
                    <span className="bg-side-swatch-hex">{sw.hex}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {typo.display?.family || typo.body?.family ? (
            <section className="bg-side-card">
              <span className="bg-side-label">Typography</span>
              {typo.display?.family ? (
                <div className="bg-side-type-item">
                  <span className="bg-side-type-role">Display</span>
                  <span className="bg-side-type-name">{typo.display.family}</span>
                </div>
              ) : null}
              {typo.body?.family ? (
                <div className="bg-side-type-item">
                  <span className="bg-side-type-role">Body</span>
                  <span className="bg-side-type-name">{typo.body.family}</span>
                </div>
              ) : null}
            </section>
          ) : null}
        </aside>

        {/* MAIN */}
        <div className="bg-result-main">
          <div className="bg-result-main-topbar">
            <div>
              <h2 className="bg-result-main-title">Brand Guidelines · Ready to download</h2>
              <p className="bg-result-main-sub">
                All files are export-ready. View any document or download the full package.
              </p>
            </div>
            <button
              type="button"
              className="bg-result-dl-all"
              onClick={handleDownloadAll}
              disabled={downloadingAll}
            >
              <Download size={14} />
              {downloadingAll ? "Downloading..." : "Download all files"}
            </button>
          </div>

          <div className="bg-deliv-grid">
            {deliverables.map((d) => (
              <DeliverableCard
                key={d.id}
                deliverable={d}
                brandName={brandName}
                onPreview={(deliv) => setPreviewing(deliv)}
              />
            ))}
          </div>

          {/* Revision CTA */}
          <section className="bg-cta-banner">
            <div>
              <div className="bg-cta-title">Need adjustments to any of the files?</div>
              <p className="bg-cta-sub">
                Your AOG strategist will review your feedback and update the guidelines.
              </p>
            </div>
            {revisionSent ? (
              <span className="bg-revision-sent">
                <Check size={14} /> Revision request received
              </span>
            ) : (
              <button
                type="button"
                className="bg-revision-btn"
                onClick={() => { setRevisionOpen(true); setRevisionError(""); }}
              >
                Request revision →
              </button>
            )}
          </section>

          {revisionOpen ? (
            <section className="bg-revision-form">
              <label htmlFor="bg-revision-notes">What should we change about the guidelines?</label>
              <textarea
                id="bg-revision-notes"
                rows={4}
                placeholder="e.g. Soften the primary palette toward warmer tones and tighten the voice section."
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                disabled={revisionSubmitting}
              />
              {revisionError ? (
                <div className="bg-revision-form-error">
                  <AlertTriangle size={13} /> {revisionError}
                </div>
              ) : null}
              <div className="bg-revision-form-actions">
                <button
                  type="button"
                  className="bg-revision-form-cancel"
                  onClick={() => { setRevisionOpen(false); setRevisionError(""); }}
                  disabled={revisionSubmitting}
                >Cancel</button>
                <button
                  type="button"
                  className="bg-revision-form-submit"
                  onClick={handleSubmitRevision}
                  disabled={revisionSubmitting || !revisionNotes.trim()}
                >
                  {revisionSubmitting ? "Sending..." : "Send to my strategist"}
                </button>
              </div>
            </section>
          ) : null}

          {/* Schedule meeting */}
          <section className="bg-cta-secondary">
            <div>
              <div className="bg-cta-sec-title">Not seeing the right direction?</div>
              <p className="bg-cta-sec-sub">
                Book a quick call and we&apos;ll walk through the guidelines together.
              </p>
            </div>
            <a
              className="bg-schedule-btn"
              href={`mailto:info@artofgalaxy.com?subject=${encodeURIComponent(
                `Brand Guidelines meeting request: ${brandName || "my brand"}`
              )}&body=${encodeURIComponent(
                `Hi AOG team,\n\nI just received the brand guidelines for "${brandName || "(unnamed brand)"}" and I'd love to book a quick meeting to walk through them.\n\nThanks!`
              )}`}
            >
              Schedule a meeting →
            </a>
          </section>
        </div>
      </div>

      <PreviewOverlay deliverable={previewing} onClose={() => setPreviewing(null)} />
    </div>
  );
}

BrandGuidelinesView.propTypes = {
  guidelines: PropTypes.object,
  deliverables: PropTypes.array,
  brandName: PropTypes.string,
  description: PropTypes.string,
  tagline: PropTypes.string,
  statusLabel: PropTypes.string,
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  errors: PropTypes.arrayOf(PropTypes.string),
};
