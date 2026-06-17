import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  AlertTriangle,
  CalendarCheck,
  Check,
  Download,
  Eye,
  ImageOff,
  Loader2,
  X,
} from "lucide-react";
import SafeImage from "../../components/ui/SafeImage";
import { apiServices } from "../../services/apiServices";

// E-Commerce Mockups output. Sidebar identity card with platforms +
// product + target customer + style chips, main column with a claims
// pill strip and a 6-card mockup grid. Each card has Preview (lightbox)
// and Download (presigned). "Download all" loops through every mockup.

const PLATFORM_CLASS = {
  amazon: "is-amazon",
  shopify: "is-shopify",
  etsy: "is-etsy",
  woocommerce: "is-wc",
  both: "is-both",
  multi: "is-both",
};

function platformClass(platform) {
  const key = String(platform || "").toLowerCase();
  return PLATFORM_CLASS[key] || "is-both";
}

function safeFilename(brand, slug, ext = "png") {
  const safe = String(brand || "ecom")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "ecom";
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

function MockupCard({ mockup, index, onPreview, onDownload, downloading, broken, onBrokenImage }) {
  const cls = platformClass(mockup.platform);
  const hasImg = Boolean(mockup.url) && !broken;
  return (
    <article className="em-mockup-card">
      <div className="em-mockup-preview" onClick={() => hasImg && onPreview(index)}>
        {mockup.platform ? (
          <span className={`em-plat-badge ${cls}`}>{mockup.platform}</span>
        ) : null}
        {hasImg ? (
          <SafeImage src={mockup.url} alt={mockup.label || `Mockup ${index + 1}`} onError={() => onBrokenImage(index)} />
        ) : (
          <div className="em-mockup-empty">
            <ImageOff size={26} />
            <span>{mockup.url ? "Image unavailable" : "No image generated"}</span>
          </div>
        )}
        {mockup.description ? (
          <span className="em-mockup-num">{mockup.description}</span>
        ) : null}
      </div>
      <div className="em-mockup-footer">
        <span className="em-mockup-name">{mockup.label || `Mockup ${index + 1}`}</span>
        <div className="em-mockup-actions">
          <button
            type="button"
            className="em-icon-btn"
            title="View full size"
            disabled={!hasImg}
            onClick={(e) => { e.stopPropagation(); onPreview(index); }}
          >
            <Eye size={14} />
          </button>
          <button
            type="button"
            className="em-icon-btn"
            title="Download"
            disabled={!hasImg || downloading}
            onClick={(e) => { e.stopPropagation(); onDownload(mockup, index); }}
          >
            {downloading ? <Loader2 size={14} className="bg-spin" /> : <Download size={14} />}
          </button>
        </div>
      </div>
    </article>
  );
}

MockupCard.propTypes = {
  mockup: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onPreview: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  downloading: PropTypes.bool,
  broken: PropTypes.bool,
  onBrokenImage: PropTypes.func.isRequired,
};

export default function EcommerceMockupsView({
  mockups,
  productName = "",
  brandName = "",
  description = "",
  statusLabel = "",
  projectId = null,
  prompt = "",
  imageModel = "",
  errors,
}) {
  const [previewIndex, setPreviewIndex] = useState(-1);
  const [downloadingIndex, setDownloadingIndex] = useState(-1);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [brokenIndices, setBrokenIndices] = useState(() => new Set());
  const [actionError, setActionError] = useState("");
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [revisionSent, setRevisionSent] = useState(false);
  const [revisionSubmitting, setRevisionSubmitting] = useState(false);
  const [revisionError, setRevisionError] = useState("");
  const [promptOpen, setPromptOpen] = useState(false);

  const list = useMemo(
    () => (Array.isArray(mockups?.mockups) ? mockups.mockups : []),
    [mockups]
  );

  // Keyboard nav for the lightbox.
  useEffect(() => {
    if (previewIndex < 0) return undefined;
    const usable = list.filter((m) => m?.url);
    if (!usable.length) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setPreviewIndex(-1);
      else if (event.key === "ArrowRight") setPreviewIndex((i) => (i + 1) % usable.length);
      else if (event.key === "ArrowLeft") setPreviewIndex((i) => (i - 1 + usable.length) % usable.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewIndex, list]);

  if (!mockups || typeof mockups !== "object") {
    return (
      <div className="portal-card">
        <p className="portal-card-copy">No mockups to display yet.</p>
      </div>
    );
  }

  const claims = Array.isArray(mockups.claims_strip) ? mockups.claims_strip : [];
  const visualStyles = Array.isArray(mockups.visual_style_labels) ? mockups.visual_style_labels : [];
  const typeLabels = Array.isArray(mockups.mockup_type_labels) ? mockups.mockup_type_labels : [];
  const platforms = Array.isArray(mockups.platform_specs) ? mockups.platform_specs : [];

  const displayName = productName || brandName || "Product";
  const subtitle = mockups.product_label || description || "";
  const customer = mockups.target_customer_label || "";

  const resolvedStatus = (statusLabel || "Done").toLowerCase();
  const statusCls = resolvedStatus.includes("progress") ? "is-progress" : "is-done";

  const markBroken = (idx) => setBrokenIndices((prev) => {
    if (prev.has(idx)) return prev;
    const next = new Set(prev); next.add(idx); return next;
  });

  async function handleDownload(mockup, index) {
    setActionError("");
    setDownloadingIndex(index);
    try {
      const filename = safeFilename(displayName, mockup.id || `mockup-${index + 1}`);
      await downloadViaPresign(mockup.url, filename);
    } catch (err) {
      setActionError(err?.message || "Download failed.");
    } finally {
      setDownloadingIndex(-1);
    }
  }

  async function handleDownloadAll() {
    if (downloadingAll) return;
    setActionError("");
    setDownloadingAll(true);
    try {
      for (let i = 0; i < list.length; i += 1) {
        const m = list[i];
        if (!m?.url) continue;
        const filename = safeFilename(displayName, m.id || `mockup-${i + 1}`);
        await downloadViaPresign(m.url, filename);
      }
    } catch (err) {
      setActionError(err?.message || "Could not finish the download.");
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
        service_type: "ecommerce_mockups",
        concept_index: Math.max(previewIndex, 0),
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

  const previewMockup = previewIndex >= 0 ? list[previewIndex] : null;

  return (
    <div className="em-result-page">
      <div className="em-result-layout">
        {/* SIDEBAR */}
        <aside className="em-result-side">
          <div className="em-identity-card">
            <div className="em-identity-status">
              <span className={`em-identity-dot ${statusCls}`} />
              <span className="em-identity-status-txt">E-Commerce Mockups · {statusLabel || "Done"}</span>
            </div>
            <h2 className="em-identity-name">{displayName}</h2>
            {subtitle ? <p className="em-identity-sub">{subtitle}</p> : null}
          </div>

          {platforms.length ? (
            <section className="em-side-card">
              <span className="em-side-label">Platforms</span>
              <div className="em-platform-row">
                {platforms.map((p) => (
                  <span key={p.platform} className={`em-plat-badge ${platformClass(p.platform)}`}>
                    {p.platform}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {customer ? (
            <section className="em-side-card">
              <span className="em-side-label">Target customer</span>
              <p className="em-side-body">{customer}</p>
            </section>
          ) : null}

          {visualStyles.length ? (
            <section className="em-side-card">
              <span className="em-side-label">Visual style</span>
              <div className="em-chip-row">
                {visualStyles.map((s) => <span key={s} className="em-chip is-sel">{s}</span>)}
              </div>
            </section>
          ) : null}

          {typeLabels.length ? (
            <section className="em-side-card">
              <span className="em-side-label">Mockup types</span>
              <div className="em-chip-row">
                {typeLabels.map((s) => <span key={s} className="em-chip is-sel">{s}</span>)}
              </div>
            </section>
          ) : null}

          {mockups.production_notes || imageModel ? (
            <div className="em-model-card">
              ⚙️ <span>{mockups.production_notes || `Generated with ${imageModel}`}</span>
            </div>
          ) : null}
        </aside>

        {/* MAIN */}
        <div className="em-result-main">
          {Array.isArray(errors) && errors.length ? (
            <div className="em-banner is-warn">
              <AlertTriangle size={14} />
              <span>{errors[0]}</span>
            </div>
          ) : null}

          {actionError ? (
            <div className="em-banner is-warn">
              <AlertTriangle size={14} />
              <span>{actionError}</span>
            </div>
          ) : null}

          <div className="em-main-topbar">
            <div>
              <h2 className="em-main-title">E-Commerce Mockups · Ready</h2>
              <p className="em-main-sub">All images are export-ready at platform spec. View full size or download any asset.</p>
            </div>
            <button
              type="button"
              className="em-btn-dl-all"
              onClick={handleDownloadAll}
              disabled={downloadingAll || !list.length}
            >
              {downloadingAll ? <Loader2 size={14} className="bg-spin" /> : <Download size={14} />}
              {downloadingAll ? "Downloading..." : "Download all"}
            </button>
          </div>

          {claims.length ? (
            <div className="em-claims-strip">
              {claims.map((c) => <span key={c} className="em-claim-pill">{c}</span>)}
            </div>
          ) : null}

          <div className="em-mockup-grid">
            {list.map((m, i) => (
              <MockupCard
                key={m.id || i}
                mockup={m}
                index={i}
                onPreview={(idx) => setPreviewIndex(idx)}
                onDownload={handleDownload}
                downloading={downloadingIndex === i}
                broken={brokenIndices.has(i)}
                onBrokenImage={markBroken}
              />
            ))}
          </div>

          {/* Revision CTA */}
          <section className="em-cta-banner">
            <div>
              <div className="em-cta-title">Need adjustments to any mockup?</div>
              <p className="em-cta-sub">Your AOG strategist will review your selection and update the final assets.</p>
            </div>
            {revisionSent ? (
              <span className="em-revision-sent">
                <Check size={14} /> Revision request received
              </span>
            ) : (
              <button
                type="button"
                className="em-revision-btn"
                onClick={() => { setRevisionOpen(true); setRevisionError(""); }}
              >
                Request revision →
              </button>
            )}
          </section>

          {revisionOpen ? (
            <section className="em-revision-form">
              <label htmlFor="em-revision-notes">What should we change?</label>
              <textarea
                id="em-revision-notes"
                rows={4}
                placeholder="e.g. The hero on white needs the product centered slightly higher."
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                disabled={revisionSubmitting}
              />
              {revisionError ? (
                <div className="em-revision-form-error">
                  <AlertTriangle size={13} /> {revisionError}
                </div>
              ) : null}
              <div className="em-revision-form-actions">
                <button
                  type="button"
                  className="em-revision-form-cancel"
                  onClick={() => { setRevisionOpen(false); setRevisionError(""); }}
                  disabled={revisionSubmitting}
                >Cancel</button>
                <button
                  type="button"
                  className="em-revision-form-submit"
                  onClick={handleSubmitRevision}
                  disabled={revisionSubmitting || !revisionNotes.trim()}
                >
                  {revisionSubmitting ? "Sending..." : "Send to my strategist"}
                </button>
              </div>
            </section>
          ) : null}

          <section className="em-cta-secondary">
            <div>
              <div className="em-cta-sec-title">Not seeing the right direction?</div>
              <p className="em-cta-sec-sub">Book a quick call and we&apos;ll walk through the mockup set together.</p>
            </div>
            <a
              className="em-schedule-btn"
              href={`mailto:info@artofgalaxy.com?subject=${encodeURIComponent(
                `E-Commerce Mockups meeting: ${displayName}`
              )}&body=${encodeURIComponent(
                `Hi AOG team,\n\nI just generated mockups for "${displayName}" and I'd love to book a quick call to walk through them.\n\nThanks!`
              )}`}
            >
              <CalendarCheck size={14} /> Schedule a meeting →
            </a>
          </section>

          {prompt || mockups.executive_summary ? (
            <details
              className="em-prompt-toggle"
              open={promptOpen}
              onToggle={(e) => setPromptOpen(e.target.open)}
            >
              <summary>
                <span>♣ View brief sent to the model</span>
              </summary>
              <pre className="em-prompt-body">{prompt || mockups.executive_summary}</pre>
            </details>
          ) : null}
        </div>
      </div>

      {/* Lightbox */}
      {previewMockup ? (
        <div className="em-lightbox" onClick={() => setPreviewIndex(-1)}>
          <button
            type="button"
            className="em-lightbox-close"
            onClick={(e) => { e.stopPropagation(); setPreviewIndex(-1); }}
            aria-label="Close preview"
          ><X size={18} /></button>
          <div className="em-lightbox-counter">
            {previewMockup.label || `Mockup ${previewIndex + 1}`} · {previewIndex + 1} of {list.length}
          </div>
          <div className="em-lightbox-frame" onClick={(e) => e.stopPropagation()}>
            {previewMockup.url
              ? <SafeImage src={previewMockup.url} alt={previewMockup.label} />
              : <div className="em-mockup-empty"><ImageOff size={32} /><span>Image unavailable</span></div>}
          </div>
        </div>
      ) : null}
    </div>
  );
}

EcommerceMockupsView.propTypes = {
  mockups: PropTypes.object,
  productName: PropTypes.string,
  brandName: PropTypes.string,
  description: PropTypes.string,
  statusLabel: PropTypes.string,
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  prompt: PropTypes.string,
  imageModel: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
};
