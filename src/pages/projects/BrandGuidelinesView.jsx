import PropTypes from "prop-types";
import {
  Sparkles,
  Compass,
  MessageCircle,
  Eye,
  Type,
  Palette,
  PackageCheck,
  ListChecks,
} from "lucide-react";

function pickFontStack(classification) {
  const c = String(classification || "").toLowerCase();
  if (c.includes("serif") && !c.includes("sans")) return "Georgia, 'Times New Roman', serif";
  if (c.includes("sans")) return "Inter, 'Helvetica Neue', Arial, sans-serif";
  if (c.includes("script")) return "'Brush Script MT', cursive";
  if (c.includes("modern")) return "Arial Black, sans-serif";
  if (c.includes("display")) return "Georgia, serif";
  if (c.includes("condensed")) return "'Arial Narrow', Impact, sans-serif";
  return "Inter, sans-serif";
}

function isLight(hex) {
  if (!hex || typeof hex !== "string") return false;
  const m = hex.replace("#", "");
  if (m.length !== 6) return false;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  // standard luminance approximation
  const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return l > 0.7;
}

function ColorChip({ swatch }) {
  if (!swatch) return null;
  const hex = (swatch.hex || "").toUpperCase();
  const textColor = isLight(hex) ? "#0f1c2e" : "#fff";
  return (
    <div className="bg-view-color" style={{ background: hex || "#888", color: textColor }}>
      <strong>{swatch.name || hex}</strong>
      <code style={{ color: textColor, opacity: 0.85 }}>{hex}</code>
      {swatch.usage ? <span>{swatch.usage}</span> : null}
    </div>
  );
}

ColorChip.propTypes = {
  swatch: PropTypes.shape({
    name: PropTypes.string,
    hex: PropTypes.string,
    usage: PropTypes.string,
  }),
};

ColorChip.defaultProps = { swatch: null };

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

export default function BrandGuidelinesView({ guidelines, brandName, model, usage }) {
  if (!guidelines || typeof guidelines !== "object") {
    return (
      <div className="portal-card">
        <p className="portal-card-copy">No output to display yet.</p>
      </div>
    );
  }

  const verbal = guidelines.verbal_identity || {};
  const visual = guidelines.visual_identity || {};
  const typography = guidelines.typography || {};
  const colors = guidelines.color_system || {};

  return (
    <div className="bg-view">
      <div className="bg-view-hero">
        <div className="bg-view-hero-tag">Brand brief</div>
        <h2>{brandName || "Brand Guidelines"}</h2>
        {guidelines.brand_summary ? <p>{guidelines.brand_summary}</p> : null}
        {guidelines.positioning_statement ? (
          <blockquote className="bg-view-quote">
            <Compass size={14} />
            <span>{guidelines.positioning_statement}</span>
          </blockquote>
        ) : null}
      </div>

      {/* Verbal Identity */}
      <Section icon={MessageCircle} title="Verbal identity">
        <div className="bg-view-grid-2">
          {verbal.voice ? (
            <div className="bg-view-card">
              <h4>Voice</h4>
              <p>{verbal.voice}</p>
            </div>
          ) : null}
          {verbal.tone ? (
            <div className="bg-view-card">
              <h4>Tone</h4>
              <p>{verbal.tone}</p>
            </div>
          ) : null}
        </div>

        <div className="bg-view-grid-2">
          {Array.isArray(verbal.do_say) && verbal.do_say.length ? (
            <div className="bg-view-card">
              <h4>Do say</h4>
              <ul className="bg-view-bullets bg-view-do">
                {verbal.do_say.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {Array.isArray(verbal.dont_say) && verbal.dont_say.length ? (
            <div className="bg-view-card">
              <h4>Don&apos;t say</h4>
              <ul className="bg-view-bullets bg-view-dont">
                {verbal.dont_say.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {Array.isArray(verbal.tagline_options) && verbal.tagline_options.length ? (
          <div className="bg-view-card">
            <h4>Tagline options</h4>
            <ol className="bg-view-numbers">
              {verbal.tagline_options.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        ) : null}
      </Section>

      {/* Visual Identity */}
      <Section icon={Eye} title="Visual identity">
        <div className="bg-view-grid-2">
          {visual.logo_direction ? (
            <div className="bg-view-card">
              <h4>Logo direction</h4>
              <p>{visual.logo_direction}</p>
            </div>
          ) : null}
          {visual.imagery_direction ? (
            <div className="bg-view-card">
              <h4>Imagery direction</h4>
              <p>{visual.imagery_direction}</p>
            </div>
          ) : null}
        </div>

        <div className="bg-view-grid-2">
          {Array.isArray(visual.design_principles) && visual.design_principles.length ? (
            <div className="bg-view-card">
              <h4>Design principles</h4>
              <ul className="bg-view-bullets">
                {visual.design_principles.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {Array.isArray(visual.mood_keywords) && visual.mood_keywords.length ? (
            <div className="bg-view-card">
              <h4>Mood</h4>
              <div className="bg-view-tags">
                {visual.mood_keywords.map((k, i) => (
                  <span key={i} className="bg-view-tag">{k}</span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Section>

      {/* Typography */}
      {(typography.display || typography.body) ? (
        <Section icon={Type} title="Typography">
          <div className="bg-view-grid-2">
            {typography.display ? (
              <div className="bg-view-card">
                <span className="bg-view-eyebrow">Display</span>
                <h4 style={{ fontFamily: pickFontStack(typography.display.classification), fontSize: 26, margin: "0.3rem 0 0.4rem" }}>
                  {typography.display.family || "—"}
                </h4>
                <p>
                  <strong>{typography.display.classification || "—"}</strong>
                  {typography.display.usage ? ` · ${typography.display.usage}` : ""}
                </p>
              </div>
            ) : null}
            {typography.body ? (
              <div className="bg-view-card">
                <span className="bg-view-eyebrow">Body</span>
                <h4 style={{ fontFamily: pickFontStack(typography.body.classification), fontSize: 22, margin: "0.3rem 0 0.4rem" }}>
                  {typography.body.family || "—"}
                </h4>
                <p>
                  <strong>{typography.body.classification || "—"}</strong>
                  {typography.body.usage ? ` · ${typography.body.usage}` : ""}
                </p>
              </div>
            ) : null}
          </div>
          {typography.rationale ? (
            <div className="bg-view-rationale">
              <strong>Why this pair: </strong>
              {typography.rationale}
            </div>
          ) : null}
        </Section>
      ) : null}

      {/* Colors */}
      {(colors.primary || colors.secondary || colors.neutrals) ? (
        <Section icon={Palette} title="Color system">
          {Array.isArray(colors.primary) && colors.primary.length ? (
            <>
              <h4 className="bg-view-subhead">Primary</h4>
              <div className="bg-view-color-row">
                {colors.primary.map((s, i) => <ColorChip key={`p${i}`} swatch={s} />)}
              </div>
            </>
          ) : null}
          {Array.isArray(colors.secondary) && colors.secondary.length ? (
            <>
              <h4 className="bg-view-subhead">Secondary</h4>
              <div className="bg-view-color-row">
                {colors.secondary.map((s, i) => <ColorChip key={`s${i}`} swatch={s} />)}
              </div>
            </>
          ) : null}
          {Array.isArray(colors.neutrals) && colors.neutrals.length ? (
            <>
              <h4 className="bg-view-subhead">Neutrals</h4>
              <div className="bg-view-color-row">
                {colors.neutrals.map((s, i) => <ColorChip key={`n${i}`} swatch={s} />)}
              </div>
            </>
          ) : null}
          {colors.rationale ? (
            <div className="bg-view-rationale">
              <strong>Why this palette: </strong>
              {colors.rationale}
            </div>
          ) : null}
        </Section>
      ) : null}

      {/* Deliverables */}
      {Array.isArray(guidelines.deliverables) && guidelines.deliverables.length ? (
        <Section icon={PackageCheck} title="Deliverables — what you'll receive">
          <ul className="bg-view-deliverables">
            {guidelines.deliverables.map((d, i) => (
              <li key={i}>
                <span className="bg-view-check"><Sparkles size={12} /></span>
                {d}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Next steps */}
      {Array.isArray(guidelines.next_steps) && guidelines.next_steps.length ? (
        <Section icon={ListChecks} title="Next steps — what happens next">
          <ol className="bg-view-numbers bg-view-next">
            {guidelines.next_steps.map((s, i) => (
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

BrandGuidelinesView.propTypes = {
  guidelines: PropTypes.object,
  brandName: PropTypes.string,
  model: PropTypes.string,
  usage: PropTypes.object,
};

BrandGuidelinesView.defaultProps = {
  guidelines: null,
  brandName: "",
  model: "",
  usage: null,
};
