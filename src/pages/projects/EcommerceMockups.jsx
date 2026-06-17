import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";

// Method picker for the E-Commerce Mockups service. Mirrors the other
// branding pickers: AI Specialist chat vs self-guided 5 step brief form.
// Portal accent (purple) tokens.

const STRATEGIST_BULLETS = [
  "Covers all platforms in one conversation",
  "Guides you on what makes mockups convert",
  "Captures product, claims, visual style",
  "Fastest path to production-ready visuals",
];

const QUIZ_BULLETS = [
  "Visual platform and style selectors",
  "Pick mockup types with one click",
  "Step by step, 5 clear steps",
  "Progress bar so you know how close you are",
];

export default function EcommerceMockups() {
  const navigate = useNavigate();

  return (
    <div className="portal-page method-picker-page">
      <button
        type="button"
        className="portal-back-link"
        onClick={() => navigate("/new-projects/branding-design")}
      >
        <ArrowLeft size={16} />
        Back to Branding &amp; Design <span className="method-picker-crumb">/ E-Commerce Mockups</span>
      </button>

      <div className="method-picker-shell">
        <header className="method-picker-header">
          <h1>Let&apos;s make your product impossible to scroll past</h1>
          <p>
            High-converting visuals for Amazon, Shopify, Etsy and more. Tell us about your
            product and we&apos;ll take it from there.
          </p>
        </header>

        <div className="method-picker-grid">
          <MethodCard
            tone="strategist"
            pill={{ text: "Recommended" }}
            title="Work with our AI Specialist"
            subtitle="Just describe your product. Our AI will ask the right questions, capture the brief, and tell us exactly what to design. No forms."
            bullets={STRATEGIST_BULLETS}
            cta="Start Chatting"
            onClick={() => navigate("/new-projects/branding-design/ecommerce-mockups/strategist")}
          />

          <MethodCard
            tone="quiz"
            pill={{ text: "Self-guided · 4 min" }}
            title="Fill out the brief yourself"
            subtitle="Tell us your platform, product details, and the visual style you're after. Five focused steps. Only what actually matters."
            bullets={QUIZ_BULLETS}
            cta="Begin the Brief"
            onClick={() => navigate("/new-projects/branding-design/ecommerce-mockups/quiz")}
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
