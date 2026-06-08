import { useState } from "react";
import PropTypes from "prop-types";
import { AlertTriangle, Check, Download, RefreshCw } from "lucide-react";
import { apiServices } from "../../services/apiServices";

// Result view for a freshly generated UGC ad video. Mirrors the
// LogoDesignView layout: brand-style sidebar on the left, video panel
// on the right, revision + meeting CTAs below.

const MODE_LABELS = {
  ugc: "Casual UGC",
  product_review: "Review / Testimonial",
  ugc_unboxing: "Unboxing",
  ugc_how_to: "Tutorial / How-To",
  ugc_virtual_try_on: "Try-On",
  product_showcase: "Polished Showcase",
};

function isUsableUrl(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}

async function downloadViaPresign(url, filename) {
  try {
    const res = await apiServices.presigned_download({ url, filename });
    triggerDownload(res?.presigned_url || url, filename);
  } catch {
    window.open(url, "_blank", "noopener");
  }
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

export default function UGCAdsView({
  video,
  prompt,
  productName,
  productDescription,
  mode,
  aspectRatio,
  duration,
  resolution,
  projectId,
  onAnother,
  statusLabel,
}) {
  const usable = video && isUsableUrl(video.url);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [revisionSubmitting, setRevisionSubmitting] = useState(false);
  const [revisionSent, setRevisionSent] = useState(false);
  const [revisionError, setRevisionError] = useState("");

  if (!usable) {
    return (
      <div className="portal-card">
        <p className="portal-card-copy">
          The video did not render. Try again with a slightly different brief.
        </p>
      </div>
    );
  }

  const handleDownload = async () => {
    setDownloadError("");
    setDownloading(true);
    try {
      const safe = String(productName || "ugc-ad")
        .replace(/[^a-z0-9-]+/gi, "-")
        .toLowerCase();
      await downloadViaPresign(video.url, `${safe}.mp4`);
    } catch (err) {
      setDownloadError(err?.message || "Download failed. Right-click the video to save.");
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenRevision = () => {
    setRevisionOpen(true);
    setRevisionSent(false);
    setRevisionError("");
  };

  const handleSubmitRevision = async () => {
    if (revisionSubmitting) return;
    const notes = revisionNotes.trim();
    if (!notes) {
      setRevisionError("Tell us what to change about the video.");
      return;
    }
    setRevisionSubmitting(true);
    setRevisionError("");
    try {
      const res = await apiServices.create_revision({
        project_id: projectId || null,
        service_type: "ugc_ads",
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
  };

  return (
    <div className="logo-result-page">
      <div className="logo-result-layout">
        <aside className="logo-result-side">
          <section className="logo-brand-card">
            <div className="logo-brand-pills">
              <div className="logo-brand-pill-stack">
                <span className="logo-brand-pill is-category">AI Video Production</span>
                <span className="logo-brand-pill is-service">UGC Ads Video</span>
              </div>
              <span className="logo-brand-status is-done">
                <span className="dot" /> {statusLabel || "Done"}
              </span>
            </div>
            <h2 className="logo-brand-name">{String(productName || "Your product").toUpperCase()}</h2>
            {productDescription ? (
              <p className="logo-brand-subtitle">{productDescription}</p>
            ) : null}
          </section>

          <section className="logo-result-side-card">
            <span className="logo-result-side-card-label">Format</span>
            <div className="logo-typo-row">
              <span className="logo-typo-label">Style:</span>
              <strong>{MODE_LABELS[mode] || mode}</strong>
            </div>
            <div className="logo-typo-row">
              <span className="logo-typo-label">Aspect:</span>
              <strong>{aspectRatio}</strong>
            </div>
            <div className="logo-typo-row">
              <span className="logo-typo-label">Duration:</span>
              <strong>{duration}s</strong>
            </div>
            <div className="logo-typo-row">
              <span className="logo-typo-label">Resolution:</span>
              <strong>{resolution}</strong>
            </div>
          </section>
        </aside>

        <div className="logo-result-main">
          <header className="logo-concepts-header">
            <div>
              <h2 className="logo-concepts-title">Your ad video</h2>
              <p className="logo-concepts-sub">
                Preview the take below, download it, or send revision notes to your strategist.
              </p>
            </div>
            {onAnother ? (
              <button
                type="button"
                className="logo-regenerate-btn"
                onClick={onAnother}
              >
                <RefreshCw size={14} /> Generate another
              </button>
            ) : null}
          </header>

          {downloadError ? (
            <div className="logo-result-banner is-error">
              <AlertTriangle size={14} />
              <span>{downloadError}</span>
            </div>
          ) : null}

          {/* Video player. We pick aspect-ratio defensively so a
              vertical 9:16 ad doesn't blow up the layout. */}
          <div
            className="ugc-video-frame"
            style={{
              maxWidth: aspectRatio === "9:16" ? 360
                : aspectRatio === "1:1" ? 520
                : 720,
            }}
          >
            <video
              src={video.url}
              controls
              playsInline
              preload="metadata"
              style={{ width: "100%", display: "block", borderRadius: 12 }}
            />
          </div>

          <div className="ugc-video-actions">
            <button
              type="button"
              className="ugc-video-download"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download size={14} /> {downloading ? "Preparing..." : "Download MP4"}
            </button>
          </div>

          <section className="logo-revision-card">
            <div>
              <h3>Need a different angle?</h3>
              <p>
                Your AOG strategist will tweak the script, presenter, or look and run another take.
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
              <label htmlFor="ugc-revision-notes">
                What should we change?
              </label>
              <textarea
                id="ugc-revision-notes"
                rows={4}
                placeholder="e.g. Keep the format but use a male presenter, switch to a kitchen setting, and emphasise the zero-sugar claim earlier."
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
              <h3>Want a totally different concept?</h3>
              <p>
                Book a quick meeting with an AOG strategist to brainstorm the next round before
                running another render.
              </p>
            </div>
            <a
              className="logo-meeting-btn"
              href={`mailto:info@artofgalaxy.com?subject=${encodeURIComponent(
                `UGC ad meeting request: ${productName || "my product"}`
              )}&body=${encodeURIComponent(
                `Hi AOG team,\n\nI just generated a UGC ad video for "${productName || "(my product)"}" and would love to discuss the next round.\n\nThanks!`
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
        </div>
      </div>
    </div>
  );
}

UGCAdsView.propTypes = {
  video: PropTypes.shape({
    url: PropTypes.string,
    content_type: PropTypes.string,
  }),
  prompt: PropTypes.string,
  productName: PropTypes.string,
  productDescription: PropTypes.string,
  mode: PropTypes.string,
  aspectRatio: PropTypes.string,
  duration: PropTypes.number,
  resolution: PropTypes.string,
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onAnother: PropTypes.func,
  statusLabel: PropTypes.string,
};
