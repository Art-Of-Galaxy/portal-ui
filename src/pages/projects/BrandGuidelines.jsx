import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";

// Method picker for the Brand Guidelines Development service. Mirrors the
// Logo Design picker: two paths (conversational AI Strategist, or a self
// guided 6 step quiz). Uses the standard portal accent (purple) and brand
// green tokens, not the teal from the source mockup.

const STRATEGIST_BULLETS = [
  "Natural conversation, guided by AI",
  "Covers strategy, voice, and visuals",
  "Asks the right follow-ups",
  "Fastest path to a complete brief",
];

const QUIZ_BULLETS = [
  "Step by step with progress bar",
  "Visual selectors, minimal typing",
  "Full control at every step",
  "Great if you already have some ideas",
];

export default function BrandGuidelines() {
  const navigate = useNavigate();

  return (
    <div className="portal-page method-picker-page">
      <button
        type="button"
        className="portal-back-link"
        onClick={() => navigate("/new-projects/branding-design")}
      >
        <ArrowLeft size={16} />
        Back to Branding &amp; Design <span className="method-picker-crumb">/ Brand Guidelines</span>
      </button>

      <div className="method-picker-shell">
        <header className="method-picker-header">
          <h1>Let&apos;s build your brand from the ground up</h1>
          <p>
            We&apos;ll capture your vision, voice, and visual direction. Pick whichever path feels
            more natural to you.
          </p>
        </header>

        <div className="method-picker-grid">
          <MethodCard
            tone="strategist"
            pill={{ text: "Recommended" }}
            title="Work with our AI Strategist"
            subtitle="Just have a conversation. Our strategist will ask the right questions and put together your complete brand brief, no forms, no overwhelm."
            bullets={STRATEGIST_BULLETS}
            cta="Start Chatting"
            onClick={() => navigate("/new-projects/branding-design/brand-guidelines/strategist")}
          />

          <MethodCard
            tone="quiz"
            pill={{ text: "Self-guided · 5 min" }}
            title="Fill it out yourself"
            subtitle="Answer 6 focused questions at your own pace. We've stripped out everything non-essential, just the choices that actually shape your brand."
            bullets={QUIZ_BULLETS}
            cta="Begin the Quiz"
            onClick={() => navigate("/new-projects/branding-design/brand-guidelines/quiz")}
          />
        </div>
      </div>
    </div>
  );
}

function MethodCard({ tone, pill, title, subtitle, bullets, cta, onClick }) {
  return (
    <button type="button" className={`method-card is-${tone}`} onClick={onClick}>
      <span className={`method-card-pill is-${tone}`}>{pill.text}</span>
      <h2 className="method-card-title">{title}</h2>
      <p className="method-card-subtitle">{subtitle}</p>
      <ul className="method-card-bullets">
        {bullets.map((b) => (
          <li key={b}>
            <Check size={13} />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <span className={`method-card-cta is-${tone}`}>{cta}</span>
    </button>
  );
}

MethodCard.propTypes = {
  tone: PropTypes.oneOf(["strategist", "quiz"]).isRequired,
  pill: PropTypes.shape({ text: PropTypes.string.isRequired }).isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  bullets: PropTypes.arrayOf(PropTypes.string).isRequired,
  cta: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
