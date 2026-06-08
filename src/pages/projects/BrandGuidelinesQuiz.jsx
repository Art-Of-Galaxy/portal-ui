import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react";
import { apiServices } from "../../services/apiServices";
import { useLoading } from "../../context/LoadingContext";
import BrandGuidelinesView from "./BrandGuidelinesView";
import BrandAssetUploader from "../../components/brand/BrandAssetUploader";

// Self-guided 6 step quiz for Brand Guidelines Development. Mirrors the
// flow in 2_brand_development_flow.html: Your Brand, Your Audience,
// Personality, Visual, References, Deliverables.

const STEPS = [
  { id: 1, name: "Your Brand",         icon: "✏️" },
  { id: 2, name: "Your Audience",      icon: "🎯" },
  { id: 3, name: "Brand Personality",  icon: "🎭" },
  { id: 4, name: "Visual Direction",   icon: "🎨" },
  { id: 5, name: "References",         icon: "🌐" },
  { id: 6, name: "Deliverables",       icon: "📦" },
];

const AGE_OPTIONS = [
  { id: "gen_z",         emoji: "🎓", title: "Gen Z · 16 to 24",         desc: "Digital-native, trend-led, values-driven" },
  { id: "millennials",   emoji: "🌍", title: "Millennials · 25 to 38",   desc: "Aspiring, experience-first, brand-aware" },
  { id: "professionals", emoji: "💼", title: "Professionals · 30 to 50", desc: "Quality-focused, time-pressed, discerning" },
  { id: "mixed",         emoji: "🌟", title: "Everyone · Mixed ages",    desc: "Broad appeal across multiple demographics" },
];

const LIFESTYLE_OPTIONS = [
  { id: "urban",    emoji: "🏙️", label: "Urban and Trend-Led" },
  { id: "wellness", emoji: "🌿", label: "Health and Wellness" },
  { id: "creative", emoji: "💡", label: "Creative and Entrepreneurial" },
  { id: "active",   emoji: "🏃", label: "Active and Athletic" },
  { id: "travel",   emoji: "✈️", label: "Travel and Adventure" },
  { id: "family",   emoji: "🏡", label: "Family and Home-Centered" },
];

const PERSONALITY_OPTIONS = [
  { id: "bold",       emoji: "⚡", title: "Bold and Confident",   desc: "Loud, direct, unapologetic. Commands attention." },
  { id: "warm",       emoji: "☕", title: "Warm and Approachable", desc: "Friendly, human, inclusive. Feels like a good friend." },
  { id: "playful",    emoji: "🎈", title: "Playful and Fun",       desc: "Energetic, witty, lighthearted. Does not take itself too seriously." },
  { id: "premium",    emoji: "💎", title: "Premium and Refined",   desc: "Elevated, minimal, sophisticated. Quality above all." },
  { id: "rebellious", emoji: "🔥", title: "Rebellious and Raw",    desc: "Edgy, counter-culture, unfiltered. Goes against the grain." },
  { id: "calm",       emoji: "🌊", title: "Calm and Trustworthy",  desc: "Reliable, grounded, expert. Earns trust over time." },
];

const VOICE_TONE_OPTIONS = [
  { id: "conversational", emoji: "💬", label: "Conversational and casual" },
  { id: "direct",         emoji: "🎙️", label: "Direct and punchy" },
  { id: "educational",    emoji: "📚", label: "Educational and informative" },
  { id: "aspirational",   emoji: "✨", label: "Aspirational and inspirational" },
];

const COLOR_MOOD_OPTIONS = [
  { id: "dark_bold",        swatch: "linear-gradient(135deg,#0d0d0d,#2d2d2d)", name: "Dark and Bold",      desc: "Power, edge, authority" },
  { id: "warm_vibrant",     swatch: "linear-gradient(135deg,#ff4500,#ff8c00)", name: "Warm and Vibrant",   desc: "Energy, passion, confidence" },
  { id: "cool_trustworthy", swatch: "linear-gradient(135deg,#0057ff,#0d9488)", name: "Cool and Trustworthy", desc: "Calm, tech, professional" },
  { id: "fresh_natural",    swatch: "linear-gradient(135deg,#16a34a,#84cc16)", name: "Fresh and Natural",  desc: "Growth, health, organic" },
  { id: "bold_electric",    swatch: "linear-gradient(135deg,#8b5cf6,#ec4899)", name: "Bold and Electric",  desc: "Creative, expressive, Gen Z" },
  { id: "clean_neutral",    swatch: "linear-gradient(135deg,#f5f5f3,#c8c4bc)", name: "Clean and Neutral",  desc: "Luxury, editorial, timeless" },
];

const TYPE_OPTIONS = [
  { id: "serif",     sample: "Aa Bb Cc", style: { fontFamily: "Georgia, serif", fontSize: 18 },                                                       title: "Serif",     desc: "Classic, editorial authority" },
  { id: "sans",      sample: "Aa Bb Cc", style: { fontFamily: "Helvetica, Arial, sans-serif", fontSize: 18 },                                          title: "Sans Serif", desc: "Clean, modern, approachable" },
  { id: "script",    sample: "Aa Bb Cc", style: { fontFamily: "'Brush Script MT', cursive", fontSize: 20 },                                            title: "Script",    desc: "Elegant, personal, handcrafted" },
  { id: "modern",    sample: "Aa Bb Cc", style: { fontFamily: "Futura, 'Century Gothic', sans-serif", fontSize: 18, fontWeight: 300, letterSpacing: 1 }, title: "Modern",  desc: "Geometric, minimal, forward" },
  { id: "display",   sample: "Aa Bb Cc", style: { fontFamily: "Impact, sans-serif", fontSize: 20, fontWeight: 900 },                                   title: "Display",   desc: "High-impact, unmissable" },
  { id: "condensed", sample: "Aa Bb Cc", style: { fontFamily: "'Arial Narrow', sans-serif", fontSize: 18, fontWeight: 700 },                           title: "Condensed", desc: "Compact, structured, efficient" },
];

const DIFFERENTIATION_OPTIONS = [
  { id: "more_affordable",  emoji: "💰", label: "More affordable" },
  { id: "more_premium",     emoji: "👑", label: "More premium" },
  { id: "more_sustainable", emoji: "🌿", label: "More sustainable" },
  { id: "more_innovative",  emoji: "💡", label: "More innovative" },
  { id: "more_community",   emoji: "❤️", label: "More community-driven" },
  { id: "more_niche",       emoji: "🎯", label: "More niche and specific" },
];

const EXTRAS_OPTIONS = [
  { id: "social_templates",   emoji: "📱", label: "Social media templates" },
  { id: "presentation_deck",  emoji: "📊", label: "Presentation deck" },
  { id: "document_templates", emoji: "📄", label: "Document templates" },
  { id: "favicon",            emoji: "🌐", label: "Favicon and app icon" },
];

const emptyBrief = {
  brand_name: "",
  product_description: "",
  audience_age: "",
  lifestyle: [],
  personality: "",
  voice_tone: "",
  color_mood: [],
  typography_feel: "",
  admired_brand: "",
  main_competitor: "",
  differentiation: "",
  extras: [],
  additional_notes: "",
  brand_assets: [],
};

export default function BrandGuidelinesQuiz() {
  const navigate = useNavigate();
  const { withLoading } = useLoading();
  const [draftId, setDraftId] = useState(null);
  const [step, setStep] = useState(1);
  const [brief, setBrief] = useState(emptyBrief);
  const [loadingDraft, setLoadingDraft] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Load or create draft.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiServices.quiz_draft_start({ service: "brand_guidelines" });
        if (cancelled) return;
        if (!res?.success) throw new Error(res?.message || "Could not start the quiz.");
        setDraftId(res.draft.id);
        setStep(Math.min(Math.max(res.draft.step || 1, 1), STEPS.length));
        setBrief({ ...emptyBrief, ...(res.draft.brief || {}) });
      } catch (err) {
        if (!cancelled) setError(err?.message || "Could not start the quiz.");
      } finally {
        if (!cancelled) setLoadingDraft(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Debounced persist.
  useEffect(() => {
    if (!draftId || loadingDraft) return undefined;
    const handle = setTimeout(() => {
      apiServices.quiz_draft_patch({ id: draftId, step, brief }).catch(() => { /* silent */ });
    }, 600);
    return () => clearTimeout(handle);
  }, [brief, step, draftId, loadingDraft]);

  const update = (patch) => setBrief((b) => ({ ...b, ...patch }));

  const canAdvance = useMemo(() => {
    if (step === 1) return brief.brand_name.trim().length > 0 && brief.product_description.trim().length > 0;
    return true;
  }, [step, brief]);

  function goBack() {
    if (step === 1) {
      navigate("/new-projects/branding-design/brand-guidelines");
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  }

  function goNext() {
    if (!canAdvance) return;
    setStep((s) => Math.min(STEPS.length, s + 1));
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = { ...brief };
      const res = await withLoading(
        () => apiServices.generate_brand_guidelines({ form: payload }),
        [
          "Reading your brand brief...",
          "Distilling positioning and audience...",
          "Drafting voice and tone...",
          "Pairing typefaces...",
          "Building your color system...",
          "Sketching logo concepts...",
          "Composing social mockups...",
          "Rendering the brand book...",
          "Polishing the deliverables...",
          "Almost there...",
        ],
        { label: "AI is building", intervalMs: 2400 }
      );
      if (!res?.success) throw new Error(res?.message || "Generation failed");
      setResult(res);
      if (draftId) {
        try { await apiServices.quiz_draft_complete({ id: draftId, project_id: res.project_id }); }
        catch { /* non-fatal */ }
      }
    } catch (err) {
      setError(err?.message || "Could not generate. Try again?");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="portal-page">
        <button
          type="button"
          className="portal-back-link"
          onClick={() => navigate("/my-projects")}
        >
          <ArrowLeft size={16} />
          My Projects
        </button>
        <BrandGuidelinesView
          guidelines={result.guidelines}
          deliverables={result.deliverables}
          brandName={brief.brand_name}
          description={brief.product_description}
          tagline={result?.guidelines?.positioning_statement}
          statusLabel="Done"
          projectId={result.project_id}
          errors={result.errors}
        />
      </div>
    );
  }

  return (
    <div className="portal-page quiz-page">
      <div className="quiz-topbar">
        <button
          type="button"
          className="portal-back-link"
          onClick={() => navigate("/new-projects/branding-design/brand-guidelines")}
        >
          <ArrowLeft size={16} />
          Back to Branding &amp; Design / Brand Guidelines <span className="method-picker-crumb">/ Guided quiz</span>
        </button>
        <button
          type="button"
          className="strategist-header-change"
          onClick={() => navigate("/new-projects/branding-design/brand-guidelines")}
        >
          <ChevronLeft size={13} /> Change Method
        </button>
      </div>

      <header className="quiz-header">
        <h1>Brand Guidelines · Guided quiz</h1>
        <p>
          Answer 6 focused questions at your own pace. Visual selectors, minimal typing, full
          control at every step.
        </p>
      </header>

      <ProgressBar step={step} total={STEPS.length} label={STEPS[step - 1]?.name} />

      {error ? <div className="quiz-error">{error}</div> : null}

      <section className="quiz-card">
        {loadingDraft ? (
          <p className="quiz-loading">Loading your form...</p>
        ) : (
          <>
            <div className="bg-quiz-step-icon" aria-hidden="true">{STEPS[step - 1]?.icon}</div>
            {step === 1 ? <StepBrand brief={brief} onUpdate={update} /> : null}
            {step === 2 ? <StepAudience brief={brief} onUpdate={update} /> : null}
            {step === 3 ? <StepPersonality brief={brief} onUpdate={update} /> : null}
            {step === 4 ? <StepVisual brief={brief} onUpdate={update} /> : null}
            {step === 5 ? <StepReferences brief={brief} onUpdate={update} /> : null}
            {step === 6 ? <StepDeliverables brief={brief} onUpdate={update} /> : null}
          </>
        )}

        <footer className="quiz-actions">
          <button type="button" className="quiz-back" onClick={goBack} disabled={submitting}>
            <ArrowLeft size={14} />
          </button>
          {step < STEPS.length ? (
            <button
              type="button"
              className={`quiz-next ${canAdvance ? "is-ready" : ""}`}
              onClick={goNext}
              disabled={!canAdvance}
            >
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              className="quiz-next is-ready"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Building..." : "Submit my brief"} <ArrowRight size={14} />
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}

// ---------- Steps ----------

function StepBrand({ brief, onUpdate }) {
  return (
    <div>
      <h2 className="quiz-q">What&apos;s your brand called?</h2>
      <p className="quiz-q-sub">Tell us the name and what you do in plain terms.</p>
      <label className="quiz-label">Brand name</label>
      <input
        className="quiz-input"
        placeholder="e.g. Everleaf Studio"
        value={brief.brand_name}
        onChange={(e) => onUpdate({ brand_name: e.target.value })}
      />
      <label className="quiz-label">What do you offer and who is it for?</label>
      <div className="quiz-textarea-wrap">
        <textarea
          className="quiz-textarea"
          rows={3}
          maxLength={220}
          placeholder="e.g. A skincare line for women 25 to 40 who want clean, science-backed beauty without the luxury price tag."
          value={brief.product_description}
          onChange={(e) => onUpdate({ product_description: e.target.value })}
        />
        <span className="quiz-textarea-count">{brief.product_description.length}/220</span>
      </div>
    </div>
  );
}

function StepAudience({ brief, onUpdate }) {
  function toggleLifestyle(id) {
    const cur = brief.lifestyle || [];
    if (cur.includes(id)) {
      onUpdate({ lifestyle: cur.filter((v) => v !== id) });
    } else if (cur.length < 2) {
      onUpdate({ lifestyle: [...cur, id] });
    }
  }
  return (
    <div>
      <h2 className="quiz-q">Who are you building this for?</h2>
      <p className="quiz-q-sub">Pick the age group and the lifestyle that best describes your ideal customer.</p>
      <div className="bg-quiz-option-grid is-2col">
        {AGE_OPTIONS.map((o) => {
          const sel = brief.audience_age === o.id;
          return (
            <button
              key={o.id}
              type="button"
              className={`bg-quiz-option-card ${sel ? "is-selected" : ""}`}
              onClick={() => onUpdate({ audience_age: o.id })}
            >
              <div className="bg-quiz-option-inner">
                <span className="bg-quiz-option-emoji">{o.emoji}</span>
                <div>
                  <div className="bg-quiz-option-title">{o.title}</div>
                  <div className="bg-quiz-option-desc">{o.desc}</div>
                </div>
                <span className="bg-quiz-option-check">✓</span>
              </div>
            </button>
          );
        })}
      </div>
      <label className="quiz-label" style={{ marginTop: "1.4rem" }}>
        What lifestyle best fits your audience? (pick up to 2)
      </label>
      <div className="bg-quiz-chip-grid">
        {LIFESTYLE_OPTIONS.map((o) => {
          const sel = (brief.lifestyle || []).includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              className={`bg-quiz-chip ${sel ? "is-selected" : ""}`}
              onClick={() => toggleLifestyle(o.id)}
            >
              <span className="bg-quiz-chip-emoji">{o.emoji}</span>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepPersonality({ brief, onUpdate }) {
  return (
    <div>
      <h2 className="quiz-q">How should your brand feel?</h2>
      <p className="quiz-q-sub">Pick one core personality. This drives voice, tone, and every design decision.</p>
      <div className="bg-quiz-option-grid is-2col">
        {PERSONALITY_OPTIONS.map((o) => {
          const sel = brief.personality === o.id;
          return (
            <button
              key={o.id}
              type="button"
              className={`bg-quiz-option-card ${sel ? "is-selected" : ""}`}
              onClick={() => onUpdate({ personality: o.id })}
            >
              <div className="bg-quiz-option-inner">
                <span className="bg-quiz-option-emoji">{o.emoji}</span>
                <div>
                  <div className="bg-quiz-option-title">{o.title}</div>
                  <div className="bg-quiz-option-desc">{o.desc}</div>
                </div>
                <span className="bg-quiz-option-check">✓</span>
              </div>
            </button>
          );
        })}
      </div>
      <label className="quiz-label" style={{ marginTop: "1.4rem" }}>How should your brand communicate?</label>
      <div className="bg-quiz-chip-grid">
        {VOICE_TONE_OPTIONS.map((o) => {
          const sel = brief.voice_tone === o.id;
          return (
            <button
              key={o.id}
              type="button"
              className={`bg-quiz-chip ${sel ? "is-selected" : ""}`}
              onClick={() => onUpdate({ voice_tone: o.id })}
            >
              <span className="bg-quiz-chip-emoji">{o.emoji}</span>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepVisual({ brief, onUpdate }) {
  function toggleColor(id) {
    const cur = brief.color_mood || [];
    if (cur.includes(id)) {
      onUpdate({ color_mood: cur.filter((v) => v !== id) });
    } else if (cur.length < 2) {
      onUpdate({ color_mood: [...cur, id] });
    }
  }
  return (
    <div>
      <h2 className="quiz-q">What&apos;s the visual mood?</h2>
      <p className="quiz-q-sub">Choose up to 2 color directions that feel right for your brand.</p>
      <div className="bg-quiz-color-grid">
        {COLOR_MOOD_OPTIONS.map((o) => {
          const sel = (brief.color_mood || []).includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              className={`bg-quiz-color-option ${sel ? "is-selected" : ""}`}
              onClick={() => toggleColor(o.id)}
            >
              <span className="bg-quiz-color-swatch" style={{ background: o.swatch }} />
              <div className="bg-quiz-color-text">
                <div className="bg-quiz-color-name">{o.name}</div>
                <div className="bg-quiz-color-desc">{o.desc}</div>
              </div>
              <span className="bg-quiz-color-check">✓</span>
            </button>
          );
        })}
      </div>
      <label className="quiz-label" style={{ marginTop: "1.4rem" }}>Preferred typography style?</label>
      <div className="bg-quiz-option-grid is-2col">
        {TYPE_OPTIONS.map((o) => {
          const sel = brief.typography_feel === o.id;
          return (
            <button
              key={o.id}
              type="button"
              className={`bg-quiz-option-card is-typo ${sel ? "is-selected" : ""}`}
              onClick={() => onUpdate({ typography_feel: o.id })}
            >
              <div className="bg-quiz-typo-sample" style={{ ...o.style, color: "var(--portal-text)" }}>{o.sample}</div>
              <div className="bg-quiz-option-title">{o.title}</div>
              <div className="bg-quiz-option-desc">{o.desc}</div>
              <span className="bg-quiz-option-check">✓</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepReferences({ brief, onUpdate }) {
  return (
    <div>
      <h2 className="quiz-q">Any brands you admire or want to stand out from?</h2>
      <p className="quiz-q-sub">
        This helps us understand the space you&apos;re entering and where you want to sit in it.
      </p>
      <label className="quiz-label">A brand you admire (and why)</label>
      <input
        className="quiz-input"
        placeholder="e.g. Glossier, clean, community-first, un-intimidating"
        value={brief.admired_brand}
        onChange={(e) => onUpdate({ admired_brand: e.target.value })}
      />
      <label className="quiz-label">Main competitor</label>
      <input
        className="quiz-input"
        placeholder="Brand name or URL"
        value={brief.main_competitor}
        onChange={(e) => onUpdate({ main_competitor: e.target.value })}
      />
      <label className="quiz-label" style={{ marginTop: "1rem" }}>How do you want to stand out?</label>
      <div className="bg-quiz-chip-grid">
        {DIFFERENTIATION_OPTIONS.map((o) => {
          const sel = brief.differentiation === o.id;
          return (
            <button
              key={o.id}
              type="button"
              className={`bg-quiz-chip ${sel ? "is-selected" : ""}`}
              onClick={() => onUpdate({ differentiation: o.id })}
            >
              <span className="bg-quiz-chip-emoji">{o.emoji}</span>
              {o.label}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "1.6rem" }}>
        <BrandAssetUploader
          value={brief.brand_assets || []}
          onChange={(next) => onUpdate({ brand_assets: next })}
          projectName={brief.brand_name || "Brand Guidelines Request"}
          label="Upload product photos or existing brand materials (optional)"
          helper="Anything you upload gets folded into the brief and used as a reference for your logo and social media generations. Product photos make the social kit feature your actual product."
        />
      </div>
    </div>
  );
}

function StepDeliverables({ brief, onUpdate }) {
  function toggleExtra(id) {
    const cur = brief.extras || [];
    onUpdate({ extras: cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id] });
  }
  return (
    <div>
      <h2 className="quiz-q">What do you need delivered?</h2>
      <p className="quiz-q-sub">Your core brand package is always included. Select any extras you&apos;d like.</p>

      <label className="quiz-label" style={{ marginBottom: 10 }}>Always included</label>
      <ul className="bg-quiz-core-list">
        <li>Brand guidelines PDF</li>
        <li>Logo package (SVG, PNG, EPS)</li>
        <li>Color and typography system</li>
        <li>Voice and tone one-pager</li>
        <li>Social media kit (4 templates)</li>
      </ul>

      <label className="quiz-label" style={{ marginTop: "1.2rem" }}>Add-ons (optional)</label>
      <div className="bg-quiz-deliverables-grid">
        {EXTRAS_OPTIONS.map((o) => {
          const sel = (brief.extras || []).includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              className={`bg-quiz-deliverable-check ${sel ? "is-selected" : ""}`}
              onClick={() => toggleExtra(o.id)}
            >
              <span className="bg-quiz-deliverable-box">✓</span>
              <span className="bg-quiz-deliverable-icon">{o.emoji}</span>
              <span className="bg-quiz-deliverable-label">{o.label}</span>
            </button>
          );
        })}
      </div>

      <label className="quiz-label" style={{ marginTop: "1.2rem" }}>
        Anything else we should know? <span className="quiz-label-muted">(optional)</span>
      </label>
      <textarea
        className="quiz-textarea"
        rows={3}
        placeholder="Special requests, deadlines, things to avoid, languages needed..."
        value={brief.additional_notes}
        onChange={(e) => onUpdate({ additional_notes: e.target.value })}
      />
    </div>
  );
}

function ProgressBar({ step, total, label = "" }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="quiz-progress">
      <div className="quiz-progress-text">Step {step} of {total} <strong>· {label}</strong></div>
      <div className="quiz-progress-track">
        <div className="quiz-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const stepPropTypes = {
  brief: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
};
StepBrand.propTypes        = stepPropTypes;
StepAudience.propTypes     = stepPropTypes;
StepPersonality.propTypes  = stepPropTypes;
StepVisual.propTypes       = stepPropTypes;
StepReferences.propTypes   = stepPropTypes;
StepDeliverables.propTypes = stepPropTypes;

ProgressBar.propTypes = {
  step: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  label: PropTypes.string,
};
