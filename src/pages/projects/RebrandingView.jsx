import PropTypes from "prop-types";
import {
  RefreshCw,
  Compass,
  AlertTriangle,
  Heart,
  Eye,
  MessageSquare,
  CalendarRange,
  PackageCheck,
  ShieldAlert,
  ListChecks,
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

export default function RebrandingView({ rebranding, brandName, model, usage }) {
  if (!rebranding || typeof rebranding !== "object") {
    return (
      <div className="portal-card">
        <p className="portal-card-copy">No output to display yet.</p>
      </div>
    );
  }

  const cur = rebranding.current_state_assessment || {};
  const pos = rebranding.new_positioning || {};
  const ess = rebranding.brand_essence || {};
  const vis = rebranding.visual_direction || {};
  const pillars = Array.isArray(rebranding.messaging_pillars) ? rebranding.messaging_pillars : [];
  const phases = Array.isArray(rebranding.rollout_plan) ? rebranding.rollout_plan : [];
  const deliverables = Array.isArray(rebranding.deliverables) ? rebranding.deliverables : [];
  const risks = Array.isArray(rebranding.risks) ? rebranding.risks : [];
  const nextSteps = Array.isArray(rebranding.next_steps) ? rebranding.next_steps : [];

  return (
    <div className="bg-view">
      <div className="bg-view-hero">
        <div className="bg-view-hero-tag">Rebranding plan</div>
        <h2>{brandName || "Rebranding Plan"}</h2>
        {rebranding.executive_summary ? <p>{rebranding.executive_summary}</p> : null}
        {pos.positioning_statement ? (
          <blockquote className="bg-view-quote">
            <Compass size={14} />
            <span>{pos.positioning_statement}</span>
          </blockquote>
        ) : null}
      </div>

      {/* Current state */}
      {(cur.headline || cur.whats_not_working || cur.risks_of_no_action) ? (
        <Section icon={AlertTriangle} title="Where the brand is today">
          {cur.headline ? (
            <div className="bg-view-card" style={{ marginBottom: "0.9rem" }}>
              <p style={{ fontStyle: "italic" }}>{cur.headline}</p>
            </div>
          ) : null}
          <div className="bg-view-grid-2">
            {Array.isArray(cur.whats_not_working) && cur.whats_not_working.length ? (
              <div className="bg-view-card">
                <h4>What&apos;s not working</h4>
                <ul className="bg-view-bullets bg-view-dont">
                  {cur.whats_not_working.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            ) : null}
            {Array.isArray(cur.risks_of_no_action) && cur.risks_of_no_action.length ? (
              <div className="bg-view-card">
                <h4>Risks of no action</h4>
                <ul className="bg-view-bullets">
                  {cur.risks_of_no_action.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      {/* New positioning */}
      {(pos.what_changes || pos.audience_focus) ? (
        <Section icon={RefreshCw} title="The repositioning">
          <div className="bg-view-grid-2">
            {pos.what_changes ? (
              <div className="bg-view-card">
                <h4>What changes</h4>
                <p>{pos.what_changes}</p>
              </div>
            ) : null}
            {pos.audience_focus ? (
              <div className="bg-view-card">
                <h4>Audience focus</h4>
                <p>{pos.audience_focus}</p>
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      {/* Brand essence */}
      {(ess.values?.length || ess.perception_goals?.length || ess.voice_direction) ? (
        <Section icon={Heart} title="New brand essence">
          <div className="bg-view-grid-2">
            {Array.isArray(ess.values) && ess.values.length ? (
              <div className="bg-view-card">
                <h4>Values</h4>
                <div className="bg-view-tags">
                  {ess.values.map((v, i) => <span key={i} className="bg-view-tag">{v}</span>)}
                </div>
              </div>
            ) : null}
            {Array.isArray(ess.perception_goals) && ess.perception_goals.length ? (
              <div className="bg-view-card">
                <h4>How it should be perceived</h4>
                <ul className="bg-view-bullets bg-view-do">
                  {ess.perception_goals.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
          {ess.voice_direction ? (
            <div className="bg-view-card">
              <h4>Voice direction</h4>
              <p>{ess.voice_direction}</p>
            </div>
          ) : null}
        </Section>
      ) : null}

      {/* Visual direction */}
      {(vis.logo || vis.typography || vis.color || vis.imagery) ? (
        <Section icon={Eye} title="Visual direction">
          <div className="bg-view-grid-2">
            {vis.logo ? (
              <div className="bg-view-card">
                <h4>Logo</h4>
                <p>{vis.logo}</p>
              </div>
            ) : null}
            {vis.typography ? (
              <div className="bg-view-card">
                <h4>Typography</h4>
                <p>{vis.typography}</p>
              </div>
            ) : null}
            {vis.color ? (
              <div className="bg-view-card">
                <h4>Color</h4>
                <p>{vis.color}</p>
              </div>
            ) : null}
            {vis.imagery ? (
              <div className="bg-view-card">
                <h4>Imagery</h4>
                <p>{vis.imagery}</p>
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      {/* Messaging pillars */}
      {pillars.length ? (
        <Section icon={MessageSquare} title="Messaging pillars">
          <div className="bg-view-grid-2">
            {pillars.map((p, i) => (
              <div key={i} className="bg-view-card">
                <h4>{p.pillar}</h4>
                <p>{p.description}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Rollout plan */}
      {phases.length ? (
        <Section icon={CalendarRange} title="Rollout plan">
          <div className="rb-phases">
            {phases.map((p, i) => (
              <div key={i} className="rb-phase">
                <div className="rb-phase-bullet">{i + 1}</div>
                <div className="rb-phase-body">
                  <div className="rb-phase-head">
                    <strong>{p.phase}</strong>
                    {p.duration ? <span>{p.duration}</span> : null}
                  </div>
                  <p>{p.activities}</p>
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

      {/* Risks */}
      {risks.length ? (
        <Section icon={ShieldAlert} title="Risks &amp; change-management considerations">
          <ul className="bg-view-bullets">
            {risks.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </Section>
      ) : null}

      {/* Next steps */}
      {nextSteps.length ? (
        <Section icon={ListChecks} title="Next steps — what happens next">
          <ol className="bg-view-numbers bg-view-next">
            {nextSteps.map((s, i) => <li key={i}>{s}</li>)}
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

RebrandingView.propTypes = {
  rebranding: PropTypes.object,
  brandName: PropTypes.string,
  model: PropTypes.string,
  usage: PropTypes.object,
};

RebrandingView.defaultProps = {
  rebranding: null,
  brandName: "",
  model: "",
  usage: null,
};
