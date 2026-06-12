import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";

// Method picker for the Packaging Design service. Mirrors the Logo
// Design / Brand Guidelines / Printing pickers: two paths (AI Specialist
// chat, self guided 5 step spec form). Portal accent (purple) tokens.

const STRATEGIST_BULLETS = [
  "Works for Box, Label, Shrink and Bags",
  "Handles complex multi-SKU requests",
  "Captures dimensions, finish, and eco specs",
  "Fastest path to production start",
];

const QUIZ_BULLETS = [
  "Visual package type selector",
  "Box, Label, Shrink or Bags",
  "Step by step, 5 clear steps",
  "Progress bar so you know how close you are",
];

export default function PackagingDesign() {
  const navigate = useNavigate();

  return (
    <div className="portal-page method-picker-page">
      <button
        type="button"
        className="portal-back-link"
        onClick={() => navigate("/new-projects/branding-design")}
      >
        <ArrowLeft size={16} />
        Back to Branding &amp; Design <span className="method-picker-crumb">/ Packaging Design</span>
      </button>

      <div className="method-picker-shell">
        <header className="method-picker-header">
          <h1>How would you like to get started?</h1>
          <p>
            We&apos;ll gather everything we need to design packaging that stands out on shelves
            and screens. Pick the path that feels right.
          </p>
        </header>

        <div className="method-picker-grid">
          <MethodCard
            tone="strategist"
            pill={{ text: "Recommended" }}
            title="Work with our AI Specialist"
            subtitle="Just describe what you need. Our packaging AI will ask the right questions, capture your specs, and build the brief, no forms required."
            bullets={STRATEGIST_BULLETS}
            cta="Start Chatting"
            onClick={() => navigate("/new-projects/branding-design/packaging/strategist")}
          />

          <MethodCard
            tone="quiz"
            pill={{ text: "Self-guided · 4 min" }}
            title="Fill out the spec form"
            subtitle="Select your package type, pick your style, and enter the key specs. Step by step. No overwhelm, just the essentials."
            bullets={QUIZ_BULLETS}
            cta="Begin Spec Form"
            onClick={() => navigate("/new-projects/branding-design/packaging/quiz")}
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
