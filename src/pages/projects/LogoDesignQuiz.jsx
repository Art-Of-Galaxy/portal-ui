import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronLeft, Paperclip } from "lucide-react";
import { apiServices } from "../../services/apiServices";
import { useLoading } from "../../context/LoadingContext";
import ColorPicker from "../../components/ui/ColorPicker";
import LogoDesignView from "./LogoDesignView";

// One representative example per logo style, from the new asset pack.
import logoExample1 from "../../assets/branding/logo/assets/LogoExample_1.png";
import logoExample2 from "../../assets/branding/logo/assets/LogoExample_2.png";
import logoExample3 from "../../assets/branding/logo/assets/LogoExample_3.png";
import logoExample4 from "../../assets/branding/logo/assets/LogoExample_4.png";
import logoExample5 from "../../assets/branding/logo/assets/LogoExample_5.png";
import logoExample6 from "../../assets/branding/logo/assets/LogoExample_6.png";

const STEPS = [
  { id: 1, name: "Your Brand" },
  { id: 2, name: "Your Business" },
  { id: 3, name: "Logo Style" },
  { id: 4, name: "Look & Feel" },
  { id: 5, name: "Final Touches" },
];

const STYLE_CARDS = [
  { id: "vintage",     title: "Vintage",     blurb: "Classic, crafted, and full of character.", ref: logoExample1 },
  { id: "mascot",      title: "Mascot",      blurb: "A character or symbol with personality.",  ref: logoExample2 },
  { id: "wordmark",    title: "Wordmark",    blurb: "The brand name is the main focus.",        ref: logoExample3 },
  { id: "monogram",    title: "Monogram",    blurb: "Initials turned into an emblem.",          ref: logoExample4 },
  { id: "combination", title: "Combination", blurb: "Text and symbol, balanced and versatile.", ref: logoExample5 },
  { id: "minimalist",  title: "Minimalist",  blurb: "Clean, simple, and modern.",               ref: logoExample6 },
];

// Industries shown as chip buttons. Emoji at the front gives quick visual
// scan, the values match the strategist domain's expected industry slot.
const INDUSTRIES = [
  { id: "fashion",   label: "Fashion & Apparel",    icon: "👗" },
  { id: "food",      label: "Food & Beverage",      icon: "🍔" },
  { id: "tech",      label: "Tech & Software",      icon: "💻" },
  { id: "fitness",   label: "Health & Fitness",     icon: "💪" },
  { id: "beauty",    label: "Beauty & Wellness",    icon: "💄" },
  { id: "home",      label: "Home & Lifestyle",     icon: "🏠" },
  { id: "music",     label: "Music & Entertaiment", icon: "🎵" },
  { id: "other",     label: "Other",                icon: "" },
];

const TYPOGRAPHY = [
  { id: "serif",     name: "Serif",     blurb: "Classic, trustworthy, editorial authority", style: { fontFamily: "Georgia, 'Times New Roman', serif" } },
  { id: "sans",      name: "San Serif", blurb: "Clean, modern, approachable clarity",       style: { fontFamily: "Inter, Arial, sans-serif" } },
  { id: "script",    name: "Script",    blurb: "Elegant, personal, handcrafted soul",       style: { fontFamily: "'Brush Script MT', cursive", fontStyle: "italic" } },
  { id: "modern",    name: "Modern",    blurb: "Geometric, minimal, forward-looking",       style: { fontFamily: "Arial Black, sans-serif", fontWeight: 900 } },
  { id: "display",   name: "Display",   blurb: "High-impact, headline-grade, unmissable",   style: { fontFamily: "Georgia, serif", fontWeight: 900 } },
  { id: "condensed", name: "Condensed", blurb: "Compact, structured, efficient presence",   style: { fontFamily: "'Arial Narrow', Impact, sans-serif" } },
];

const LOGO_LOADER_MESSAGES = [
  "Reading your brand brief...",
  "Picking the right visual direction...",
  "Composing the prompt...",
  "Sending it to the image model...",
  "Sketching the first concepts...",
  "Refining color and balance...",
  "Polishing the final renders...",
  "Almost there...",
];

const emptyBrief = {
  brand_name: "",
  tagline: "",
  business_description: "",
  industry: "",
  logo_style: "",
  custom_colors: ["", "", ""],
  selected_typography: [],
  reference_links: ["", ""],
  reference_uploads: [],
  additional_notes: "",
};

export default function LogoDesignQuiz() {
  const navigate = useNavigate();
  const { withLoading } = useLoading();
  const [draftId, setDraftId] = useState(null);
  const [step, setStep] = useState(1);
  const [brief, setBrief] = useState(emptyBrief);
  const [loadingDraft, setLoadingDraft] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Load or create the draft on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiServices.quiz_draft_start({ service: "logo_design" });
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

  // Debounced persist on brief / step change.
  useEffect(() => {
    if (!draftId || loadingDraft) return undefined;
    const handle = setTimeout(() => {
      apiServices.quiz_draft_patch({ id: draftId, step, brief }).catch(() => {
        /* silent; we'll retry on next change */
      });
    }, 600);
    return () => clearTimeout(handle);
  }, [brief, step, draftId, loadingDraft]);

  const update = (patch) => setBrief((b) => ({ ...b, ...patch }));

  const canAdvance = useMemo(() => {
    if (step === 1) return brief.brand_name.trim().length > 0;
    if (step === 2) return brief.business_description.trim().length > 0;
    if (step === 3) return Boolean(brief.logo_style);
    return true;
  }, [step, brief]);

  function goBack() {
    if (step === 1) {
      navigate("/new-projects/branding-design/logo");
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  }

  function goNext() {
    if (!canAdvance) return;
    setStep((s) => Math.min(STEPS.length, s + 1));
  }

  async function handleGenerate() {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const cleanedColors = (brief.custom_colors || [])
        .map((v) => String(v || "").trim())
        .filter((v) => /^#?[0-9a-fA-F]{6}$/.test(v))
        .map((v) => (v.startsWith("#") ? v : `#${v}`).toUpperCase());

      const payload = {
        brand_name: brief.brand_name,
        tagline: brief.tagline,
        business_description: brief.business_description,
        logo_style: brief.logo_style,
        selected_colors: [],
        custom_colors: cleanedColors,
        selected_typography: brief.selected_typography || [],
        reference_links: (brief.reference_links || []).filter(Boolean),
        reference_uploads: brief.reference_uploads || [],
        competitor_links: [],
        competitor_names: "",
        additional_notes: brief.additional_notes || "",
      };

      const res = await withLoading(
        () => apiServices.generate_logo_design({ form: payload, num_images: 4 }),
        LOGO_LOADER_MESSAGES,
        { label: "AI is designing", intervalMs: 2400 }
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
        <LogoDesignView
          images={result.images}
          prompt={result.prompt}
          brandName={brief.brand_name}
          model={result.model}
          seed={result.seed}
          errors={result.errors}
          requested={4}
          tagline={brief.tagline}
          businessDescription={brief.business_description}
          logoStyle={brief.logo_style}
          selectedColors={[]}
          customColors={brief.custom_colors}
          typography={brief.selected_typography}
          statusLabel="Done"
          projectId={result.project_id}
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
          onClick={() => navigate("/new-projects/branding-design/logo")}
        >
          <ArrowLeft size={16} />
          Back to Branding &amp; Design / Logo Design <span className="method-picker-crumb">/ Logo Design Quiz</span>
        </button>
        <button
          type="button"
          className="strategist-header-change"
          onClick={() => navigate("/new-projects/branding-design/logo")}
        >
          <ChevronLeft size={13} /> Change Method
        </button>
      </div>

      <header className="quiz-header">
        <h1>Logo request · Guided quiz</h1>
        <p>
          Answer a few quick questions, choose your preferences, and we&apos;ll use your
          answers to generate logo concepts that match your brand.
        </p>
      </header>

      <ProgressBar step={step} total={STEPS.length} label={STEPS[step - 1]?.name} />

      {error ? <div className="quiz-error">{error}</div> : null}

      <section className="quiz-card">
        {loadingDraft ? (
          <p className="quiz-loading">Loading your form...</p>
        ) : (
          <>
            {step === 1 ? <StepBrand brief={brief} onUpdate={update} /> : null}
            {step === 2 ? <StepBusiness brief={brief} onUpdate={update} /> : null}
            {step === 3 ? <StepStyle brief={brief} onUpdate={update} /> : null}
            {step === 4 ? <StepLook brief={brief} onUpdate={update} /> : null}
            {step === 5 ? <StepFinal brief={brief} onUpdate={update} /> : null}
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
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              className="quiz-next is-ready"
              onClick={handleGenerate}
              disabled={submitting}
            >
              {submitting ? "Generating..." : "Generate my logo"} <ArrowRight size={14} />
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
      <p className="quiz-q-sub">Enter the name that should appear on your logo.</p>
      <label className="quiz-label">Brand or company name*</label>
      <input
        className="quiz-input"
        placeholder="What is the exact name that should appear on the logo?"
        value={brief.brand_name}
        onChange={(e) => onUpdate({ brand_name: e.target.value })}
      />
      <label className="quiz-label">Tagline or slogan (optional)</label>
      <input
        className="quiz-input"
        placeholder="Do you want a tagline included? If yes, please write it here."
        value={brief.tagline}
        onChange={(e) => onUpdate({ tagline: e.target.value })}
      />
    </div>
  );
}

function StepBusiness({ brief, onUpdate }) {
  return (
    <div>
      <h2 className="quiz-q">What does your brand do?</h2>
      <p className="quiz-q-sub">Just a few words, we&apos;ll use this to guide the design direction.</p>
      <label className="quiz-label">Briefly describe what you offer</label>
      <div className="quiz-textarea-wrap">
        <textarea
          className="quiz-textarea"
          rows={3}
          maxLength={160}
          placeholder="Your industry, and your target audience."
          value={brief.business_description}
          onChange={(e) => onUpdate({ business_description: e.target.value })}
        />
        <span className="quiz-textarea-count">
          {brief.business_description.length}/160
        </span>
      </div>
      <label className="quiz-label">What industry are you in?</label>
      <div className="quiz-chip-grid">
        {INDUSTRIES.map((ind) => (
          <button
            key={ind.id}
            type="button"
            className={`quiz-chip ${brief.industry === ind.id ? "is-selected" : ""}`}
            onClick={() => onUpdate({ industry: ind.id })}
          >
            {ind.icon ? <span className="quiz-chip-icon">{ind.icon}</span> : null}
            {ind.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepStyle({ brief, onUpdate }) {
  return (
    <div>
      <h2 className="quiz-q">What kind of logo feels right?</h2>
      <p className="quiz-q-sub">Pick one style that best matches the vibe you&apos;re going for.</p>
      <div className="quiz-style-grid">
        {STYLE_CARDS.map((s) => {
          const selected = brief.logo_style === s.id;
          return (
            <button
              key={s.id}
              type="button"
              className={`quiz-style-card ${selected ? "is-selected" : ""}`}
              onClick={() => onUpdate({ logo_style: s.id })}
            >
              <span className="quiz-style-radio" />
              <div className="quiz-style-text">
                <strong>{s.title}</strong>
                <span>{s.blurb}</span>
              </div>
              <div className="quiz-style-thumb">
                {s.ref ? <img src={s.ref} alt={`${s.title} example`} /> : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepLook({ brief, onUpdate }) {
  function toggleTypo(id) {
    const arr = brief.selected_typography || [];
    const next = arr.includes(id) ? arr.filter((v) => v !== id) : [...arr, id];
    onUpdate({ selected_typography: next });
  }
  return (
    <div>
      <h2 className="quiz-q">What&apos;s the color mood?</h2>
      <p className="quiz-q-sub">Choose 2 to 3 colors that resonate with your brand personality.</p>
      <ColorPicker
        value={brief.custom_colors}
        onChange={(next) => onUpdate({ custom_colors: next })}
        slotCount={3}
        max={3}
      />
      <label className="quiz-label" style={{ marginTop: "1.4rem" }}>What typography feel fits best?</label>
      <div className="quiz-typo-grid">
        {TYPOGRAPHY.map((t) => {
          const selected = (brief.selected_typography || []).includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              className={`quiz-typo-card ${selected ? "is-selected" : ""}`}
              onClick={() => toggleTypo(t.id)}
            >
              <span className="quiz-typo-radio" />
              <span className="quiz-typo-sample" style={t.style}>Aa Bb Cc</span>
              <strong>{t.name}</strong>
              <span className="quiz-typo-blurb">{t.blurb}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepFinal({ brief, onUpdate }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function updateRef(idx, value) {
    const arr = [...(brief.reference_links || ["", ""])];
    arr[idx] = value;
    onUpdate({ reference_links: arr });
  }

  async function handleFileChange(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    setUploading(true);
    setUploadError("");
    try {
      for (const file of files) {
        const res = await apiServices.upload_file(file, {
          projectName: brief.brand_name || "Logo Design Request",
          category: "Branding & Design",
          serviceType: "logo_design",
        });
        if (res?.success && res?.file?.url) {
          onUpdate({
            reference_uploads: [
              ...(brief.reference_uploads || []),
              { url: res.file.url, name: file.name },
            ],
          });
        } else {
          throw new Error(res?.message || "Upload failed");
        }
      }
    } catch (err) {
      setUploadError(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <h2 className="quiz-q">Almost done <span className="quiz-q-accent">any references?</span></h2>
      <p className="quiz-q-sub">Logos or brands you admire. This is 100% optional but speeds things up.</p>
      {[0, 1].map((i) => (
        <div key={i}>
          <label className="quiz-label">
            Reference logo or brand #{i + 1} <span className="quiz-label-muted">(optional)</span>
          </label>
          <div className="quiz-input-with-icon">
            <button
              type="button"
              className="quiz-attach-btn"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach a reference file"
              disabled={uploading}
            >
              <Paperclip size={14} />
            </button>
            <input
              className="quiz-input"
              placeholder="Upload file or paste the link"
              value={brief.reference_links?.[i] || ""}
              onChange={(e) => updateRef(i, e.target.value)}
            />
          </div>
        </div>
      ))}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {uploadError ? <div className="quiz-error" style={{ marginTop: 8 }}>{uploadError}</div> : null}

      {(brief.reference_uploads || []).length ? (
        <ul className="upload-chip-list" style={{ marginTop: 8 }}>
          {brief.reference_uploads.map((f, i) => (
            <li key={i} className="upload-chip">
              <Paperclip size={12} />
              <a href={f.url} target="_blank" rel="noreferrer">{f.name || `file-${i + 1}`}</a>
            </li>
          ))}
        </ul>
      ) : null}

      <label className="quiz-label" style={{ marginTop: "1rem" }}>
        Anything else we should know? <span className="quiz-label-muted">(optional)</span>
      </label>
      <textarea
        className="quiz-textarea"
        rows={3}
        placeholder="Special requests, things to avoid, target audience details..."
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
StepBrand.propTypes = stepPropTypes;
StepBusiness.propTypes = stepPropTypes;
StepStyle.propTypes = stepPropTypes;
StepLook.propTypes = stepPropTypes;
StepFinal.propTypes = stepPropTypes;

ProgressBar.propTypes = {
  step: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  label: PropTypes.string,
};
