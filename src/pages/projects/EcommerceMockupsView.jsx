import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Lightbulb, Eye, Layers } from "lucide-react";
import BrandingResultShell from "../../components/BrandingResultShell";

// E-Commerce Mockups output. Same fixed 4-phase / 4-deliverable layout
// as the other branding services so the page is consistent. Descriptions
// fall back to a sensible template when the AI doesn't fill them in.

const FIXED_PHASES = [
  { name: "Discovery & Planning",     duration: "1 week",    fallback: "Product audit, audience clarity, platform requirements, shot list lock-in." },
  { name: "Photography & Setup",      duration: "1-2 weeks", fallback: "Set design, lighting plan, props sourcing, hero shots + variant captures." },
  { name: "Post-production & Edits",  duration: "1-2 weeks", fallback: "Color, retouching, background swap-outs, platform-spec exports." },
  { name: "Delivery & Launch Assets", duration: "1 week",    fallback: "Final masters, platform-ready crops, A/B variant pack, copy + alt text." },
];

const FIXED_DELIVERABLES = [
  { name: "Master Image Pack",        fallback: "Full-res hero shots + variants, organised by platform." },
  { name: "Platform-Ready Crops",     fallback: "Amazon, Shopify, Etsy and TikTok specs at the right pixel size." },
  { name: "A/B Variant Set",          fallback: "Background swaps, prop variations, hero copy alts for testing." },
  { name: "Launch Kit & Guidelines",  fallback: "Listing copy hints, alt text, usage rules, file-naming map." },
];

function clip(text, max = 220) {
  const s = String(text || "").trim();
  if (!s) return "";
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

export default function EcommerceMockupsView({
  mockups,
  productName,
  description,
  tagline,
  statusLabel,
}) {
  const navigate = useNavigate();
  if (!mockups || typeof mockups !== "object") {
    return (
      <div className="portal-card">
        <p className="portal-card-copy">No output to display yet.</p>
      </div>
    );
  }

  const concept = mockups.creative_concept || {};
  const visual = mockups.visual_direction || {};
  const platforms = Array.isArray(mockups.per_platform_specs) ? mockups.per_platform_specs : [];
  const aiChecklist = Array.isArray(mockups.production_checklist) ? mockups.production_checklist : [];
  const aiDeliv = Array.isArray(mockups.deliverables) ? mockups.deliverables : [];
  const nextSteps = Array.isArray(mockups.next_steps) ? mockups.next_steps : [];

  const sideDescription = description || mockups.executive_summary || "";
  const sideTagline = tagline || concept.headline || "";

  const ideaCard = concept.big_idea || concept.audience_hook || mockups.executive_summary || "";
  const visualCard = visual.background || visual.lighting || visual.color_palette || "";
  const platformsCard = platforms.length
    ? `Optimised for ${platforms.map((p) => p.platform).slice(0, 4).join(", ")}.`
    : "";

  const phases = FIXED_PHASES.map((tpl, i) => ({
    ...tpl,
    description: aiChecklist[i]?.detail || tpl.fallback,
  }));

  const deliverables = FIXED_DELIVERABLES.map((tpl, i) => {
    const ai = aiDeliv[i];
    const detail = ai && typeof ai === "object" ? (ai.scope || ai.item) :
                   (typeof ai === "string" ? ai : null);
    return { ...tpl, description: detail || tpl.fallback };
  });

  return (
    <BrandingResultShell
      brandName={productName}
      description={sideDescription}
      tagline={sideTagline}
      subServiceLabel="E-Commerce Mockups"
      status={statusLabel || "In progress"}
    >
      <section>
        <h3 className="bg-out-section-title">Creative direction at a glance</h3>
        <div className="bg-out-glance">
          <div className="bg-out-glance-card">
            <span className="bg-out-glance-icon"><Lightbulb size={16} /></span>
            <span className="bg-out-glance-label">The Idea</span>
            <p className="bg-out-glance-body">{clip(ideaCard)}</p>
          </div>
          <div className="bg-out-glance-card">
            <span className="bg-out-glance-icon"><Eye size={16} /></span>
            <span className="bg-out-glance-label">Visual Direction</span>
            <p className="bg-out-glance-body">{clip(visualCard)}</p>
          </div>
          <div className="bg-out-glance-card">
            <span className="bg-out-glance-icon"><Layers size={16} /></span>
            <span className="bg-out-glance-label">Platforms</span>
            <p className="bg-out-glance-body">{clip(platformsCard)}</p>
          </div>
        </div>
      </section>

      <div className="bg-out-twocol">
        <section>
          <h3 className="bg-out-section-title">Production Timeline</h3>
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
            Here&apos;s exactly what we need to start production this week.
          </p>
          <ol className="bg-out-engagement-list">
            {(nextSteps.length ? nextSteps : [
              "Send all SKU images you already have (front, back, lifestyle) plus your packaging.",
              "Confirm the platforms you'll be selling on so we lock the exact crop ratios.",
              "Share 3-5 reference listings you love — competitors or aspirational brands.",
              "Tell us about claims/compliance copy you need on the image (kosher, organic, etc).",
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

EcommerceMockupsView.propTypes = {
  mockups: PropTypes.object,
  productName: PropTypes.string,
  description: PropTypes.string,
  tagline: PropTypes.string,
  statusLabel: PropTypes.string,
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onAnotherRequest: PropTypes.func,
};

EcommerceMockupsView.defaultProps = {
  mockups: null,
  productName: "",
  description: "",
  tagline: "",
  statusLabel: "",
  projectId: null,
  onAnotherRequest: undefined,
};
