import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";

// Method picker shown when the user opens Logo Design. Two paths:
// Strategist (conversational AI) or Quiz (self-guided 5-step form).
// This is the page mounted at /new-projects/branding-design/logo and
// the other branding services will gain the same picker as we redesign
// them.

const STRATEGIST_BULLETS = [
  "Natural back and forth conversation",
  "Clarifies details intelligently",
  "Fastest way to get started",
  "Your answers become a ready-to-use logo brief",
];

const QUIZ_BULLETS = [
  "Step by step with progress bar",
  "Visual selections, no guessing",
  "Full control over every choice",
  "Great if you already have some ideas",
];

export default function LogoDesign() {
  const navigate = useNavigate();

  return (
    <div className="portal-page method-picker-page">
      <button
        type="button"
        className="portal-back-link"
        onClick={() => navigate("/new-projects/branding-design")}
      >
        <ArrowLeft size={16} />
        Back to Branding &amp; Design <span className="method-picker-crumb">/ Logo Design</span>
      </button>

      <div className="method-picker-shell">
        <header className="method-picker-header">
          <h1>Choose how you want to request your logo</h1>
          <p>
            Two clear paths: a conversational AI agent for users who want guided support,
            or a step-by-step quiz for users who prefer to complete the information themselves.
          </p>
        </header>

        <div className="method-picker-grid">
          <MethodCard
            tone="strategist"
            pill={{ text: "Recommended" }}
            title="Work with our AI Strategist"
            subtitle="Just have a conversation. Our AI will ask you the right questions and build your logo brief automatically, no forms to fill."
            bullets={STRATEGIST_BULLETS}
            cta="Start Chatting"
            onClick={() => navigate("/new-projects/branding-design/logo/strategist")}
          />

          <MethodCard
            tone="quiz"
            pill={{ text: "Self-guided · 3 min" }}
            title="Fill it out yourself"
            subtitle="Answer 5 short questions at your own pace. No writing required, just pick what looks and feels right to you."
            bullets={QUIZ_BULLETS}
            cta="Begin the Quiz"
            onClick={() => navigate("/new-projects/branding-design/logo/quiz")}
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
