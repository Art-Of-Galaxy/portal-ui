import { useState } from "react";
import PropTypes from "prop-types";
import {
  AlertTriangle,
  CalendarCheck,
  Check,
  Layout,
  MessageSquare,
  Palette,
  Pencil,
} from "lucide-react";
import { apiServices } from "../../services/apiServices";

// Printing Design result page. Confirms brief receipt, summarizes the
// project at a glance, lays out the production timeline and deliverables,
// and routes the user toward the next step (schedule call or message
// designer). All copy is Claude-personalized from the intake.

const PILLAR_ICON = {
  format: Layout,
  content: Pencil,
  visual: Palette,
};

function pillarIcon(idx) {
  const keys = ["format", "content", "visual"];
  return PILLAR_ICON[keys[idx]] || Layout;
}

export default function PrintingDesignView({
  brief,
  brandName = "",
  description = "",
  statusLabel = "",
  projectId = null,
  errors,
}) {
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [revisionSent, setRevisionSent] = useState(false);
  const [revisionSubmitting, setRevisionSubmitting] = useState(false);
  const [revisionError, setRevisionError] = useState("");

  if (!brief || typeof brief !== "object") {
    return (
      <div className="portal-card">
        <p className="portal-card-copy">No output to display yet.</p>
      </div>
    );
  }

  const pillars = Array.isArray(brief.pillars) ? brief.pillars.slice(0, 3) : [];
  const timeline = Array.isArray(brief.timeline) ? brief.timeline : [];
  const deliverables = Array.isArray(brief.deliverables) ? brief.deliverables : [];
  const nextSteps = Array.isArray(brief.next_steps) ? brief.next_steps : [];
  const toneChips = Array.isArray(brief.tone_chips) ? brief.tone_chips : [];

  const resolvedStatus = (statusLabel || "In Progress").toLowerCase();
  const statusCls = resolvedStatus.includes("progress")
    ? "is-progress"
    : resolvedStatus.includes("done")
      ? "is-done"
      : "is-pending";

  async function handleSubmitRevision() {
    if (revisionSubmitting) return;
    const notes = revisionNotes.trim();
    if (!notes) { setRevisionError("Please share what should change."); return; }
    setRevisionSubmitting(true);
    setRevisionError("");
    try {
      const res = await apiServices.create_revision({
        project_id: projectId || null,
        service_type: "printing_design",
        concept_index: 0,
        notes,
      });
      if (!res?.success) throw new Error(res?.message || "Could not submit message.");
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
    <div className="pd-result-page">
      <div className="pd-result-layout">
        {/* SIDEBAR */}
        <aside className="pd-result-side">
          <div className="pd-tag-row">
            <span className="pd-tag is-category">Branding &amp; Design</span>
            <span className="pd-tag is-service">Printing Design</span>
          </div>
          <div className="pd-status-row">
            <span className={`pd-status-dot ${statusCls}`} />
            <span className="pd-status-txt">{statusLabel || "In Progress"}</span>
          </div>
          <h1 className="pd-brand-name">{brandName || "Brand"}</h1>
          {description ? <p className="pd-brand-desc">{description}</p> : null}

          <div className="pd-spec-divider" />

          <div className="pd-spec-block">
            {brief.format_label ? (
              <div className="pd-spec-row">
                <span className="pd-spec-label">Format</span>
                <span className="pd-spec-val">{brief.format_label}</span>
              </div>
            ) : null}
            {brief.size_label ? (
              <div className="pd-spec-row">
                <span className="pd-spec-label">Size</span>
                <span className="pd-spec-val">{brief.size_label}</span>
              </div>
            ) : null}
            {brief.fold_label ? (
              <div className="pd-spec-row">
                <span className="pd-spec-label">Fold</span>
                <span className="pd-spec-val">{brief.fold_label}</span>
              </div>
            ) : null}
            {brief.audience_label ? (
              <div className="pd-spec-row">
                <span className="pd-spec-label">Audience</span>
                <span className="pd-spec-val">{brief.audience_label}</span>
              </div>
            ) : null}
            {brief.content_status_label ? (
              <div className="pd-spec-row">
                <span className="pd-spec-label">Content</span>
                <span className="pd-spec-val">{brief.content_status_label}</span>
              </div>
            ) : null}
          </div>

          {toneChips.length ? (
            <>
              <div className="pd-spec-divider" />
              <div>
                <div className="pd-spec-label" style={{ marginBottom: 8 }}>Visual tone</div>
                <div className="pd-tone-row">
                  {toneChips.map((t) => (
                    <span key={t} className="pd-tone-chip">{t}</span>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </aside>

        {/* MAIN */}
        <div className="pd-result-main">
          {Array.isArray(errors) && errors.length ? (
            <div className="pd-banner is-warn">
              <AlertTriangle size={14} />
              <span>{errors[0]}</span>
            </div>
          ) : null}

          {/* Received banner */}
          <div className="pd-received-banner">
            <span className="pd-received-icon">✉️</span>
            <div>
              <div className="pd-received-title">Printing design brief received</div>
              <p className="pd-received-sub">
                Our design team has your brief and will reach out within 1 business day to confirm the layout direction and kick off production.
              </p>
            </div>
          </div>

          {/* Print summary */}
          {brief.print_summary ? (
            <div>
              <h2 className="pd-section-title">Project summary</h2>
              <p className="pd-summary">{brief.print_summary}</p>
            </div>
          ) : null}

          {/* Pillars */}
          {pillars.length ? (
            <div>
              <h2 className="pd-section-title">Your print project at a glance</h2>
              <div className="pd-pillars">
                {pillars.map((p, i) => {
                  const Icon = pillarIcon(i);
                  return (
                    <div key={i} className="pd-pillar">
                      <span className="pd-pillar-icon-wrap">
                        <Icon size={18} />
                      </span>
                      <div className="pd-pillar-label">{p.label}</div>
                      {p.highlight ? <div className="pd-pillar-highlight">{p.highlight}</div> : null}
                      <p className="pd-pillar-text">{p.blurb}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Timeline + Deliverables */}
          <div className="pd-td-grid">
            {timeline.length ? (
              <div>
                <h2 className="pd-section-title">Production timeline</h2>
                <ol className="pd-timeline">
                  {timeline.map((t, i) => (
                    <li key={i} className="pd-tl-item">
                      <span className="pd-tl-num">{i + 1}</span>
                      <div className="pd-tl-body">
                        <div className="pd-tl-header">
                          <span className="pd-tl-phase">{t.phase}</span>
                          {t.duration ? <span className="pd-tl-weeks">{t.duration}</span> : null}
                        </div>
                        <p className="pd-tl-desc">{t.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {deliverables.length ? (
              <div>
                <h2 className="pd-section-title">What you&apos;ll receive</h2>
                <ul className="pd-deliverables-list">
                  {deliverables.map((d, i) => (
                    <li key={i} className="pd-del-item">
                      <div className="pd-del-name">{d.name}</div>
                      <div className="pd-del-desc">{d.description}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* CTA block */}
          <div className="pd-cta-block">
            <div>
              <p className="pd-cta-intro">
                <strong>Here&apos;s what happens next:</strong>{" "}
                Our designer will reach out to confirm the layout direction before the first draft begins.
              </p>
              {nextSteps.length ? (
                <div className="pd-cta-steps">
                  {nextSteps.map((step, i) => (
                    <div key={i} className="pd-cta-step">
                      <span className="pd-cta-step-num">{i + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="pd-cta-buttons">
              <a
                className="pd-btn-primary"
                href={`mailto:info@artofgalaxy.com?subject=${encodeURIComponent(
                  `Printing design call: ${brandName || "my print project"}`
                )}&body=${encodeURIComponent(
                  `Hi AOG team,\n\nI just submitted my Printing Design brief for "${brandName || "(unnamed project)"}" and I'd love to schedule the kickoff call.\n\nThanks!`
                )}`}
              >
                <CalendarCheck size={14} /> Schedule design call
              </a>
              {revisionSent ? (
                <span className="pd-msg-sent">
                  <Check size={14} /> Message received
                </span>
              ) : (
                <button
                  type="button"
                  className="pd-btn-dark"
                  onClick={() => { setRevisionOpen(true); setRevisionError(""); }}
                >
                  <MessageSquare size={14} /> Message your designer
                </button>
              )}
            </div>
          </div>

          {revisionOpen ? (
            <section className="pd-msg-form">
              <label htmlFor="pd-msg-notes">What would you like to share with your designer?</label>
              <textarea
                id="pd-msg-notes"
                rows={4}
                placeholder="e.g. The product launch date moved up two weeks, we need this to hit print by Aug 14."
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                disabled={revisionSubmitting}
              />
              {revisionError ? (
                <div className="pd-msg-form-error">
                  <AlertTriangle size={13} /> {revisionError}
                </div>
              ) : null}
              <div className="pd-msg-form-actions">
                <button
                  type="button"
                  className="pd-msg-form-cancel"
                  onClick={() => { setRevisionOpen(false); setRevisionError(""); }}
                  disabled={revisionSubmitting}
                >Cancel</button>
                <button
                  type="button"
                  className="pd-msg-form-submit"
                  onClick={handleSubmitRevision}
                  disabled={revisionSubmitting || !revisionNotes.trim()}
                >
                  {revisionSubmitting ? "Sending..." : "Send to my designer"}
                </button>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

PrintingDesignView.propTypes = {
  brief: PropTypes.object,
  brandName: PropTypes.string,
  description: PropTypes.string,
  statusLabel: PropTypes.string,
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  errors: PropTypes.arrayOf(PropTypes.string),
};
