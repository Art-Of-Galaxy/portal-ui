import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react";
import { apiServices } from "../../services/apiServices";
import { useLoading } from "../../context/LoadingContext";
import PrintingDesignView from "./PrintingDesignView";
import BrandAssetUploader from "../../components/brand/BrandAssetUploader";

// Self-guided 5 step Printing Design brief. Mirrors the flow shown in
// 4_printing_flow.html: pick a format, then format-specific specs, then
// the project, content state, and visual style.

const STEPS = [
  { id: 1, name: "Print Format",     icon: "🖨️" },
  { id: 2, name: "Format & Size",    icon: "📄" },
  { id: 3, name: "Your Project",     icon: "✏️" },
  { id: 4, name: "Content",          icon: "📝" },
  { id: 5, name: "Style & Notes",    icon: "🎨" },
];

const TYPE_OPTIONS = [
  { id: "brochure", emoji: "📋", title: "Brochure",       desc: "Multi-panel folded piece, ideal for product sheets, company profiles, events" },
  { id: "ebook",    emoji: "📖", title: "Ebook / Guide",  desc: "Multi-page digital or print document, lead magnets, training materials, reports" },
  { id: "flyer",    emoji: "📢", title: "Flyer",          desc: "Single-page, high-impact piece, promotions, announcements, events" },
  { id: "poster",   emoji: "🖼️", title: "Poster",         desc: "Large-format single-sided print, wall, retail, event, or campaign display" },
];

// Per-format size options. Mirrors the source HTML but trimmed to the
// most common picks per format.
const SIZE_OPTIONS = {
  brochure: [
    { id: "A4",          label: "A4",          dims: "210x297mm" },
    { id: "A5",          label: "A5",          dims: "148x210mm" },
    { id: "DL",          label: "DL",          dims: "99x210mm" },
    { id: "A3",          label: "A3",          dims: "297x420mm" },
    { id: "Square 210",  label: "Square",      dims: "210x210mm" },
    { id: "Letter",      label: "Letter",      dims: "8.5x11in" },
    { id: "Half Letter", label: "Half Letter", dims: "5.5x8.5in" },
    { id: "Legal",       label: "Legal",       dims: "8.5x14in" },
  ],
  flyer: [
    { id: "DL",          label: "DL",          dims: "99x210mm" },
    { id: "A4",          label: "A4",          dims: "210x297mm" },
    { id: "A5",          label: "A5",          dims: "148x210mm" },
    { id: "Letter",      label: "Letter",      dims: "8.5x11in" },
    { id: "Half Letter", label: "Half Letter", dims: "5.5x8.5in" },
    { id: "Tabloid",     label: "Tabloid",     dims: "11x17in" },
  ],
  poster: [
    { id: "Small 11x17", label: "Small",  dims: "11x17in" },
    { id: "Medium 18x24", label: "Medium", dims: "18x24in" },
    { id: "Large 24x36",  label: "Large",  dims: "24x36in" },
    { id: "Movie 27x40",  label: "Movie",  dims: "27x40in" },
  ],
};

const FOLD_OPTIONS = [
  { id: "bifold",   label: "Bifold" },
  { id: "trifold",  label: "Trifold" },
  { id: "zfold",    label: "Z-Fold" },
  { id: "gatefold", label: "Gatefold" },
  { id: "rollfold", label: "Roll-Fold" },
];

const EBOOK_GOAL_OPTIONS = [
  { id: "educate",             label: "Educate my audience" },
  { id: "leads",               label: "Generate leads or downloads" },
  { id: "attract_clients",     label: "Attract new clients" },
  { id: "train_team",          label: "Train my team" },
  { id: "establish_authority", label: "Establish authority" },
];

const EBOOK_LENGTH_OPTIONS = [
  { id: "under_20",  label: "Under 20 pages" },
  { id: "20_to_50",  label: "20 to 50 pages" },
  { id: "50_to_100", label: "50 to 100 pages" },
  { id: "100_plus",  label: "100+ pages" },
  { id: "unknown",   label: "Not sure yet" },
];

const EBOOK_LANG_OPTIONS = [
  { id: "en",         label: "English" },
  { id: "es",         label: "Spanish" },
  { id: "bilingual",  label: "Bilingual EN/ES" },
  { id: "other",      label: "Other" },
];

const CONTENT_STATUS_OPTIONS = [
  { id: "ready", emoji: "✅", title: "Ready to go",      desc: "Fully written, just needs layout" },
  { id: "draft", emoji: "📝", title: "I have a draft",   desc: "Needs editing or refinement" },
  { id: "need",  emoji: "✍️", title: "Need copy written", desc: "Start from scratch, we handle it" },
];

const TONE_OPTIONS = [
  { id: "bold",     label: "Bold and impactful" },
  { id: "clean",    label: "Clean and professional" },
  { id: "warm",     label: "Warm and friendly" },
  { id: "elegant",  label: "Elegant and premium" },
  { id: "playful",  label: "Playful and creative" },
  { id: "dark",     label: "Dark and edgy" },
  { id: "minimal",  label: "Minimal and editorial" },
];

const ASSETS_OPTIONS = [
  { id: "yes",        title: "Yes, sending assets",  desc: "Logo, colors, fonts or style guide" },
  { id: "logo_only",  title: "Logo only",            desc: "We will pick the palette and type" },
  { id: "no",         title: "No assets yet",        desc: "Design freely or match our website" },
];

const emptyBrief = {
  type: "",
  size: "",
  fold: "",
  ebook_title: "",
  ebook_topic: "",
  ebook_audience: "",
  ebook_goal: "",
  ebook_length: "",
  ebook_language: "",
  brand_name: "",
  purpose: "",
  audience: "",
  content_status: "",
  content_text: "",
  content_uploads: [],
  ctas: "",
  visual_tone: [],
  has_assets: "",
  brand_assets: [],
  refs: "",
  notes: "",
};

export default function PrintingDesignQuiz() {
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
        const res = await apiServices.quiz_draft_start({ service: "printing_design" });
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
    if (step === 1) return Boolean(brief.type);
    if (step === 3) return brief.brand_name.trim().length > 0 && brief.purpose.trim().length > 0;
    return true;
  }, [step, brief]);

  function goBack() {
    if (step === 1) {
      navigate("/new-projects/branding-design/printing");
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
        () => apiServices.generate_printing_design({ form: brief }),
        [
          "Reading your print brief...",
          "Calibrating the timeline to your format...",
          "Drafting the deliverable list...",
          "Refining the visual direction...",
          "Lining up your next steps...",
          "Almost there...",
        ],
        { label: "AI is briefing", intervalMs: 2200 }
      );
      if (!res?.success) throw new Error(res?.message || "Submit failed");
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
        <PrintingDesignView
          brief={result.brief}
          brandName={brief.brand_name}
          description={brief.purpose}
          statusLabel="In Progress"
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
          onClick={() => navigate("/new-projects/branding-design/printing")}
        >
          <ArrowLeft size={16} />
          Back to Branding &amp; Design / Printing Design <span className="method-picker-crumb">/ Guided brief</span>
        </button>
        <button
          type="button"
          className="strategist-header-change"
          onClick={() => navigate("/new-projects/branding-design/printing")}
        >
          <ChevronLeft size={13} /> Change Method
        </button>
      </div>

      <header className="quiz-header">
        <h1>Printing Design · Guided brief</h1>
        <p>
          Pick your format, share the specs and the goal, and our team will pick it up from there.
        </p>
      </header>

      <ProgressBar step={step} total={STEPS.length} label={STEPS[step - 1]?.name} />

      {error ? <div className="quiz-error">{error}</div> : null}

      <section className="quiz-card">
        {loadingDraft ? (
          <p className="quiz-loading">Loading your brief...</p>
        ) : (
          <>
            <div className="bg-quiz-step-icon" aria-hidden="true">{STEPS[step - 1]?.icon}</div>
            {step === 1 ? <StepFormat brief={brief} onUpdate={update} /> : null}
            {step === 2 ? <StepSpecs brief={brief} onUpdate={update} /> : null}
            {step === 3 ? <StepProject brief={brief} onUpdate={update} /> : null}
            {step === 4 ? <StepContent brief={brief} onUpdate={update} /> : null}
            {step === 5 ? <StepStyle brief={brief} onUpdate={update} /> : null}
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
              {submitting ? "Submitting..." : "Submit my brief"} <ArrowRight size={14} />
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}

// ---------- Steps ----------

function StepFormat({ brief, onUpdate }) {
  return (
    <div>
      <h2 className="quiz-q">What are you creating?</h2>
      <p className="quiz-q-sub">This shapes the rest of the brief. Each format has its own specs and workflow.</p>
      <div className="bg-quiz-option-grid is-2col">
        {TYPE_OPTIONS.map((o) => {
          const sel = brief.type === o.id;
          return (
            <button
              key={o.id}
              type="button"
              className={`bg-quiz-option-card ${sel ? "is-selected" : ""}`}
              onClick={() => onUpdate({ type: o.id, size: "", fold: "" })}
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
    </div>
  );
}

function StepSpecs({ brief, onUpdate }) {
  if (brief.type === "ebook") return <StepSpecsEbook brief={brief} onUpdate={onUpdate} />;
  const isBrochure = brief.type === "brochure";
  const sizes = SIZE_OPTIONS[brief.type] || [];
  return (
    <div>
      <h2 className="quiz-q">
        {brief.type === "poster" ? "What poster size do you need?"
          : brief.type === "flyer" ? "What flyer size do you need?"
            : "Choose your size and fold"}
      </h2>
      <p className="quiz-q-sub">
        {brief.type === "poster" ? "Pick the closest standard size or describe a custom one below."
          : isBrochure ? "Select the finished flat size and the folding style."
            : "Select the final trimmed size for your flyer."}
      </p>
      <label className="quiz-label">Paper size</label>
      <div className="pd-quiz-size-grid">
        {sizes.map((s) => {
          const sel = brief.size === s.id;
          return (
            <button
              key={s.id}
              type="button"
              className={`pd-quiz-size-card ${sel ? "is-selected" : ""}`}
              onClick={() => onUpdate({ size: s.id })}
            >
              <span className="pd-quiz-size-rect">{s.label}</span>
              <span className="pd-quiz-size-name">{s.label}</span>
              <span className="pd-quiz-size-dims">{s.dims}</span>
            </button>
          );
        })}
      </div>
      <label className="quiz-label" style={{ marginTop: "1rem" }}>
        Or describe a custom size <span className="quiz-label-muted">(optional)</span>
      </label>
      <input
        className="quiz-input"
        placeholder="e.g. 200x250mm or 9x12in"
        value={brief.size && !sizes.some((s) => s.id === brief.size) ? brief.size : ""}
        onChange={(e) => onUpdate({ size: e.target.value })}
      />
      {isBrochure ? (
        <>
          <label className="quiz-label" style={{ marginTop: "1.2rem" }}>Fold style</label>
          <div className="bg-quiz-chip-grid">
            {FOLD_OPTIONS.map((f) => {
              const sel = brief.fold === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  className={`bg-quiz-chip ${sel ? "is-selected" : ""}`}
                  onClick={() => onUpdate({ fold: f.id })}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

function StepSpecsEbook({ brief, onUpdate }) {
  return (
    <div>
      <h2 className="quiz-q">Tell us about your ebook</h2>
      <p className="quiz-q-sub">We just need the basics to shape the brief, your strategist will gather the rest.</p>
      <label className="quiz-label">
        Ebook title <span className="quiz-label-muted">(provisional is fine)</span>
      </label>
      <input
        className="quiz-input"
        placeholder='e.g. "The Complete Guide to Clean Eating"'
        value={brief.ebook_title}
        onChange={(e) => onUpdate({ ebook_title: e.target.value })}
      />
      <label className="quiz-label">Main topic or focus area</label>
      <input
        className="quiz-input"
        placeholder="e.g. Nutrition for busy professionals over 40"
        value={brief.ebook_topic}
        onChange={(e) => onUpdate({ ebook_topic: e.target.value })}
      />
      <label className="quiz-label">Who is this for?</label>
      <input
        className="quiz-input"
        placeholder="e.g. First-time entrepreneurs, HR managers"
        value={brief.ebook_audience}
        onChange={(e) => onUpdate({ ebook_audience: e.target.value })}
      />
      <label className="quiz-label">Main objective of the ebook</label>
      <div className="bg-quiz-chip-grid">
        {EBOOK_GOAL_OPTIONS.map((o) => {
          const sel = brief.ebook_goal === o.id;
          return (
            <button
              key={o.id}
              type="button"
              className={`bg-quiz-chip ${sel ? "is-selected" : ""}`}
              onClick={() => onUpdate({ ebook_goal: o.id })}
            >{o.label}</button>
          );
        })}
      </div>
      <label className="quiz-label" style={{ marginTop: "1rem" }}>
        Estimated length <span className="quiz-label-muted">(optional)</span>
      </label>
      <div className="bg-quiz-chip-grid">
        {EBOOK_LENGTH_OPTIONS.map((o) => {
          const sel = brief.ebook_length === o.id;
          return (
            <button
              key={o.id}
              type="button"
              className={`bg-quiz-chip ${sel ? "is-selected" : ""}`}
              onClick={() => onUpdate({ ebook_length: o.id })}
            >{o.label}</button>
          );
        })}
      </div>
      <label className="quiz-label" style={{ marginTop: "1rem" }}>Language</label>
      <div className="bg-quiz-chip-grid">
        {EBOOK_LANG_OPTIONS.map((o) => {
          const sel = brief.ebook_language === o.id;
          return (
            <button
              key={o.id}
              type="button"
              className={`bg-quiz-chip ${sel ? "is-selected" : ""}`}
              onClick={() => onUpdate({ ebook_language: o.id })}
            >{o.label}</button>
          );
        })}
      </div>
    </div>
  );
}

function StepProject({ brief, onUpdate }) {
  const isEbook = brief.type === "ebook";
  return (
    <div>
      <h2 className="quiz-q">Your project</h2>
      <p className="quiz-q-sub">This goes on the brief and helps the designer understand context and goals.</p>
      <label className="quiz-label">
        {isEbook ? "What brand is publishing this ebook?" : "What brand or company is this for?"}
      </label>
      <input
        className="quiz-input"
        placeholder="e.g. NovaBrew Co."
        value={brief.brand_name}
        onChange={(e) => onUpdate({ brand_name: e.target.value })}
      />
      <label className="quiz-label">
        What is this {brief.type || "piece"} promoting or communicating?
      </label>
      <div className="quiz-textarea-wrap">
        <textarea
          className="quiz-textarea"
          rows={3}
          maxLength={240}
          placeholder={isEbook
            ? "e.g. Promote our coaching program and drive consultation bookings"
            : "e.g. Promote our seasonal menu launch at two restaurant locations"}
          value={brief.purpose}
          onChange={(e) => onUpdate({ purpose: e.target.value })}
        />
        <span className="quiz-textarea-count">{brief.purpose.length}/240</span>
      </div>
      <label className="quiz-label">Who is the target audience?</label>
      <input
        className="quiz-input"
        placeholder="e.g. Wellness-focused millennials, B2B decision-makers"
        value={brief.audience}
        onChange={(e) => onUpdate({ audience: e.target.value })}
      />
    </div>
  );
}

function StepContent({ brief, onUpdate }) {
  const isEbook = brief.type === "ebook";
  return (
    <div>
      <h2 className="quiz-q">Content</h2>
      <p className="quiz-q-sub">
        {isEbook
          ? "Tell us where you are with the content and paste what you have."
          : `Share the copy for your ${brief.type || "piece"}, headlines, body text, contact info, CTAs.`}
      </p>
      <label className="quiz-label">Where are you with the content?</label>
      <div className="bg-quiz-option-grid is-2col">
        {CONTENT_STATUS_OPTIONS.map((o) => {
          const sel = brief.content_status === o.id;
          return (
            <button
              key={o.id}
              type="button"
              className={`bg-quiz-option-card ${sel ? "is-selected" : ""}`}
              onClick={() => onUpdate({ content_status: o.id })}
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
      {brief.content_status !== "need" ? (
        <>
          <label className="quiz-label" style={{ marginTop: "1.2rem" }}>
            Paste your content here <span className="quiz-label-muted">(or upload below)</span>
          </label>
          <textarea
            className="quiz-textarea"
            rows={5}
            placeholder={isEbook
              ? "Paste your chapter outline, key sections, or full text here..."
              : "Include headlines, body copy, contact details, CTAs. All the text the designer should use."}
            value={brief.content_text}
            onChange={(e) => onUpdate({ content_text: e.target.value })}
          />
          <div style={{ marginTop: "0.8rem" }}>
            <BrandAssetUploader
              value={brief.content_uploads || []}
              onChange={(next) => onUpdate({ content_uploads: next })}
              projectName={brief.brand_name || "Printing Design Request"}
              accept=".doc,.docx,.pdf,.txt,.rtf,.md"
              label="Or upload a content file (optional)"
              helper="DOCX, PDF, or plain text. We'll fit the content to the layout for you."
            />
          </div>
        </>
      ) : (
        <div className="pd-quiz-callout">
          ✍️ No problem. Our copywriter will draft the content based on your brand and goals. We&apos;ll ask for more details during the kickoff call.
        </div>
      )}
      {isEbook ? (
        <>
          <label className="quiz-label" style={{ marginTop: "1.2rem" }}>
            Do you want to include calls to action (CTAs)? <span className="quiz-label-muted">(optional)</span>
          </label>
          <input
            className="quiz-input"
            placeholder='e.g. "Book a free call", "Download the workbook"'
            value={brief.ctas}
            onChange={(e) => onUpdate({ ctas: e.target.value })}
          />
        </>
      ) : null}
    </div>
  );
}

function StepStyle({ brief, onUpdate }) {
  function toggleTone(id) {
    const cur = brief.visual_tone || [];
    onUpdate({ visual_tone: cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id] });
  }
  return (
    <div>
      <h2 className="quiz-q">Style &amp; final details</h2>
      <p className="quiz-q-sub">Help us dial in the visual direction and share any assets or references.</p>
      <label className="quiz-label">Visual tone, how should this piece feel?</label>
      <div className="bg-quiz-chip-grid">
        {TONE_OPTIONS.map((o) => {
          const sel = (brief.visual_tone || []).includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              className={`bg-quiz-chip ${sel ? "is-selected" : ""}`}
              onClick={() => toggleTone(o.id)}
            >{o.label}</button>
          );
        })}
      </div>
      <label className="quiz-label" style={{ marginTop: "1.2rem" }}>
        Do you have brand assets to share? <span className="quiz-label-muted">(logo, colors, fonts, style guide)</span>
      </label>
      <div className="bg-quiz-option-grid is-2col">
        {ASSETS_OPTIONS.map((o) => {
          const sel = brief.has_assets === o.id;
          return (
            <button
              key={o.id}
              type="button"
              className={`bg-quiz-option-card ${sel ? "is-selected" : ""}`}
              onClick={() => onUpdate({ has_assets: o.id })}
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
      {brief.has_assets === "yes" || brief.has_assets === "logo_only" ? (
        <div style={{ marginTop: "1rem" }}>
          <BrandAssetUploader
            value={brief.brand_assets || []}
            onChange={(next) => onUpdate({ brand_assets: next })}
            projectName={brief.brand_name || "Printing Design Request"}
            label="Upload your brand files"
            helper="Logo (vector preferred), color codes, fonts, existing style guide. AI, PDF, PNG, SVG, ZIP accepted."
            accept="image/*,application/pdf,.ai,.eps,.svg,.zip"
          />
        </div>
      ) : null}
      <label className="quiz-label" style={{ marginTop: "1.2rem" }}>
        Any reference examples you like? <span className="quiz-label-muted">(optional)</span>
      </label>
      <input
        className="quiz-input"
        placeholder="Paste a URL or name a brand or campaign you admire"
        value={brief.refs}
        onChange={(e) => onUpdate({ refs: e.target.value })}
      />
      <label className="quiz-label">
        Additional notes or requests <span className="quiz-label-muted">(optional)</span>
      </label>
      <textarea
        className="quiz-textarea"
        rows={3}
        placeholder="Deadlines, language requirements, things to avoid, special requests..."
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

const stepPropTypes = {
  brief: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
};
StepFormat.propTypes      = stepPropTypes;
StepSpecs.propTypes       = stepPropTypes;
StepSpecsEbook.propTypes  = stepPropTypes;
StepProject.propTypes     = stepPropTypes;
StepContent.propTypes     = stepPropTypes;
StepStyle.propTypes       = stepPropTypes;

ProgressBar.propTypes = {
  step: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  label: PropTypes.string,
};
