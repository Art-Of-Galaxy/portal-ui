import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  X,
} from "lucide-react";
import SafeImage from "../../components/ui/SafeImage";
import { apiServices } from "../../services/apiServices";

// Brand SVG icons for the per-concept action buttons (download + expand).
import outputDownloadIcon from "../../assets/branding/logo/assets/Output_Download.svg";
import outputExpandIcon from "../../assets/branding/logo/assets/Output_Expand.svg";

// -------- Lookups --------

const STYLE_LABELS = {
  vintage: "Vintage",
  mascot: "Mascot",
  wordmark: "Wordmark",
  monogram: "Monogram",
  combination: "Combination",
  minimalist: "Minimalist",
};

const TYPO_LABELS = {
  serif: "Serif",
  sans: "Sans Serif",
  script: "Script",
  modern: "Modern",
  display: "Display",
  condensed: "Condensed",
};

// A representative hex for each color-theory family (used when the user
// only tapped the theory cards and didn't enter a custom hex).
const FAMILY_HEX = {
  blue: "#3a7bd5",
  purple: "#8e2de2",
  pink: "#d12c8c",
  red: "#c0392b",
  orange: "#d35400",
  yellow: "#f1c40f",
  green: "#2e7d32",
  teal: "#16a085",
  grey: "#5d5d5d",
};

// -------- Helpers --------

function isValidHex(value) {
  return typeof value === "string" && /^#?[0-9a-fA-F]{6}$/.test(value.trim());
}
function normalizeHex(value) {
  const v = String(value || "").trim();
  return v.startsWith("#") ? v.toUpperCase() : `#${v.toUpperCase()}`;
}
function isUsable(img) {
  return Boolean(img && typeof img.url === "string" && /^https?:\/\//i.test(img.url));
}

function inferExtension(url, contentType) {
  const ct = String(contentType || "").split(";")[0].trim().toLowerCase();
  const map = {
    "image/png": "png", "image/jpeg": "jpg", "image/jpg": "jpg",
    "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg",
  };
  if (map[ct]) return map[ct];
  if (ct.includes("/")) {
    const tail = ct.split("/")[1].split("+")[0].replace(/[^a-z0-9]/g, "");
    if (tail) return tail === "jpeg" ? "jpg" : tail;
  }
  try {
    const path = new URL(url).pathname;
    const m = path.match(/\.([a-zA-Z0-9]{2,5})$/);
    if (m) return m[1].toLowerCase();
  } catch {
    /* ignore */
  }
  return "png";
}

function triggerDownload(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function downloadViaPresign(url, filename) {
  try {
    const res = await apiServices.presigned_download({ url, filename });
    triggerDownload(res?.presigned_url || url, filename);
  } catch {
    window.open(url, "_blank", "noopener");
  }
}

// -------- Subcomponents --------

function SidebarCard({ label = "", children }) {
  return (
    <section className="logo-result-side-card">
      {label ? <span className="logo-result-side-card-label">{label}</span> : null}
      {children}
    </section>
  );
}
SidebarCard.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node.isRequired,
};

function ConceptCard({
  img,
  index,
  selected = false,
  broken = false,
  downloading = false,
  onSelect,
  onPreview,
  onDownload,
  onError,
}) {
  return (
    <article
      className={`logo-concept-card ${selected ? "is-selected" : ""}`}
      onClick={() => onSelect(index)}
    >
      {selected ? (
        <span className="logo-concept-selected-badge" aria-label="Selected concept">
          <Check size={12} />
        </span>
      ) : null}
      <div className="logo-concept-image">
        {broken ? (
          <div className="logo-concept-broken">
            <ImageOff size={28} />
            <span>Image unavailable</span>
          </div>
        ) : (
          <SafeImage
            src={img.url}
            alt={`Logo concept ${index + 1}`}
            onError={() => onError(index)}
          />
        )}
        {/* Invisible click target: clicking the image opens the full
            preview overlay. No hover overlay or icon, the cue is just
            the cursor change. The action buttons in the footer remain
            for explicit Preview / Download intents. */}
        {!broken ? (
          <button
            type="button"
            className="logo-concept-hover"
            onClick={(e) => { e.stopPropagation(); onPreview(index); }}
            aria-label={`Open larger preview of concept ${index + 1}`}
          />
        ) : null}
      </div>
      <div className="logo-concept-footer">
        <span className="logo-concept-name">Concept {index + 1}</span>
        <div className="logo-concept-actions">
          <button
            type="button"
            className="logo-concept-action-btn"
            onClick={(e) => { e.stopPropagation(); onPreview(index); }}
            aria-label={`Preview concept ${index + 1}`}
            title="Preview"
          >
            <img src={outputExpandIcon} alt="" />
          </button>
          <button
            type="button"
            className="logo-concept-action-btn"
            onClick={(e) => { e.stopPropagation(); onDownload(img, index); }}
            disabled={downloading || broken}
            aria-label={`Download concept ${index + 1}`}
            title="Download"
          >
            <img src={outputDownloadIcon} alt="" />
          </button>
        </div>
      </div>
    </article>
  );
}
ConceptCard.propTypes = {
  img: PropTypes.shape({ url: PropTypes.string, content_type: PropTypes.string }).isRequired,
  index: PropTypes.number.isRequired,
  selected: PropTypes.bool,
  broken: PropTypes.bool,
  downloading: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

// -------- Main view --------

export default function LogoDesignView({
  // existing
  images = [], prompt = "", brandName = "", model = "", seed = null, errors,
  requested,
  // new — needed for the redesigned layout
  tagline = "", businessDescription = "", logoStyle = "",
  selectedColors = [], customColors = [], typography = [],
  status = "", statusLabel = "",
  onRegenerate,
  projectId = null,
}) {
  const usable = (Array.isArray(images) ? images : []).filter(isUsable);
  const [selectedConcept, setSelectedConcept] = useState(0);
  const [downloadingIndex, setDownloadingIndex] = useState(-1);
  const [downloadError, setDownloadError] = useState("");
  const [brokenIndices, setBrokenIndices] = useState(() => new Set());
  const [previewIndex, setPreviewIndex] = useState(-1);
  // Revision form state. The button now opens an inline notes box
  // instead of firing a fake toast; submitting POSTs to /api/revisions.
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [revisionSubmitting, setRevisionSubmitting] = useState(false);
  const [revisionSent, setRevisionSent] = useState(false);
  const [revisionError, setRevisionError] = useState("");

  useEffect(() => {
    // Keep selection valid when image set changes.
    if (selectedConcept >= usable.length) setSelectedConcept(0);
  }, [usable.length, selectedConcept]);

  // Keyboard navigation while the preview overlay is open:
  // Escape closes; ← / → step through the concepts.
  useEffect(() => {
    if (previewIndex < 0) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") {
        setPreviewIndex(-1);
      } else if (event.key === "ArrowRight") {
        setPreviewIndex((i) => (i + 1) % usable.length);
      } else if (event.key === "ArrowLeft") {
        setPreviewIndex((i) => (i - 1 + usable.length) % usable.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewIndex, usable.length]);

  // ----- Palette -----
  const palette = useMemo(() => {
    const out = [];
    const seen = new Set();
    const add = (hex) => {
      const h = normalizeHex(hex);
      if (!isValidHex(h)) return;
      if (seen.has(h)) return;
      seen.add(h);
      out.push(h);
    };
    (Array.isArray(selectedColors) ? selectedColors : []).forEach((c) => {
      const family = String(c || "").toLowerCase();
      if (FAMILY_HEX[family]) add(FAMILY_HEX[family]);
    });
    (Array.isArray(customColors) ? customColors : []).forEach((c) => add(c));
    return out.slice(0, 4);
  }, [selectedColors, customColors]);

  // ----- Typography rows (label: value) -----
  const typoRows = useMemo(() => {
    const list = Array.isArray(typography) ? typography.filter(Boolean) : [];
    if (list.length === 0) return [];
    const rows = [];
    if (list[0]) rows.push({ label: "Display", value: TYPO_LABELS[list[0]] || list[0] });
    if (list[1]) rows.push({ label: "Body", value: TYPO_LABELS[list[1]] || list[1] });
    list.slice(2).forEach((id, i) => {
      rows.push({ label: `Accent ${i + 1}`, value: TYPO_LABELS[id] || id });
    });
    return rows;
  }, [typography]);

  // ----- Status pill -----
  const resolvedStatus = useMemo(() => {
    const raw = (statusLabel || status || "in progress").toString().toLowerCase();
    if (raw.includes("done") || raw === "3") return { cls: "is-done", text: "Done" };
    if (raw.includes("progress") || raw === "1") return { cls: "is-progress", text: "In progress" };
    return { cls: "is-pending", text: "Pending" };
  }, [status, statusLabel]);

  const styleLabel = STYLE_LABELS[String(logoStyle || "").toLowerCase()] || logoStyle;

  const markBroken = (index) => {
    setBrokenIndices((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev); next.add(index); return next;
    });
  };

  const handleDownload = async (img, index) => {
    setDownloadError("");
    setDownloadingIndex(index);
    try {
      const ext = inferExtension(img.url, img.content_type);
      const safeBrand = (brandName || "logo").replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
      await downloadViaPresign(img.url, `${safeBrand}-concept-${index + 1}.${ext}`);
    } catch (err) {
      setDownloadError(err?.message || "Download failed. Right-click the image to save.");
    } finally {
      setDownloadingIndex(-1);
    }
  };

  // Open the inline revision form. Submitting POSTs to /api/revisions
  // so the AOG strategist actually receives the feedback (previously
  // this button just fired a fake toast that the end user described
  // as "nothing happens").
  const handleOpenRevision = () => {
    setRevisionOpen(true);
    setRevisionSent(false);
    setRevisionError("");
  };

  const handleSubmitRevision = async () => {
    if (revisionSubmitting) return;
    const notes = revisionNotes.trim();
    if (!notes) {
      setRevisionError("Please tell us what to change.");
      return;
    }
    setRevisionSubmitting(true);
    setRevisionError("");
    try {
      const res = await apiServices.create_revision({
        project_id: projectId || null,
        service_type: "logo_design",
        concept_index: selectedConcept,
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
  };

  // Nothing to show if the model returned no usable images.
  if (!usable.length) {
    return (
      <div className="portal-card">
        <p className="portal-card-copy">
          No logo images were returned. The model may have rejected the prompt or rate-limited the
          request — try again with a slightly different description.
        </p>
        {Array.isArray(errors) && errors.length ? (
          <ul className="portal-card-copy" style={{ marginTop: 8 }}>
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        ) : null}
      </div>
    );
  }

  const partial = typeof requested === "number" && requested > usable.length;
  const upperBrand = String(brandName || "").trim().toUpperCase();
  const brandSubtitle = brandName && upperBrand !== brandName.trim() ? brandName : null;

  return (
    <div className="logo-result-page">
      <div className="logo-result-layout">
        {/* -------- LEFT SIDEBAR -------- */}
        <aside className="logo-result-side">
          <section className="logo-brand-card">
            <div className="logo-brand-pills">
              <div className="logo-brand-pill-stack">
                <span className="logo-brand-pill is-category">Branding &amp; Design</span>
                <span className="logo-brand-pill is-service">Logo Request</span>
              </div>
              <span className={`logo-brand-status ${resolvedStatus.cls}`}>
                <span className="dot" /> {resolvedStatus.text}
              </span>
            </div>
            <h2 className="logo-brand-name">{upperBrand || "Brand"}</h2>
            {brandSubtitle ? (
              <p className="logo-brand-subtitle">{brandSubtitle}</p>
            ) : null}
            {tagline ? (
              <>
                <hr className="logo-brand-divider" />
                <p className="logo-brand-tagline">&ldquo;{tagline}&rdquo;</p>
              </>
            ) : null}
          </section>

          {businessDescription ? (
            <SidebarCard label="Business">
              <p className="logo-result-side-text">{businessDescription}</p>
            </SidebarCard>
          ) : null}

          {styleLabel ? (
            <SidebarCard label="Logo Style">
              <span className="logo-style-pill">{styleLabel}</span>
            </SidebarCard>
          ) : null}

          {palette.length ? (
            <SidebarCard label="Color Palette">
              <div className="logo-palette-row">
                {palette.map((hex) => (
                  <div key={hex} className="logo-palette-item">
                    <span className="logo-palette-swatch" style={{ background: hex }} />
                    <span className="logo-palette-hex">{hex}</span>
                  </div>
                ))}
              </div>
            </SidebarCard>
          ) : null}

          {typoRows.length ? (
            <SidebarCard label="Typography">
              {typoRows.map((row) => (
                <p key={row.label} className="logo-typo-row">
                  <span className="logo-typo-label">{row.label}:</span>
                  <strong>{row.value}</strong>
                </p>
              ))}
            </SidebarCard>
          ) : null}
        </aside>

        {/* -------- RIGHT MAIN -------- */}
        <div className="logo-result-main">
          <header className="logo-concepts-header">
            <div>
              <h2 className="logo-concepts-title">Logo Concepts</h2>
              <p className="logo-concepts-sub">
                Select your favorite to refine it with your AOG strategist. You can download any
                concept at any time
              </p>
            </div>
            {onRegenerate ? (
              <button
                type="button"
                className="logo-regenerate-btn"
                onClick={onRegenerate}
              >
                Regenerate
              </button>
            ) : null}
          </header>

          {partial || (Array.isArray(errors) && errors.length) ? (
            <div className="logo-result-banner is-warn">
              <AlertTriangle size={14} />
              <span>
                {partial
                  ? `${usable.length} of ${requested} variants returned — the model may have rate-limited or filtered the rest.`
                  : "Some variants failed to generate."}
                {Array.isArray(errors) && errors.length ? ` (${errors[0]})` : null}
              </span>
            </div>
          ) : null}

          {downloadError ? (
            <div className="logo-result-banner is-error">
              <AlertTriangle size={14} />
              <span>{downloadError}</span>
            </div>
          ) : null}

          <div className="logo-concepts-grid">
            {usable.map((img, i) => (
              <ConceptCard
                key={img.url || i}
                img={img}
                index={i}
                selected={selectedConcept === i}
                broken={brokenIndices.has(i)}
                downloading={downloadingIndex === i}
                onSelect={setSelectedConcept}
                onPreview={(idx) => setPreviewIndex(idx)}
                onDownload={handleDownload}
                onError={markBroken}
              />
            ))}
          </div>

          <section className="logo-revision-card">
            <div>
              <h3>Ready to refine any Concept?</h3>
              <p>
                Your AOG strategist will review your selection and adjust the final concept.
              </p>
            </div>
            {revisionSent ? (
              <span className="logo-revision-sent">
                <Check size={14} /> Revision request received
              </span>
            ) : (
              <button
                type="button"
                className="logo-revision-btn"
                onClick={handleOpenRevision}
              >
                Request revision →
              </button>
            )}
          </section>

          {revisionOpen ? (
            <section className="logo-revision-form">
              <label htmlFor="logo-revision-notes">
                What should we change about <strong>Concept {selectedConcept + 1}</strong>?
              </label>
              <textarea
                id="logo-revision-notes"
                rows={4}
                placeholder="e.g. Keep concept 2 but use burgundy instead of red, and try a serif typeface."
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                disabled={revisionSubmitting}
              />
              {revisionError ? (
                <div className="logo-revision-form-error">
                  <AlertTriangle size={13} /> {revisionError}
                </div>
              ) : null}
              <div className="logo-revision-form-actions">
                <button
                  type="button"
                  className="logo-revision-form-cancel"
                  onClick={() => { setRevisionOpen(false); setRevisionError(""); }}
                  disabled={revisionSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="logo-revision-form-submit"
                  onClick={handleSubmitRevision}
                  disabled={revisionSubmitting || !revisionNotes.trim()}
                >
                  {revisionSubmitting ? "Sending..." : "Send to my strategist"}
                </button>
              </div>
            </section>
          ) : null}

          <section className="logo-meeting-card">
            <div>
              <h3>Still not seeing the right direction?</h3>
              <p>
                Book a quick meeting with an AOG strategist and we&apos;ll help you clarify the
                concept, style, and next revision.
              </p>
            </div>
            <a
              className="logo-meeting-btn"
              href={`mailto:info@artofgalaxy.com?subject=${encodeURIComponent(
                `Logo design meeting request: ${brandName || "my brand"}`
              )}&body=${encodeURIComponent(
                `Hi AOG team,\n\nI just generated logo concepts for "${brandName || "(unnamed brand)"}" and I'd love to book a quick meeting to discuss the next revision.\n\nThanks!`
              )}`}
            >
              Schedule a meeting →
            </a>
          </section>

          {prompt ? (
            <details className="logo-prompt-accordion">
              <summary>View prompt sent to the model</summary>
              <pre>{prompt}</pre>
            </details>
          ) : null}

          {model || seed != null ? (
            <p className="logo-result-meta">
              Generated with <strong>{model}</strong>
              {seed != null ? <> · seed {seed}</> : null}
            </p>
          ) : null}
        </div>
      </div>

      {/* -------- Full-size preview overlay --------
          Esc to close, ← / → to step between concepts (handled via the
          useEffect above). Click outside the frame also closes. */}
      {previewIndex >= 0 && usable[previewIndex] ? (
        <div
          className="logo-preview-overlay"
          onClick={() => setPreviewIndex(-1)}
        >
          <div className="logo-preview-counter">
            Concept {previewIndex + 1} of {usable.length}
          </div>

          {usable.length > 1 ? (
            <button
              type="button"
              className="logo-preview-nav is-prev"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewIndex((i) => (i - 1 + usable.length) % usable.length);
              }}
              aria-label="Previous concept"
            >
              <ChevronLeft size={22} />
            </button>
          ) : null}

          <button
            type="button"
            className="logo-preview-close"
            onClick={(e) => { e.stopPropagation(); setPreviewIndex(-1); }}
            aria-label="Close preview"
          >
            <X size={18} />
          </button>

          <div
            className="logo-preview-frame"
            onClick={(e) => e.stopPropagation()}
          >
            <SafeImage
              src={usable[previewIndex].url}
              alt={`Logo concept ${previewIndex + 1}`}
            />
          </div>

          {usable.length > 1 ? (
            <button
              type="button"
              className="logo-preview-nav is-next"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewIndex((i) => (i + 1) % usable.length);
              }}
              aria-label="Next concept"
            >
              <ChevronRight size={22} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

LogoDesignView.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      width: PropTypes.number,
      height: PropTypes.number,
    })
  ),
  prompt: PropTypes.string,
  brandName: PropTypes.string,
  model: PropTypes.string,
  seed: PropTypes.number,
  errors: PropTypes.arrayOf(PropTypes.string),
  requested: PropTypes.number,
  tagline: PropTypes.string,
  businessDescription: PropTypes.string,
  logoStyle: PropTypes.string,
  selectedColors: PropTypes.arrayOf(PropTypes.string),
  customColors: PropTypes.arrayOf(PropTypes.string),
  typography: PropTypes.arrayOf(PropTypes.string),
  status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  statusLabel: PropTypes.string,
  onRegenerate: PropTypes.func,
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

