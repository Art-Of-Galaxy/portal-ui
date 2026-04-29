import PropTypes from "prop-types";
import {
  Sparkles,
  Layers,
  Eye,
  Camera,
  Tag,
  ListChecks,
  PackageCheck,
  ArrowRight,
} from "lucide-react";

function Section({ icon: Icon, title, children }) {
  return (
    <section className="bg-view-section">
      <header className="bg-view-section-head">
        <span className="bg-view-section-icon">
          <Icon size={16} />
        </span>
        <h3>{title}</h3>
      </header>
      {children}
    </section>
  );
}

Section.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default function EcommerceMockupsView({ mockups, productName, model, usage }) {
  if (!mockups || typeof mockups !== "object") {
    return (
      <div className="portal-card">
        <p className="portal-card-copy">No output to display yet.</p>
      </div>
    );
  }

  const concept = mockups.creative_concept || {};
  const platforms = Array.isArray(mockups.per_platform_specs) ? mockups.per_platform_specs : [];
  const visual = mockups.visual_direction || {};
  const shots = Array.isArray(mockups.shot_list) ? mockups.shot_list : [];
  const callouts = Array.isArray(mockups.feature_callouts) ? mockups.feature_callouts : [];
  const checklist = Array.isArray(mockups.production_checklist) ? mockups.production_checklist : [];
  const deliverables = Array.isArray(mockups.deliverables) ? mockups.deliverables : [];
  const nextSteps = Array.isArray(mockups.next_steps) ? mockups.next_steps : [];

  return (
    <div className="bg-view">
      <div className="bg-view-hero">
        <div className="bg-view-hero-tag">E-Commerce Mockups brief</div>
        <h2>{productName || "E-Commerce Mockups"}</h2>
        {mockups.executive_summary ? <p>{mockups.executive_summary}</p> : null}
        {concept.headline ? (
          <blockquote className="bg-view-quote">
            <Sparkles size={14} />
            <span>{concept.headline}</span>
          </blockquote>
        ) : null}
      </div>

      {/* Creative concept */}
      {(concept.big_idea || concept.audience_hook) ? (
        <Section icon={Sparkles} title="Creative concept">
          <div className="bg-view-grid-2">
            {concept.big_idea ? (
              <div className="bg-view-card">
                <h4>The big idea</h4>
                <p>{concept.big_idea}</p>
              </div>
            ) : null}
            {concept.audience_hook ? (
              <div className="bg-view-card">
                <h4>Audience hook</h4>
                <p>{concept.audience_hook}</p>
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      {/* Per-platform specs */}
      {platforms.length ? (
        <Section icon={Layers} title="Per-platform specs">
          <div className="bg-view-grid-2">
            {platforms.map((p, i) => (
              <div key={i} className="bg-view-card">
                <h4>{p.platform}</h4>
                {p.image_specs ? (
                  <p style={{ marginBottom: 6 }}>
                    <strong>Image specs:</strong> {p.image_specs}
                  </p>
                ) : null}
                {p.main_image_rules ? (
                  <p style={{ marginBottom: 6 }}>
                    <strong>Main image rules:</strong> {p.main_image_rules}
                  </p>
                ) : null}
                {Array.isArray(p.recommended_variants) && p.recommended_variants.length ? (
                  <>
                    <p style={{ margin: "0 0 4px" }}>
                      <strong>Recommended variants:</strong>
                    </p>
                    <ul className="bg-view-bullets">
                      {p.recommended_variants.map((v, j) => (
                        <li key={j}>{v}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Visual direction */}
      {(visual.background ||
        visual.lighting ||
        visual.color_palette ||
        visual.props_and_styling ||
        visual.typography_overlay) ? (
        <Section icon={Eye} title="Visual direction">
          <div className="bg-view-grid-2">
            {visual.background ? (
              <div className="bg-view-card">
                <h4>Background</h4>
                <p>{visual.background}</p>
              </div>
            ) : null}
            {visual.lighting ? (
              <div className="bg-view-card">
                <h4>Lighting</h4>
                <p>{visual.lighting}</p>
              </div>
            ) : null}
            {visual.color_palette ? (
              <div className="bg-view-card">
                <h4>Color palette</h4>
                <p>{visual.color_palette}</p>
              </div>
            ) : null}
            {visual.props_and_styling ? (
              <div className="bg-view-card">
                <h4>Props &amp; styling</h4>
                <p>{visual.props_and_styling}</p>
              </div>
            ) : null}
            {visual.typography_overlay ? (
              <div className="bg-view-card">
                <h4>Typography overlay</h4>
                <p>{visual.typography_overlay}</p>
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      {/* Shot list */}
      {shots.length ? (
        <Section icon={Camera} title="Shot list">
          <div className="bg-view-grid-2">
            {shots.map((s, i) => (
              <div key={i} className="bg-view-card">
                <h4>{s.shot}</h4>
                {s.purpose ? (
                  <p style={{ marginBottom: 6 }}>
                    <strong>Purpose:</strong> {s.purpose}
                  </p>
                ) : null}
                {s.composition ? (
                  <p style={{ marginBottom: 6 }}>
                    <strong>Composition:</strong> {s.composition}
                  </p>
                ) : null}
                {Array.isArray(s.platforms) && s.platforms.length ? (
                  <div className="bg-view-tags">
                    {s.platforms.map((p, j) => (
                      <span key={j} className="bg-view-tag">{p}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Feature callouts */}
      {callouts.length ? (
        <Section icon={Tag} title="Feature callouts">
          <div className="bg-view-grid-2">
            {callouts.map((c, i) => (
              <div key={i} className="bg-view-card">
                <h4>{c.label}</h4>
                {c.supporting_detail ? <p>{c.supporting_detail}</p> : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Production checklist */}
      {checklist.length ? (
        <Section icon={ListChecks} title="Production checklist">
          <div className="rb-phases">
            {checklist.map((step, i) => (
              <div key={i} className="rb-phase">
                <div className="rb-phase-bullet">{i + 1}</div>
                <div className="rb-phase-body">
                  <div className="rb-phase-head">
                    <strong>{step.step}</strong>
                  </div>
                  {step.detail ? <p>{step.detail}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Deliverables */}
      {deliverables.length ? (
        <Section icon={PackageCheck} title="Deliverables — what you'll receive">
          <div className="bg-view-grid-2">
            {deliverables.map((d, i) => (
              <div key={i} className="bg-view-card">
                <h4>{d.item}</h4>
                <p>{d.scope}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Next steps */}
      {nextSteps.length ? (
        <Section icon={ArrowRight} title="Next steps — what happens next">
          <ol className="bg-view-numbers bg-view-next">
            {nextSteps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </Section>
      ) : null}

      {model || usage ? (
        <p className="bg-view-meta">
          Generated with <strong>{model}</strong>
          {usage ? (
            <>
              {" "}· input {usage.input_tokens} tok · output {usage.output_tokens} tok
              {usage.cache_read_input_tokens
                ? ` · cache read ${usage.cache_read_input_tokens}`
                : ""}
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

EcommerceMockupsView.propTypes = {
  mockups: PropTypes.object,
  productName: PropTypes.string,
  model: PropTypes.string,
  usage: PropTypes.object,
};

EcommerceMockupsView.defaultProps = {
  mockups: null,
  productName: "",
  model: "",
  usage: null,
};
