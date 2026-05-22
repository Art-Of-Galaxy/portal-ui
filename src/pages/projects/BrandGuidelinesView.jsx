import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Compass, MessageCircle, Palette } from "lucide-react";
import BrandingResultShell from "../../components/BrandingResultShell";

// Brand Guidelines output. Same fixed 4-phase / 4-deliverable structure
// as the Rebranding view so the page reads consistently. Descriptions
// fall back to a sensible template when the AI doesn't fill them in.

const FIXED_PHASES = [
  { name: "Discovery & Strategy",       duration: "1-2 weeks", fallback: "Brand interviews, audience sharpening, competitor mapping, positioning lock-in." },
  { name: "Visual System Design",       duration: "2-3 weeks", fallback: "Type system, color system, logo direction, imagery direction. 2 directions → 1 final." },
  { name: "Documentation",              duration: "1-2 weeks", fallback: "Brand manual: usage rules, do's & don'ts, voice + tone guides, templates." },
  { name: "Handoff & Enablement",       duration: "1 week",    fallback: "Asset library handover, team walk-through, ongoing-use guardrails." },
];

const FIXED_DELIVERABLES = [
  { name: "Brand Manual",           fallback: "Logo usage, color, typography, imagery, voice." },
  { name: "Visual Identity Pack",   fallback: "Logo files, color tokens, type system, mood/imagery." },
  { name: "Voice & Tone Playbook",  fallback: "Voice principles, tone flex, do/don't say, sample copy." },
  { name: "Templates & Components", fallback: "Social, presentation, email + 1 sample marketing layout." },
];

function clip(text, max = 220) {
  const s = String(text || "").trim();
  if (!s) return "";
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function describeColors(color_system) {
  const all = []
    .concat(Array.isArray(color_system?.primary) ? color_system.primary : [])
    .concat(Array.isArray(color_system?.secondary) ? color_system.secondary : [])
    .slice(0, 3);
  if (!all.length) return "";
  return all.map((c) => `${c.name || c.hex}`).join(" · ");
}

export default function BrandGuidelinesView({
  guidelines,
  brandName,
  description,
  tagline,
  statusLabel,
}) {
  const navigate = useNavigate();
  if (!guidelines || typeof guidelines !== "object") {
    return (
      <div className="portal-card">
        <p className="portal-card-copy">No output to display yet.</p>
      </div>
    );
  }

  const verbal = guidelines.verbal_identity || {};
  const visual = guidelines.visual_identity || {};
  const colorSys = guidelines.color_system || {};
  const aiDeliv = Array.isArray(guidelines.deliverables) ? guidelines.deliverables : [];
  const nextSteps = Array.isArray(guidelines.next_steps) ? guidelines.next_steps : [];

  const sideDescription = description || guidelines.brand_summary || "";
  const sideTagline = tagline || guidelines.positioning_statement || "";

  const verbalCard = verbal.voice
    ? verbal.voice
    : (Array.isArray(verbal.tagline_options) && verbal.tagline_options[0]) || "";
  const visualCard = visual.logo_direction
    ? visual.logo_direction
    : (Array.isArray(visual.mood_keywords) && visual.mood_keywords.join(", ")) || "";
  const colorCard = describeColors(colorSys) || colorSys.rationale || "";

  // Brand Guidelines doesn't carry its own rollout plan — use the fixed
  // template directly. (Visual / verbal identity content powers the
  // glance cards above instead.)
  const phases = FIXED_PHASES.map((tpl) => ({ ...tpl, description: tpl.fallback }));

  const deliverables = FIXED_DELIVERABLES.map((tpl, i) => {
    const ai = aiDeliv[i];
    const detail = ai && typeof ai === "object" ? (ai.scope || ai.item) :
                   (typeof ai === "string" ? ai : null);
    return { ...tpl, description: detail || tpl.fallback };
  });

  return (
    <BrandingResultShell
      brandName={brandName}
      description={sideDescription}
      tagline={sideTagline}
      subServiceLabel="Brand Guidelines Dev"
      status={statusLabel || "In progress"}
    >
      <section>
        <h3 className="bg-out-section-title">Brand direction at a glance</h3>
        <div className="bg-out-glance">
          <div className="bg-out-glance-card">
            <span className="bg-out-glance-icon"><Compass size={16} /></span>
            <span className="bg-out-glance-label">Positioning</span>
            <p className="bg-out-glance-body">{clip(guidelines.positioning_statement || guidelines.brand_summary)}</p>
          </div>
          <div className="bg-out-glance-card">
            <span className="bg-out-glance-icon"><MessageCircle size={16} /></span>
            <span className="bg-out-glance-label">Voice &amp; Tone</span>
            <p className="bg-out-glance-body">{clip(verbalCard)}</p>
          </div>
          <div className="bg-out-glance-card">
            <span className="bg-out-glance-icon"><Palette size={16} /></span>
            <span className="bg-out-glance-label">Visual Direction</span>
            <p className="bg-out-glance-body">
              {clip(visualCard)}
              {colorCard ? <><br /><small style={{ color: "var(--portal-text-muted)" }}>{colorCard}</small></> : null}
            </p>
          </div>
        </div>
      </section>

      <div className="bg-out-twocol">
        <section>
          <h3 className="bg-out-section-title">Delivery Timeline</h3>
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
            Here&apos;s exactly what we need to kick off this week.
          </p>
          <ol className="bg-out-engagement-list">
            {(nextSteps.length ? nextSteps : [
              "Review and sign off on this plan — confirm scope, timeline, and budget with your AOG strategist.",
              "Share existing brand assets (logo, fonts, colors) and any prior style guides we should evolve from.",
              "Send 3-5 brands you admire so we have concrete reference points for the visual direction.",
              "Schedule a 60-min discovery call with your team's decision-maker so we can lock voice and tone.",
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

BrandGuidelinesView.propTypes = {
  guidelines: PropTypes.object,
  brandName: PropTypes.string,
  description: PropTypes.string,
  tagline: PropTypes.string,
  statusLabel: PropTypes.string,
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onAnotherRequest: PropTypes.func,
};

BrandGuidelinesView.defaultProps = {
  guidelines: null,
  brandName: "",
  description: "",
  tagline: "",
  statusLabel: "",
  projectId: null,
  onAnotherRequest: undefined,
};
