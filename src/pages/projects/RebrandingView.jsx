import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { MapPin, Target, Zap } from "lucide-react";
import BrandingResultShell from "../../components/BrandingResultShell";

// Rebranding output. The 4 timeline phases and 4 deliverable categories
// are FIXED so the page always reads the same; the descriptions inside
// each are pulled from the AI's response (which is itself shaped by the
// user's brief), with sensible fallbacks if a field is missing.

const FIXED_PHASES = [
  { name: "Discovery & Strategy",       duration: "2-3 weeks", fallback: "Brand interviews, competitive analysis, audience sharpening, positioning lock-in." },
  { name: "Identity Design",            duration: "4-5 weeks", fallback: "Wordmark, type system, color system, visual language. 2 directions → 1 final → brand manual." },
  { name: "Asset Rollout",              duration: "3-4 weeks", fallback: "Social templates, profile assets, key marketing materials, product/packaging hits." },
  { name: "Launch & Change Management", duration: "2 weeks",   fallback: "Teaser campaign, founder narrative, internal rollout. Monitor early reception, tune the system." },
];

const FIXED_DELIVERABLES = [
  { name: "Brand Manual",            fallback: "Logo usage, color, typography, imagery, voice." },
  { name: "Logo Redesign Package",   fallback: "Primary, secondary, monogram, vector + raster." },
  { name: "Social Media Asset Kit",  fallback: "Templates for IG, TikTok & X, Figma/Canva ready." },
  { name: "Brand Strategy Summary",  fallback: "Positioning, audience, pillars, voice, 1 doc." },
];

function clip(text, max = 220) {
  const s = String(text || "").trim();
  if (!s) return "";
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

export default function RebrandingView({
  rebranding,
  brandName,
  description,
  tagline,
  statusLabel,
}) {
  const navigate = useNavigate();
  if (!rebranding || typeof rebranding !== "object") {
    return (
      <div className="portal-card">
        <p className="portal-card-copy">No output to display yet.</p>
      </div>
    );
  }

  const current = rebranding.current_state_assessment || {};
  const positioning = rebranding.new_positioning || {};
  const aiRollout = Array.isArray(rebranding.rollout_plan) ? rebranding.rollout_plan : [];
  const aiDeliv = Array.isArray(rebranding.deliverables) ? rebranding.deliverables : [];
  const nextSteps = Array.isArray(rebranding.next_steps) ? rebranding.next_steps : [];

  const sideDescription = description || rebranding.executive_summary || "";
  const sideTagline = tagline || positioning.positioning_statement || "";

  // 3-glance cards
  const whereYouAre =
    current.headline ||
    (Array.isArray(current.whats_not_working) && current.whats_not_working[0]) ||
    "Snapshot of the current brand position.";
  const whereTaking = positioning.what_changes || positioning.audience_focus || "";
  const howWeGet = "4-phase rollout: strategy lock-in → identity design → asset rollout → launch and change management.";

  // Merge AI activities over the fixed phase labels.
  const phases = FIXED_PHASES.map((tpl, i) => ({
    ...tpl,
    description: aiRollout[i]?.activities || tpl.fallback,
    duration: aiRollout[i]?.duration || tpl.duration,
  }));

  // Same idea for deliverables.
  const deliverables = FIXED_DELIVERABLES.map((tpl, i) => {
    const ai = aiDeliv[i];
    const detail = ai && typeof ai === "object" ? ai.scope : (typeof ai === "string" ? ai : null);
    return { ...tpl, description: detail || tpl.fallback };
  });

  return (
    <BrandingResultShell
      brandName={brandName}
      description={sideDescription}
      tagline={sideTagline}
      subServiceLabel="Rebranding Services"
      status={statusLabel || "In progress"}
    >
      <section>
        <h3 className="bg-out-section-title">Brand direction at a glance</h3>
        <div className="bg-out-glance">
          <div className="bg-out-glance-card">
            <span className="bg-out-glance-icon"><MapPin size={16} /></span>
            <span className="bg-out-glance-label">Where You Are</span>
            <p className="bg-out-glance-body">{clip(whereYouAre)}</p>
          </div>
          <div className="bg-out-glance-card">
            <span className="bg-out-glance-icon"><Target size={16} /></span>
            <span className="bg-out-glance-label">Where We&apos;re Taking You</span>
            <p className="bg-out-glance-body">{clip(whereTaking)}</p>
          </div>
          <div className="bg-out-glance-card">
            <span className="bg-out-glance-icon"><Zap size={16} /></span>
            <span className="bg-out-glance-label">How We Get There</span>
            <p className="bg-out-glance-body">{clip(howWeGet)}</p>
          </div>
        </div>
      </section>

      <div className="bg-out-twocol">
        <section>
          <h3 className="bg-out-section-title">Rollout Timeline</h3>
          <ol className="bg-out-timeline">
            {phases.map((step, i) => (
              <li key={i} className="bg-out-timeline-step">
                <span className="bg-out-timeline-num">{i + 1}</span>
                <div className="bg-out-timeline-content">
                  <div className="bg-out-timeline-head">
                    <span className="bg-out-timeline-name">{step.name}</span>
                    <span className="bg-out-timeline-duration">{step.duration}</span>
                  </div>
                  <p className="bg-out-timeline-detail">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h3 className="bg-out-section-title">What You&apos;ll Receive</h3>
          <div className="bg-out-deliverables">
            {deliverables.map((d, i) => (
              <div key={i} className="bg-out-deliverable-item">
                <span className="bg-out-deliverable-name">{d.name}:</span>
                <p className="bg-out-deliverable-detail">{d.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-out-engagement">
        <div>
          <p className="bg-out-engagement-text">
            <strong>Let&apos;s lock in your engagement:</strong>{" "}
            Here&apos;s exactly what we need to kick off Phase 1 this week.
          </p>
          <ol className="bg-out-engagement-list">
            {(nextSteps.length ? nextSteps : [
              "Review and sign off on this plan — confirm scope, timeline, and budget with your AOG strategist.",
              "Schedule a 90-min discovery workshop to validate positioning and audience assumptions together.",
              "Send us access to existing brand assets, any analytics you have, and 3-5 competitor references you respect.",
              "Build the cultural reference board — we'll share a Notion template. Takes you ~20 min, saves weeks of iteration.",
            ]).slice(0, 4).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
        <div className="bg-out-engagement-actions">
          <button
            type="button"
            className="bg-out-cta-primary"
            onClick={() => navigate("/support")}
          >
            Schedule discovery call
          </button>
          <button
            type="button"
            className="bg-out-cta-secondary"
            onClick={() => navigate("/support")}
          >
            Message your strategist
          </button>
        </div>
      </section>
    </BrandingResultShell>
  );
}

RebrandingView.propTypes = {
  rebranding: PropTypes.object,
  brandName: PropTypes.string,
  description: PropTypes.string,
  tagline: PropTypes.string,
  statusLabel: PropTypes.string,
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onAnotherRequest: PropTypes.func,
};

RebrandingView.defaultProps = {
  rebranding: null,
  brandName: "",
  description: "",
  tagline: "",
  statusLabel: "",
  projectId: null,
  onAnotherRequest: undefined,
};
