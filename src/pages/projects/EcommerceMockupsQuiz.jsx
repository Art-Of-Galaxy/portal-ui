import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react";
import { apiServices } from "../../services/apiServices";
import { useLoading } from "../../context/LoadingContext";
import EcommerceMockupsView from "./EcommerceMockupsView";
import BrandAssetUploader from "../../components/brand/BrandAssetUploader";

// Self-guided 5 step E-Commerce Mockups brief. Mirrors the flow shown in
// 5_ecommerce_mockups_flow.html: pick platforms, product info, key
// claims + certifications, visual style + mockup types, assets + notes.

const STEPS = [
  { id: 1, name: "Platform",       icon: "🛒" },
  { id: 2, name: "Your Product",   icon: "📦" },
  { id: 3, name: "Key Claims",     icon: "⭐" },
  { id: 4, name: "Visual Style",   icon: "🎨" },
  { id: 5, name: "Assets & Notes", icon: "📎" },
];

const PLATFORMS = [
  { id: "amazon",      emoji: "📦", name: "Amazon",       desc: "Main image + A+ content specs" },
  { id: "shopify",     emoji: "🛍️", name: "Shopify",      desc: "PDP and collection grid visuals" },
  { id: "etsy",        emoji: "🎨", name: "Etsy",         desc: "Listing images, lifestyle focus" },
  { id: "woocommerce", emoji: "🛒", name: "WooCommerce",  desc: "Product page and thumbnail images" },
];

const CATEGORIES = [
  "Supplements & Health", "Food & Beverage", "Beauty & Skincare", "Pet Products",
  "Home & Kitchen", "Sports & Fitness", "Electronics & Tech", "Baby & Kids", "Other",
];

const CERTIFICATIONS = [
  "FDA compliant", "Certified organic", "Non-GMO", "Vegan", "Cruelty-free",
  "Gluten-free", "Kosher", "Made in USA", "Keto-friendly", "No certifications",
];

const BG_STYLES = [
  { id: "white",     emoji: "⬜", name: "White / Transparent", sub: "Amazon main image standard" },
  { id: "lifestyle", emoji: "🌿", name: "Lifestyle / Scene",   sub: "Real-world context, high engagement" },
  { id: "minimal",   emoji: "♾️", name: "Minimalist / Clean",  sub: "Neutral, editorial, premium" },
  { id: "branded",   emoji: "🎨", name: "Branded Color",       sub: "On-brand color background, bold presence" },
];

const MOCKUP_TYPES = [
  { id: "hero",      emoji: "🖼️", label: "Hero main image",       desc: "Primary listing image, full product" },
  { id: "closeup",   emoji: "🔍", label: "Product close-ups",      desc: "Detail shots, texture, quality" },
  { id: "feature",   emoji: "📊", label: "Feature highlights",     desc: "Infographic callouts, claim badges" },
  { id: "lifestyle", emoji: "🌄", label: "Lifestyle scenes",       desc: "Product in real-world context" },
  { id: "packaging", emoji: "📦", label: "Packaging flat-lay",     desc: "All components, overhead or angled" },
  { id: "aplus",     emoji: "✨", label: "A+ / comparison content", desc: "Amazon A+ modules, feature grids" },
];

const BRAND_OPTIONS = [
  { id: "yes",       title: "Yes, I'll share them", desc: "Logo, colors, fonts or full guide" },
  { id: "logo_only", title: "Logo only",            desc: "We'll pick palette and type" },
  { id: "no",        title: "No, design freely",    desc: "Or match our existing product" },
];

const emptyBrief = {
  platforms: [],
  other_platform: "",
  product_name: "",
  product_description: "",
  target_customer: "",
  product_category: "",
  claims: "",
  certifications: [],
  background_styles: [],
  mockup_types: [],
  has_brand: "",
  product_uploads: [],
  brand_assets: [],
  refs: "",
  notes: "",
};

export default function EcommerceMockupsQuiz() {
  const navigate = useNavigate();
  const { withLoading } = useLoading();
  const [draftId, setDraftId] = useState(null);
  const [step, setStep] = useState(1);
  const [brief, setBrief] = useState(emptyBrief);
  const [loadingDraft, setLoadingDraft] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiServices.quiz_draft_start({ service: "ecommerce_mockups" });
        if (cancelled) return;
        if (!res?.success) throw new Error(res?.message || "Could not start the brief.");
        setDraftId(res.draft.id);
        setStep(Math.min(Math.max(res.draft.step || 1, 1), STEPS.length));
        setBrief({ ...emptyBrief, ...(res.draft.brief || {}) });
      } catch (err) {
        if (!cancelled) setError(err?.message || "Could not start the brief.");
      } finally {
        if (!cancelled) setLoadingDraft(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!draftId || loadingDraft) return undefined;
    const handle = setTimeout(() => {
      apiServices.quiz_draft_patch({ id: draftId, step, brief }).catch(() => { /* silent */ });
    }, 600);
    return () => clearTimeout(handle);
  }, [brief, step, draftId, loadingDraft]);

  const update = (patch) => setBrief((b) => ({ ...b, ...patch }));

  const canAdvance = useMemo(() => {
    if (step === 1) return (brief.platforms?.length > 0) || brief.other_platform.trim().length > 0;
    if (step === 2) return brief.product_name.trim().length > 0 && brief.product_description.trim().length > 0;
    return true;
  }, [step, brief]);

  function goBack() {
    if (step === 1) {
      navigate("/new-projects/branding-design/ecommerce-mockups");
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
      const res = await withLoading(
        () => apiServices.generate_ecommerce_mockups({ form: brief }),
        [
          "Reading your product brief...",
          "Distilling your claims...",
          "Composing the 6 mockup prompts...",
          "Sending them to the image model...",
          "Sketching the first concepts...",
          "Polishing the final renders...",
          "Almost there...",
        ],
        { label: "AI is designing", intervalMs: 2400 }
      );
      if (!res?.success) throw new Error(res?.message || "Generation failed");
      setResult(res);
      if (draftId) {
        try { await apiServices.quiz_draft_complete({ id: draftId, project_id: res.project_id }); }
        catch { /* non-fatal */ }
      }
    } catch (err) {
      setError(err?.message || "Could not submit. Try again?");
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
        <EcommerceMockupsView
          mockups={result.mockups}
          productName={brief.product_name}
          description={brief.product_description}
          statusLabel="Done"
          projectId={result.project_id}
          imageModel={result.image_model}
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
          onClick={() => navigate("/new-projects/branding-design/ecommerce-mockups")}
        >
          <ArrowLeft size={16} />
          Back to Branding &amp; Design / E-Commerce Mockups <span className="method-picker-crumb">/ Guided brief</span>
        </button>
        <button
          type="button"
          className="strategist-header-change"
          onClick={() => navigate("/new-projects/branding-design/ecommerce-mockups")}
        >
          <ChevronLeft size={13} /> Change Method
        </button>
      </div>

      <header className="quiz-header">
        <h1>E-Commerce Mockups · Guided brief</h1>
        <p>Pick your platforms, share the product, and we&apos;ll generate a 6-piece mockup set tuned to convert.</p>
      </header>

      <ProgressBar step={step} total={STEPS.length} label={STEPS[step - 1]?.name} />

      {error ? <div className="quiz-error">{error}</div> : null}

      <section className="quiz-card">
        {loadingDraft ? (
          <p className="quiz-loading">Loading your brief...</p>
        ) : (
          <>
            <div className="bg-quiz-step-icon" aria-hidden="true">{STEPS[step - 1]?.icon}</div>
            {step === 1 ? <StepPlatform brief={brief} onUpdate={update} /> : null}
            {step === 2 ? <StepProduct  brief={brief} onUpdate={update} /> : null}
            {step === 3 ? <StepClaims   brief={brief} onUpdate={update} /> : null}
            {step === 4 ? <StepVisual   brief={brief} onUpdate={update} /> : null}
            {step === 5 ? <StepAssets   brief={brief} onUpdate={update} /> : null}
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
              {submitting ? "Generating..." : "Generate my mockups"} <ArrowRight size={14} />
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}

// ---------- Steps ----------

function StepPlatform({ brief, onUpdate }) {
  function toggle(id) {
    const cur = brief.platforms || [];
    onUpdate({ platforms: cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id] });
  }
  return (
    <div>
      <h2 className="quiz-q">Where are you selling?</h2>
      <p className="quiz-q-sub">Select all platforms you need mockups for. Each platform has different image specs, we&apos;ll optimize for all of them.</p>
      <div className="bg-quiz-option-grid is-2col">
        {PLATFORMS.map((p) => {
          const sel = (brief.platforms || []).includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              className={`bg-quiz-option-card ${sel ? "is-selected" : ""}`}
              onClick={() => toggle(p.id)}
            >
              <div className="bg-quiz-option-inner">
                <span className="bg-quiz-option-emoji">{p.emoji}</span>
                <div>
                  <div className="bg-quiz-option-title">{p.name}</div>
                  <div className="bg-quiz-option-desc">{p.desc}</div>
                </div>
                <span className="bg-quiz-option-check">✓</span>
              </div>
            </button>
          );
        })}
      </div>
      <label className="quiz-label" style={{ marginTop: "1rem" }}>
        Other platform <span className="quiz-label-muted">(optional)</span>
      </label>
      <input
        className="quiz-input"
        placeholder="e.g. Walmart, TikTok Shop, Instagram Shop..."
        value={brief.other_platform}
        onChange={(e) => onUpdate({ other_platform: e.target.value })}
      />
    </div>
  );
}

function StepProduct({ brief, onUpdate }) {
  return (
    <div>
      <h2 className="quiz-q">Tell us about your product</h2>
      <p className="quiz-q-sub">This is the core of the brief, the designer needs to understand what they&apos;re making look incredible.</p>
      <label className="quiz-label">Product name</label>
      <input
        className="quiz-input"
        placeholder="e.g. Organic Herbal Tea, 50g"
        value={brief.product_name}
        onChange={(e) => onUpdate({ product_name: e.target.value })}
      />
      <label className="quiz-label">Product description</label>
      <textarea
        className="quiz-textarea"
        rows={3}
        placeholder="e.g. 100% natural tea blend made with chamomile, mint, and lemongrass. Gluten-free and non-GMO."
        value={brief.product_description}
        onChange={(e) => onUpdate({ product_description: e.target.value })}
      />
      <label className="quiz-label">Who is this product for?</label>
      <input
        className="quiz-input"
        placeholder="e.g. Eco-conscious women aged 25 to 40 who prioritize wellness"
        value={brief.target_customer}
        onChange={(e) => onUpdate({ target_customer: e.target.value })}
      />
      <label className="quiz-label">Product category</label>
      <div className="bg-quiz-chip-grid">
        {CATEGORIES.map((c) => {
          const sel = brief.product_category === c;
          return (
            <button
              key={c}
              type="button"
              className={`bg-quiz-chip ${sel ? "is-selected" : ""}`}
              onClick={() => onUpdate({ product_category: c })}
            >{c}</button>
          );
        })}
      </div>
    </div>
  );
}

function StepClaims({ brief, onUpdate }) {
  function toggleCert(c) {
    const cur = brief.certifications || [];
    onUpdate({ certifications: cur.includes(c) ? cur.filter((v) => v !== c) : [...cur, c] });
  }
  return (
    <div>
      <h2 className="quiz-q">What makes it worth buying?</h2>
      <p className="quiz-q-sub">These claims go on the mockups as badge overlays and feature callouts, make them punchy.</p>
      <label className="quiz-label">Top 3 to 5 selling points or benefits</label>
      <textarea
        className="quiz-textarea"
        rows={3}
        placeholder="e.g. Sugar-free · 30-day money-back guarantee · Made in the USA · 2-in-1 formula · Clinically tested"
        value={brief.claims}
        onChange={(e) => onUpdate({ claims: e.target.value })}
      />
      <div className="em-info-banner" style={{ margin: "8px 0 16px" }}>
        💡 Keep claims short and specific. &quot;Clinically tested&quot; beats &quot;High quality&quot;. Bullet points work great here.
      </div>
      <label className="quiz-label">
        Certifications or compliance badges <span className="quiz-label-muted">(select all that apply)</span>
      </label>
      <div className="bg-quiz-chip-grid">
        {CERTIFICATIONS.map((c) => {
          const sel = (brief.certifications || []).includes(c);
          return (
            <button
              key={c}
              type="button"
              className={`bg-quiz-chip ${sel ? "is-selected" : ""}`}
              onClick={() => toggleCert(c)}
            >{c}</button>
          );
        })}
      </div>
    </div>
  );
}

function StepVisual({ brief, onUpdate }) {
  function toggleBg(id) {
    const cur = brief.background_styles || [];
    onUpdate({ background_styles: cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id] });
  }
  function toggleType(id) {
    const cur = brief.mockup_types || [];
    onUpdate({ mockup_types: cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id] });
  }
  return (
    <div>
      <h2 className="quiz-q">How should the mockups look?</h2>
      <p className="quiz-q-sub">Choose the background style and the types of shots you need. Both can be mixed.</p>
      <label className="quiz-label">
        Background style <span className="quiz-label-muted">(select all that apply)</span>
      </label>
      <div className="bg-quiz-option-grid is-2col">
        {BG_STYLES.map((b) => {
          const sel = (brief.background_styles || []).includes(b.id);
          return (
            <button
              key={b.id}
              type="button"
              className={`bg-quiz-option-card ${sel ? "is-selected" : ""}`}
              onClick={() => toggleBg(b.id)}
            >
              <div className="bg-quiz-option-inner">
                <span className="bg-quiz-option-emoji">{b.emoji}</span>
                <div>
                  <div className="bg-quiz-option-title">{b.name}</div>
                  <div className="bg-quiz-option-desc">{b.sub}</div>
                </div>
                <span className="bg-quiz-option-check">✓</span>
              </div>
            </button>
          );
        })}
      </div>
      <label className="quiz-label" style={{ marginTop: "1.2rem" }}>Mockup types needed</label>
      <div className="bg-quiz-option-grid is-2col">
        {MOCKUP_TYPES.map((m) => {
          const sel = (brief.mockup_types || []).includes(m.id);
          return (
            <button
              key={m.id}
              type="button"
              className={`bg-quiz-option-card ${sel ? "is-selected" : ""}`}
              onClick={() => toggleType(m.id)}
            >
              <div className="bg-quiz-option-inner">
                <span className="bg-quiz-option-emoji">{m.emoji}</span>
                <div>
                  <div className="bg-quiz-option-title">{m.label}</div>
                  <div className="bg-quiz-option-desc">{m.desc}</div>
                </div>
                <span className="bg-quiz-option-check">✓</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepAssets({ brief, onUpdate }) {
  return (
    <div>
      <h2 className="quiz-q">Assets &amp; final details</h2>
      <p className="quiz-q-sub">Share your product photos and brand assets. These are the biggest production unlock, the more you send, the faster we move.</p>
      <label className="quiz-label">Product images</label>
      <div style={{ marginTop: "0.4rem" }}>
        <BrandAssetUploader
          value={brief.product_uploads || []}
          onChange={(next) => onUpdate({ product_uploads: next })}
          projectName={brief.product_name || "E-Commerce Mockups Request"}
          label=""
          helper="High-res JPG, PNG, PSD or RAW. We pass these to the image model as a reference so the generated mockups feature your real product."
          accept="image/*,.psd,.raw"
        />
      </div>
      <label className="quiz-label" style={{ marginTop: "1.2rem" }}>
        Do you have brand guidelines or a style guide?
      </label>
      <div className="bg-quiz-option-grid is-2col">
        {BRAND_OPTIONS.map((o) => {
          const sel = brief.has_brand === o.id;
          return (
            <button
              key={o.id}
              type="button"
              className={`bg-quiz-option-card ${sel ? "is-selected" : ""}`}
              onClick={() => onUpdate({ has_brand: o.id })}
            >
              <div className="bg-quiz-option-inner">
                <div style={{ flex: 1 }}>
                  <div className="bg-quiz-option-title">{o.title}</div>
                  <div className="bg-quiz-option-desc">{o.desc}</div>
                </div>
                <span className="bg-quiz-option-check">✓</span>
              </div>
            </button>
          );
        })}
      </div>
      {brief.has_brand === "yes" || brief.has_brand === "logo_only" ? (
        <div style={{ marginTop: "1rem" }}>
          <BrandAssetUploader
            value={brief.brand_assets || []}
            onChange={(next) => onUpdate({ brand_assets: next })}
            projectName={brief.product_name || "E-Commerce Mockups Request"}
            label="Upload brand files"
            helper="Logo (vector preferred), color codes, fonts, existing style guide. AI, PDF, PNG, SVG, ZIP accepted."
            accept="image/*,application/pdf,.ai,.eps,.svg,.zip"
          />
        </div>
      ) : null}
      <label className="quiz-label" style={{ marginTop: "1.2rem" }}>
        Reference images or moodboard <span className="quiz-label-muted">(optional)</span>
      </label>
      <input
        className="quiz-input"
        placeholder="Paste a URL or describe a brand or competitor whose mockups you admire"
        value={brief.refs}
        onChange={(e) => onUpdate({ refs: e.target.value })}
      />
      <label className="quiz-label">
        Additional notes or requirements <span className="quiz-label-muted">(optional)</span>
      </label>
      <textarea
        className="quiz-textarea"
        rows={3}
        placeholder="Deadlines, listing restrictions (Amazon image rules), languages, things to avoid, number of SKUs..."
        value={brief.notes}
        onChange={(e) => onUpdate({ notes: e.target.value })}
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

const stepPropTypes = { brief: PropTypes.object.isRequired, onUpdate: PropTypes.func.isRequired };
StepPlatform.propTypes = stepPropTypes;
StepProduct.propTypes  = stepPropTypes;
StepClaims.propTypes   = stepPropTypes;
StepVisual.propTypes   = stepPropTypes;
StepAssets.propTypes   = stepPropTypes;
ProgressBar.propTypes = { step: PropTypes.number.isRequired, total: PropTypes.number.isRequired, label: PropTypes.string };
