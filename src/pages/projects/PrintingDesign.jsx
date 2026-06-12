import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";

// Method picker for the Printing Design service. Mirrors the Logo Design
// and Brand Guidelines pickers: two paths (AI Designer chat, self guided
// 5 step quiz). Uses the portal accent (purple) + brand green tokens.

const STRATEGIST_BULLETS = [
  "Natural conversation, guided by AI",
  "Works for all 4 print formats",
  "Handles ebooks, brochures, flyers and posters",
  "Fastest path to production",
];

const QUIZ_BULLETS = [
  "Visual format and size selectors",
  "Adapts to your chosen print type",
  "Step by step with progress bar",
  "5 clear steps, no fluff",
];

export default function PrintingDesign() {
  const navigate = useNavigate();

  return (
    <div className="portal-page method-picker-page">
      <button
        type="button"
        className="portal-back-link"
        onClick={() => navigate("/new-projects/branding-design")}
      >
        <ArrowLeft size={16} />
        Back to Branding &amp; Design <span className="method-picker-crumb">/ Printing Design</span>
      </button>

      <div className="method-picker-shell">
        <header className="method-picker-header">
          <h1>Let&apos;s bring your brand to life in print</h1>
          <p>
            Brochures, ebooks, flyers, and posters. Choose how you&apos;d like to get started.
          </p>
        </header>

        <div className="method-picker-grid">
          <MethodCard
            tone="strategist"
            pill={{ text: "Recommended" }}
            title="Work with our AI Designer"
            subtitle="Just describe what you need. Our AI will ask the right questions, capture your specs, and build the creative brief, no forms."
            bullets={STRATEGIST_BULLETS}
            cta="Start Chatting"
            onClick={() => navigate("/new-projects/branding-design/printing/strategist")}
          />

          <MethodCard
            tone="quiz"
            pill={{ text: "Self-guided · 4 min" }}
            title="Fill out the brief yourself"
            subtitle="Pick your print format, choose your size, and share the key details. Step by step. Only the essentials, nothing extra."
            bullets={QUIZ_BULLETS}
            cta="Begin the Brief"
            onClick={() => navigate("/new-projects/branding-design/printing/quiz")}
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
