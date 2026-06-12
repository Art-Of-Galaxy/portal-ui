import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react";
import { apiServices } from "../../services/apiServices";
import { useLoading } from "../../context/LoadingContext";
import PackagingDesignView from "./PackagingDesignView";
import BrandAssetUploader from "../../components/brand/BrandAssetUploader";

// Self-guided 5 step Packaging Design spec form. Mirrors the flow shown
// in 3_packaging_flow.html: pick a package type, then style/variant
// (subtype grid that changes per type), then product info, then size +
// finish, then files + notes.

const STEPS = [
  { id: 1, name: "Package Type",  icon: "📦" },
  { id: 2, name: "Style",         icon: "🎁" },
  { id: 3, name: "Product Info",  icon: "✏️" },
  { id: 4, name: "Size & Finish", icon: "📐" },
  { id: 5, name: "Files & Notes", icon: "📎" },
];

const PACKAGE_TYPES = [
  { id: "box",    emoji: "📦", title: "Box",            desc: "Folding cartons, retail and display boxes" },
  { id: "label",  emoji: "🏷️", title: "Label",          desc: "Roll labels, flat labels, peel-off" },
  { id: "shrink", emoji: "🍶", title: "Shrink Sleeve",  desc: "Full body, cap sleeve, tamper band" },
  { id: "bags",   emoji: "🛍️", title: "Bags & Pouches", desc: "Stand-up, flat, gusset, spout bags" },
];

const SUBTYPES = {
  box: [
    { n: "01", label: "Straight Tuck End" },
    { n: "02", label: "Reverse Tuck End" },
    { n: "03", label: "Sleeve / Slide" },
    { n: "04", label: "Display / Tray" },
    { n: "05", label: "Cylinder / Tube" },
    { n: "06", label: "Auto-Bottom" },
    { n: "07", label: "Drawer Box" },
    { n: "08", label: "Hanging Tab" },
    { n: "09", label: "Shoulder Box" },
    { n: "10", label: "Magnetic Closure" },
    { n: "11", label: "Lid & Base (2-piece)" },
    { n: "12", label: "Flat / Folding" },
    { n: "13", label: "Trifold Mailer" },
    { n: "14", label: "Partition / Divider" },
    { n: "15", label: "Window Box" },
  ],
  label: [
    { n: "01", label: "Standard Label",  desc: "Single-layer, applied to flat or round surfaces" },
    { n: "02", label: "Peel-Off Label", desc: "Two-layer label, inner reveals coupons or extra info" },
  ],
  shrink: [
    { n: "01", label: "Full Body Sleeve",   desc: "360° full coverage from top to bottom" },
    { n: "02", label: "Full Body + Cap",    desc: "Full body sleeve extending over the cap" },
    { n: "03", label: "Tamper Evident Band", desc: "Narrow band around neck or lid for tamper evidence" },
  ],
  bags: [
    { n: "01", label: "3-Side Sealed" },
    { n: "02", label: "Stand-Up Gusset" },
    { n: "03", label: "3-Side + Zipper" },
    { n: "04", label: "Stand-Up + Zipper" },
    { n: "05", label: "Back-Seal Pouch" },
    { n: "06", label: "Side Gusset" },
    { n: "07", label: "Flat Bottom + Zipper" },
    { n: "08", label: "Special Shape" },
    { n: "09", label: "Roll Film" },
    { n: "10", label: "Spout Bag" },
  ],
};

const FINISHES_BY_TYPE = {
  box:    ["Matte", "Gloss", "Lamination", "Spot UV", "Embossing", "Hologram", "Hot Stamping / Foil", "Soft Touch", "Window cutout", "White Support"],
  label:  ["Matte", "Gloss", "Lamination", "Spot UV", "Hot Stamping / Foil"],
  shrink: ["Matte", "Gloss", "Full color print", "Spot UV"],
  bags:   ["Matte", "Gloss", "Lamination", "Spot UV", "Embossing", "Hologram", "Hot Stamping / Foil", "Soft Touch", "Window cutout"],
};

const BAG_FEATURES = ["Zipper", "Tear Notch", "Child Resistant", "Hanging Hole", "Rounded Corners"];

const ECO_OPTIONS = [
  { id: "yes",  label: "✓ Yes please" },
  { id: "no",   label: "Standard materials" },
  { id: "open", label: "Open to suggestions" },
];

const emptyBrief = {
  package_type: "",
  subtype: "",
  brand_name: "",
  product_name: "",
  product_desc: "",
  sku_count: "",
  dim_w: "",
  dim_h: "",
  dim_d: "",
  dim_unit: "in",
  finishes: [],
  bag_features: [],
  eco: "",
  has_files: "",
  brand_assets: [],
  inner_notes: "",
  notes: "",
};

export default function PackagingDesignQuiz() {
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
        const res = await apiServices.quiz_draft_start({ service: "packaging_design" });
        if (cancelled) return;
        if (!res?.success) throw new Error(res?.message || "Could not start the spec form.");
        setDraftId(res.draft.id);
        setStep(Math.min(Math.max(res.draft.step || 1, 1), STEPS.length));
        setBrief({ ...emptyBrief, ...(res.draft.brief || {}) });
      } catch (err) {
        if (!cancelled) setError(err?.message || "Could not start the spec form.");
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
    if (step === 1) return Boolean(brief.package_type);
    if (step === 3) return brief.brand_name.trim().length > 0 && brief.product_name.trim().length > 0;
    return true;
  }, [step, brief]);

  function goBack() {
    if (step === 1) {
      navigate("/new-projects/branding-design/packaging");
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
        () => apiServices.generate_packaging_design({ form: brief }),
        [
          "Reading your packaging spec...",
          "Pairing dieline templates to your style...",
          "Calibrating the timeline to your SKU count...",
          "Drafting the deliverable list...",
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
        <PackagingDesignView
          brief={result.brief}
          brandName={brief.brand_name}
          description={brief.product_desc || brief.product_name}
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
          onClick={() => navigate("/new-projects/branding-design/packaging")}
        >
          <ArrowLeft size={16} />
          Back to Branding &amp; Design / Packaging Design <span className="method-picker-crumb">/ Spec form</span>
        </button>
        <button
          type="button"
          className="strategist-header-change"
          onClick={() => navigate("/new-projects/branding-design/packaging")}
        >
          <ChevronLeft size={13} /> Change Method
        </button>
      </div>

      <header className="quiz-header">
        <h1>Packaging Design · Spec form</h1>
        <p>
          Pick your package type, share the specs and the goal, and our team will pick it up from there.
        </p>
      </header>

      <ProgressBar step={step} total={STEPS.length} label={STEPS[step - 1]?.name} />

      {error ? <div className="quiz-error">{error}</div> : null}

      <section className="quiz-card">
        {loadingDraft ? (
          <p className="quiz-loading">Loading your spec form...</p>
        ) : (
          <>
            <div className="bg-quiz-step-icon" aria-hidden="true">{STEPS[step - 1]?.icon}</div>
            {step === 1 ? <StepType    brief={brief} onUpdate={update} /> : null}
            {step === 2 ? <StepStyle   brief={brief} onUpdate={update} /> : null}
            {step === 3 ? <StepProduct brief={brief} onUpdate={update} /> : null}
            {step === 4 ? <StepSpecs   brief={brief} onUpdate={update} /> : null}
            {step === 5 ? <StepFiles   brief={brief} onUpdate={update} /> : null}
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
              {submitting ? "Submitting..." : "Submit packaging brief"} <ArrowRight size={14} />
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}

// ---------- Steps ----------

function StepType({ brief, onUpdate }) {
  return (
    <div>
      <h2 className="quiz-q">What type of packaging do you need?</h2>
      <p className="quiz-q-sub">This determines the rest of the form. You can always add more package types later.</p>
      <div className="bg-quiz-option-grid is-2col">
        {PACKAGE_TYPES.map((o) => {
          const sel = brief.package_type === o.id;
          return (
            <button
              key={o.id}
              type="button"
              className={`bg-quiz-option-card ${sel ? "is-selected" : ""}`}
              onClick={() => onUpdate({ package_type: o.id, subtype: "", finishes: [], bag_features: [] })}
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

function StepStyle({ brief, onUpdate }) {
  const type = brief.package_type || "box";
  const items = SUBTYPES[type] || [];
  const label = {
    box:    "Select the box style",
    label:  "Select the label type",
    shrink: "Select the shrink sleeve type",
    bags:   "Select the bag style",
  }[type];
  return (
    <div>
      <h2 className="quiz-q">{label}</h2>
      <p className="quiz-q-sub">Pick the one that best matches what you have in mind. Not sure? Choose the closest, we&apos;ll refine in production.</p>
      <div className={`pk-subtype-grid ${items.length <= 3 ? "is-roomy" : "is-compact"}`}>
        {items.map((s) => {
          const sel = brief.subtype === s.n;
          return (
            <button
              key={s.n}
              type="button"
              className={`pk-subtype-card ${sel ? "is-selected" : ""}`}
              onClick={() => onUpdate({ subtype: s.n })}
            >
              <span className="pk-subtype-num">{s.n}</span>
              <span className="pk-subtype-label">{s.label}</span>
              {s.desc ? <span className="pk-subtype-desc">{s.desc}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepProduct({ brief, onUpdate }) {
  return (
    <div>
      <h2 className="quiz-q">Tell us about your product</h2>
      <p className="quiz-q-sub">This goes on the packaging brief and helps the designer understand context.</p>
      <label className="quiz-label">Brand name</label>
      <input
        className="quiz-input"
        placeholder="e.g. NovaBrew"
        value={brief.brand_name}
        onChange={(e) => onUpdate({ brand_name: e.target.value })}
      />
      <label className="quiz-label">Product name</label>
      <input
        className="quiz-input"
        placeholder="e.g. Cold Brew Concentrate 32oz"
        value={brief.product_name}
        onChange={(e) => onUpdate({ product_name: e.target.value })}
      />
      <label className="quiz-label">
        Brief description <span className="quiz-label-muted">(optional)</span>
      </label>
      <textarea
        className="quiz-textarea"
        rows={3}
        placeholder="What's inside? Who is it for? Any regulatory info (e.g. food, supplement, cosmetic)?"
        value={brief.product_desc}
        onChange={(e) => onUpdate({ product_desc: e.target.value })}
      />
      <label className="quiz-label">
        How many SKUs / variants? <span className="quiz-label-muted">(optional)</span>
      </label>
      <input
        className="quiz-input"
        placeholder="e.g. 3 flavors, 2 sizes"
        value={brief.sku_count}
        onChange={(e) => onUpdate({ sku_count: e.target.value })}
      />
    </div>
  );
}

function StepSpecs({ brief, onUpdate }) {
  function toggleFinish(value) {
    const cur = brief.finishes || [];
    onUpdate({ finishes: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] });
  }
  function toggleBagFeature(value) {
    const cur = brief.bag_features || [];
    onUpdate({ bag_features: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] });
  }
  const finishes = FINISHES_BY_TYPE[brief.package_type] || FINISHES_BY_TYPE.box;
  return (
    <div>
      <h2 className="quiz-q">Size &amp; finish</h2>
      <p className="quiz-q-sub">Enter the packaging dimensions and choose your desired finish. These are the two most critical specs for production.</p>
      <label className="quiz-label" style={{ marginBottom: 8 }}>Dimensions</label>
      <div className="pk-unit-row">
        <div className="pk-unit-toggle">
          <button
            type="button"
            className={`pk-unit-btn ${brief.dim_unit === "in" ? "is-active" : ""}`}
            onClick={() => onUpdate({ dim_unit: "in" })}
          >inches</button>
          <button
            type="button"
            className={`pk-unit-btn ${brief.dim_unit === "mm" ? "is-active" : ""}`}
            onClick={() => onUpdate({ dim_unit: "mm" })}
          >mm</button>
        </div>
        <span className="pk-unit-hint">Width × Height × Depth</span>
      </div>
      <div className="pk-dim-row">
        <div className="pk-dim-field">
          <div className="pk-dim-label">Width ({brief.dim_unit})</div>
          <input
            type="text"
            className="pk-dim-input"
            placeholder="W"
            value={brief.dim_w}
            onChange={(e) => onUpdate({ dim_w: e.target.value })}
          />
        </div>
        <div className="pk-dim-field">
          <div className="pk-dim-label">Height ({brief.dim_unit})</div>
          <input
            type="text"
            className="pk-dim-input"
            placeholder="H"
            value={brief.dim_h}
            onChange={(e) => onUpdate({ dim_h: e.target.value })}
          />
        </div>
        <div className="pk-dim-field">
          <div className="pk-dim-label">Depth ({brief.dim_unit})</div>
          <input
            type="text"
            className="pk-dim-input"
            placeholder="D"
            value={brief.dim_d}
            onChange={(e) => onUpdate({ dim_d: e.target.value })}
          />
        </div>
      </div>
      <label className="quiz-label" style={{ marginTop: "1.2rem" }}>
        Finish &amp; coating <span className="quiz-label-muted">(select all that apply)</span>
      </label>
      <div className="bg-quiz-chip-grid">
        {finishes.map((f) => {
          const sel = (brief.finishes || []).includes(f);
          return (
            <button
              key={f}
              type="button"
              className={`bg-quiz-chip ${sel ? "is-selected" : ""}`}
              onClick={() => toggleFinish(f)}
            >{f}</button>
          );
        })}
      </div>
      {brief.package_type === "bags" ? (
        <>
          <label className="quiz-label" style={{ marginTop: "1.2rem" }}>
            Bag features <span className="quiz-label-muted">(select all that apply)</span>
          </label>
          <div className="bg-quiz-chip-grid">
            {BAG_FEATURES.map((f) => {
              const sel = (brief.bag_features || []).includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  className={`bg-quiz-chip ${sel ? "is-selected" : ""}`}
                  onClick={() => toggleBagFeature(f)}
                >{f}</button>
              );
            })}
          </div>
        </>
      ) : null}
      <label className="quiz-label" style={{ marginTop: "1.2rem" }}>Eco-friendly materials?</label>
      <div className="pk-yn-row">
        {ECO_OPTIONS.map((o) => {
          const sel = brief.eco === o.id;
          return (
            <button
              key={o.id}
              type="button"
              className={`pk-yn-btn ${sel ? "is-selected" : ""}`}
              onClick={() => onUpdate({ eco: o.id })}
            >{o.label}</button>
          );
        })}
      </div>
    </div>
  );
}

function StepFiles({ brief, onUpdate }) {
  return (
    <div>
      <h2 className="quiz-q">Files &amp; final details</h2>
      <p className="quiz-q-sub">Share any files you have and add any notes. This is optional but any files you provide speed up production significantly.</p>
      <label className="quiz-label">Do you have an existing dieline, brand guidelines, or reference?</label>
      <div className="pk-yn-row">
        <button
          type="button"
          className={`pk-yn-btn ${brief.has_files === "yes" ? "is-selected" : ""}`}
          onClick={() => onUpdate({ has_files: "yes" })}
        >Yes, I have files</button>
        <button
          type="button"
          className={`pk-yn-btn ${brief.has_files === "no" ? "is-selected" : ""}`}
          onClick={() => onUpdate({ has_files: "no" })}
        >Starting from scratch</button>
      </div>
      {brief.has_files === "yes" ? (
        <div style={{ marginTop: "1rem" }}>
          <BrandAssetUploader
            value={brief.brand_assets || []}
            onChange={(next) => onUpdate({ brand_assets: next })}
            projectName={brief.product_name || "Packaging Design Request"}
            label="Attach dieline, brand guidelines, or reference files"
            helper="AI, EPS, PDF, PNG, ZIP accepted. The more we have, the faster we ship."
            accept="image/*,application/pdf,.ai,.eps,.svg,.zip"
          />
        </div>
      ) : null}
      <label className="quiz-label" style={{ marginTop: "1.2rem" }}>
        Sizes and notes of the products that go inside the packaging <span className="quiz-label-muted">(optional)</span>
      </label>
      <textarea
        className="quiz-textarea"
        rows={3}
        placeholder='e.g. Bottle is 2.5" × 8" tall. Label should avoid the bottom 1" where the cap goes.'
        value={brief.inner_notes}
        onChange={(e) => onUpdate({ inner_notes: e.target.value })}
      />
      <label className="quiz-label">
        Additional notes or requests <span className="quiz-label-muted">(optional)</span>
      </label>
      <textarea
        className="quiz-textarea"
        rows={3}
        placeholder="Deadlines, special requirements, things to avoid, existing brand colors..."
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
StepType.propTypes    = stepPropTypes;
StepStyle.propTypes   = stepPropTypes;
StepProduct.propTypes = stepPropTypes;
StepSpecs.propTypes   = stepPropTypes;
StepFiles.propTypes   = stepPropTypes;

ProgressBar.propTypes = {
  step: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  label: PropTypes.string,
};
