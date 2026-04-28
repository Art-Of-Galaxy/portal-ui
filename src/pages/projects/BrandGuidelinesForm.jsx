import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, CalendarCheck, Upload, X } from "lucide-react";
import { fetchWithConfig } from "../../utils/authHelper";
import { apiServices } from "../../services/apiServices";
import BrandGuidelinesView from "./BrandGuidelinesView";
import { useLoading } from "../../context/LoadingContext";

const BRAND_GUIDELINES_LOADER_MESSAGES = [
  "Reading your brand brief…",
  "Distilling positioning and audience…",
  "Drafting voice and tone…",
  "Pairing typefaces…",
  "Building your color system…",
  "Sketching design principles…",
  "Lining up the deliverables…",
  "Polishing the next steps…",
  "Almost there…",
];

const COLOR_THEORY = [
  { id: "blue",   label: "Blue",   gradient: "linear-gradient(135deg, #3a7bd5 0%, #6cb1f5 100%)", desc: "Depth, trust, loyalty, confidence, intelligence, and calmness." },
  { id: "purple", label: "Purple", gradient: "linear-gradient(135deg, #8e2de2 0%, #c471ed 100%)", desc: "Royalty, power, nobility, luxury, wealth, extravagance, and wisdom." },
  { id: "pink",   label: "Pink",   gradient: "linear-gradient(135deg, #d12c8c 0%, #f06292 100%)", desc: "Sweet, innocent, sensitive, passionate, playful, and loving." },
  { id: "red",    label: "Red",    gradient: "linear-gradient(135deg, #c0392b 0%, #e57373 100%)", desc: "Power, energy, passion, desire, speed, strength, love, and intensity." },
  { id: "orange", label: "Orange", gradient: "linear-gradient(135deg, #d35400 0%, #f39c12 100%)", desc: "Joy, enthusiasm, happiness, creativity, determination, and stimulation." },
  { id: "yellow", label: "Yellow", gradient: "linear-gradient(135deg, #f1c40f 0%, #ffe761 100%)", desc: "Sunshine, joy, happiness, intellect, cheerfulness, and energy." },
  { id: "green",  label: "Green",  gradient: "linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)", desc: "Nature, growth, harmony, freshness, safety, and healing." },
  { id: "teal",   label: "Teal",   gradient: "linear-gradient(135deg, #16a085 0%, #4ecdc4 100%)", desc: "Creativity, inspiration, excitement, tranquility, and youth." },
  { id: "grey",   label: "Grey",   gradient: "linear-gradient(135deg, #424242 0%, #9e9e9e 100%)", desc: "Power, elegance, reliability, intelligence, modesty, and maturity." },
];

const TYPOGRAPHY_OPTIONS = [
  { id: "serif",     name: "Serif",     style: { fontFamily: "Georgia, 'Times New Roman', serif" } },
  { id: "sans",      name: "Sans Serif",style: { fontFamily: "Inter, Arial, sans-serif" } },
  { id: "script",    name: "Script",    style: { fontFamily: "'Brush Script MT', cursive", fontStyle: "italic" } },
  { id: "modern",    name: "Modern",    style: { fontFamily: "Arial Black, sans-serif", fontWeight: 900 } },
  { id: "display",   name: "Display",   style: { fontFamily: "Georgia, serif", fontWeight: 900 } },
  { id: "condensed", name: "Condensed", style: { fontFamily: "'Arial Narrow', Impact, sans-serif" } },
];

const DELIVERABLES = [
  { id: "ppt", label: "Presentation Templates (.ppt)" },
  { id: "docx", label: "Document templates (.docx)" },
  { id: "social", label: "Templates for social media posts" },
  { id: "favicon", label: "Favicons for apps or website" },
];

const MODEL_OPTIONS = [
  { id: "claude-opus-4-7",   label: "Claude Opus 4.7 (default — most capable)" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 (balanced)" },
  { id: "claude-haiku-4-5",  label: "Claude Haiku 4.5 (fast)" },
];

const initialForm = {
  brand_name: "",
  product_description: "",
  project_background: "",
  positioning_purpose: "",
  problem_solved: "",
  value_proposition: "",
  audience_age: "",
  audience_gender: "",
  audience_occupation: "",
  audience_interest: "",
  audience_buying_habits: "",
  competitor_links: ["", "", ""],
  competitor_names: "",
  admired_brand_links: ["", "", ""],
  admired_brand_notes: "",
  brand_tone: "",
  communication_style: "",
  naming_help: "",
  naming_meaning: "",
  slogan: "",
  design_preferences: "",
  selected_colors: [],
  custom_colors: [],
  selected_typography: [],
  visual_elements: "",
  deliverables: [],
  deliverables_other: "",
  additional_notes: "",
};

export default function BrandGuidelinesForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [model, setModel] = useState(MODEL_OPTIONS[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(true);
  const { withLoading } = useLoading();

  // Try to fetch list of allowed models from server (so the picker matches what the server actually accepts)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchWithConfig("brand-guidelines/models", { method: "GET" });
        if (cancelled || !res?.success) return;
        if (res.default_model) setModel(res.default_model);
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const updateArrayItem = (key, idx, value) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].map((v, i) => (i === idx ? value : v)),
    }));

  const toggle = (key, value) =>
    setForm((f) => {
      const arr = f[key];
      return {
        ...f,
        [key]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value],
      };
    });

  const ready = useMemo(() => {
    return form.brand_name.trim().length > 0 && form.product_description.trim().length > 0;
  }, [form]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!ready || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await withLoading(
        () => apiServices.generate_brand_guidelines({ form, model }),
        BRAND_GUIDELINES_LOADER_MESSAGES,
        { label: "AI is thinking", intervalMs: 2200 },
      );
      if (!res?.success) {
        throw new Error(res?.message || "Generation failed");
      }
      setResult(res);
    } catch (err) {
      setError(err?.message || "Failed to generate brand guidelines.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <div className="portal-page">
        <button
          type="button"
          className="portal-back-link"
          onClick={() => navigate("/new-projects/branding-design")}
        >
          <ArrowLeft size={16} />
          Back to Branding &amp; Design
        </button>
        <div className="bg-form-shell" style={{ padding: "2.6rem 1.6rem", textAlign: "center" }}>
          <h2 className="portal-card-heading">Closed</h2>
          <p className="portal-card-copy">Re-open the brief whenever you want.</p>
          <button
            type="button"
            className="portal-cta"
            style={{ marginTop: "1rem" }}
            onClick={() => setOpen(true)}
          >
            Re-open form
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="portal-page">
        <button
          type="button"
          className="portal-back-link"
          onClick={() => navigate("/new-projects/branding-design")}
        >
          <ArrowLeft size={16} />
          Back to Branding &amp; Design
        </button>

        <div className="bg-form-shell">
          <div className="bg-form-header">
            <span className="bg-form-header-tile">
              <BookOpen size={20} />
            </span>
            <div>
              <h2>Branding and Design</h2>
              <p>Craft Identity. Inspire Loyalty. Drive Growth: Build a Brand That Stands Out.</p>
            </div>
          </div>

          <div style={{ padding: "1.4rem 1.6rem" }}>
            <div className="bg-thanks-card" style={{ padding: "1rem 0 1.6rem" }}>
              <h2>Thank you — your brand brief is ready</h2>
              <p>
                We&apos;ve saved your request to <strong>My Projects</strong> under <strong>Branding &amp; Design</strong>.
                Below is the AI-generated brand guidelines draft your AOG strategist will review and refine.
              </p>
              <div className="bg-thanks-actions">
                {result.project_id ? (
                  <button
                    type="button"
                    className="branding-btn-primary"
                    onClick={() => navigate(`/my-projects/${result.project_id}`)}
                  >
                    Open in My Projects
                  </button>
                ) : (
                  <button
                    type="button"
                    className="branding-btn-primary"
                    onClick={() => navigate("/my-projects")}
                  >
                    View My Projects
                  </button>
                )}
                <button
                  type="button"
                  className="branding-btn-secondary"
                  onClick={() => {
                    setResult(null);
                    setForm(initialForm);
                  }}
                >
                  Request Another Design
                </button>
              </div>
            </div>

            <BrandGuidelinesView
              guidelines={result.guidelines}
              brandName={form.brand_name}
              model={result.model}
              usage={result.usage}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-page">
      <button
        type="button"
        className="portal-back-link"
        onClick={() => navigate("/new-projects/branding-design")}
      >
        <ArrowLeft size={16} />
        Back to Branding &amp; Design
      </button>

      <div className="portal-create-header">
        <h1 className="portal-create-title">Let&apos;s create a project</h1>
        <p className="portal-create-sub">Choose the service you need</p>
      </div>

      <form className="bg-form-shell" onSubmit={handleSubmit}>
        <div className="bg-form-header">
          <span className="bg-form-header-tile">
            <BookOpen size={20} />
          </span>
          <div style={{ flex: 1 }}>
            <h2>Branding and Design</h2>
            <p>Craft Identity. Inspire Loyalty. Drive Growth: Build a Brand That Stands Out.</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            style={{
              border: 0,
              background: "transparent",
              color: "var(--portal-text-muted)",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="bg-form-body">
          {/* Left sidebar */}
          <aside className="bg-form-side">
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 9,
                background: "linear-gradient(135deg, #00cf8b 0%, #00d4a3 100%)",
                color: "#fff",
                display: "grid",
                placeItems: "center",
              }}
            >
              <BookOpen size={16} />
            </span>
            <h3>Brand Development</h3>
            <p style={{ fontSize: 12, color: "var(--portal-text-muted)" }}>
              Establish a consistent, professional brand presence.
            </p>
            <ul style={{ marginTop: "0.6rem" }}>
              <li>Define voice, tone, and visual style.</li>
              <li>Set rules for typography, colors, icon usage, and logo application.</li>
              <li>Ensure consistency across all customer touchpoints.</li>
            </ul>
          </aside>

          {/* Form sections */}
          <div>
            {error ? (
              <div
                style={{
                  background: "rgba(232,77,77,0.1)",
                  border: "1px solid rgba(232,77,77,0.3)",
                  color: "var(--portal-danger)",
                  padding: "0.7rem 0.9rem",
                  borderRadius: 8,
                  marginBottom: "1rem",
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            ) : null}

            <p style={{ fontSize: 13, color: "var(--portal-text-muted)", marginBottom: "1rem" }}>
              <strong style={{ color: "var(--portal-text)" }}>
                Tell us what you need and help us build your brand from the ground up.
              </strong>{" "}
              Please fill out the form below with as much detail as possible. The more information you
              provide, the better we can create a complete brand identity that sets you apart from the
              competition.
            </p>

            {/* 1. General Project Information */}
            <section className="bg-form-section">
              <h3 className="bg-form-section-title">1. General Project Information</h3>
              <div className="bg-form-field">
                <label className="bg-form-label">Current or provisional brand name</label>
                <input
                  className="bg-form-input"
                  placeholder="Do you already have a defined name?"
                  value={form.brand_name}
                  onChange={(e) => update("brand_name", e.target.value)}
                  required
                />
              </div>
              <div className="bg-form-field">
                <label className="bg-form-label">Product or service description</label>
                <textarea
                  className="bg-form-textarea"
                  rows={3}
                  placeholder="What do you do? What do you offer? How does it work?"
                  value={form.product_description}
                  onChange={(e) => update("product_description", e.target.value)}
                  required
                />
              </div>
              <div className="bg-form-field">
                <label className="bg-form-label">Project background (if applicable)</label>
                <textarea
                  className="bg-form-textarea"
                  rows={3}
                  placeholder="How did the idea or company start? What's the story behind it?"
                  value={form.project_background}
                  onChange={(e) => update("project_background", e.target.value)}
                />
              </div>
            </section>

            {/* 2. Brand Strategy */}
            <section className="bg-form-section">
              <h3 className="bg-form-section-title">2. Brand Strategy</h3>
              <div className="bg-form-field">
                <label className="bg-form-label">Positioning and purpose</label>
                <textarea
                  className="bg-form-textarea"
                  rows={2}
                  placeholder="What is the mission, vision, and purpose of the brand?"
                  value={form.positioning_purpose}
                  onChange={(e) => update("positioning_purpose", e.target.value)}
                />
              </div>
              <div className="bg-form-field">
                <label className="bg-form-label">What problem do you solve and for whom?</label>
                <input
                  className="bg-form-input"
                  placeholder="Explain"
                  value={form.problem_solved}
                  onChange={(e) => update("problem_solved", e.target.value)}
                />
              </div>
              <div className="bg-form-field">
                <label className="bg-form-label">What is your value proposition?</label>
                <textarea
                  className="bg-form-textarea"
                  rows={2}
                  placeholder="Why should people choose you?"
                  value={form.value_proposition}
                  onChange={(e) => update("value_proposition", e.target.value)}
                />
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">Target audience</label>
                <div className="bg-form-grid-2">
                  <input
                    className="bg-form-input"
                    placeholder="Age"
                    value={form.audience_age}
                    onChange={(e) => update("audience_age", e.target.value)}
                  />
                  <input
                    className="bg-form-input"
                    placeholder="Gender"
                    value={form.audience_gender}
                    onChange={(e) => update("audience_gender", e.target.value)}
                  />
                </div>
                <input
                  className="bg-form-input"
                  placeholder="Occupation"
                  value={form.audience_occupation}
                  onChange={(e) => update("audience_occupation", e.target.value)}
                  style={{ marginTop: 6 }}
                />
                <input
                  className="bg-form-input"
                  placeholder="Interest"
                  value={form.audience_interest}
                  onChange={(e) => update("audience_interest", e.target.value)}
                  style={{ marginTop: 6 }}
                />
                <input
                  className="bg-form-input"
                  placeholder="Buying habits"
                  value={form.audience_buying_habits}
                  onChange={(e) => update("audience_buying_habits", e.target.value)}
                  style={{ marginTop: 6 }}
                />
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">
                  Competitor information: who are your direct and indirect competitors?
                </label>
                {form.competitor_links.map((v, i) => (
                  <input
                    key={i}
                    className="bg-form-input"
                    placeholder="Main competitor link"
                    value={v}
                    onChange={(e) => updateArrayItem("competitor_links", i, e.target.value)}
                    style={{ marginBottom: 5 }}
                  />
                ))}
                <textarea
                  className="bg-form-textarea"
                  rows={2}
                  placeholder="Or name them"
                  value={form.competitor_names}
                  onChange={(e) => update("competitor_names", e.target.value)}
                  style={{ marginTop: 4 }}
                />
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">What brands do you admire and why?</label>
                {form.admired_brand_links.map((v, i) => (
                  <input
                    key={i}
                    className="bg-form-input"
                    placeholder="Brands you admire"
                    value={v}
                    onChange={(e) => updateArrayItem("admired_brand_links", i, e.target.value)}
                    style={{ marginBottom: 5 }}
                  />
                ))}
                <textarea
                  className="bg-form-textarea"
                  rows={2}
                  placeholder="Name them or explain why you admire them."
                  value={form.admired_brand_notes}
                  onChange={(e) => update("admired_brand_notes", e.target.value)}
                  style={{ marginTop: 4 }}
                />
              </div>
            </section>

            {/* 3. Verbal Identity */}
            <section className="bg-form-section">
              <h3 className="bg-form-section-title">3. Verbal Identity</h3>
              <div className="bg-form-field">
                <label className="bg-form-label">Brand tone and personality</label>
                <input
                  className="bg-form-input"
                  placeholder="If your brand were a person, what would they be like? (e.g., outgoing, technical, elegant, disruptive…)"
                  value={form.brand_tone}
                  onChange={(e) => update("brand_tone", e.target.value)}
                />
              </div>
              <div className="bg-form-field">
                <label className="bg-form-label">How should your brand sound when communicating?</label>
                <textarea
                  className="bg-form-textarea"
                  rows={2}
                  placeholder="Warm and friendly, professional and serious, bold and innovative, etc..."
                  value={form.communication_style}
                  onChange={(e) => update("communication_style", e.target.value)}
                />
              </div>
              <div className="bg-form-field">
                <label className="bg-form-label">Naming (if needed)</label>
                <input
                  className="bg-form-input"
                  placeholder="Do you need help defining the name? Do you have any name options in mind?"
                  value={form.naming_help}
                  onChange={(e) => update("naming_help", e.target.value)}
                  style={{ marginBottom: 5 }}
                />
                <input
                  className="bg-form-input"
                  placeholder="What meaning or ideas should the name convey?"
                  value={form.naming_meaning}
                  onChange={(e) => update("naming_meaning", e.target.value)}
                />
              </div>
              <div className="bg-form-field">
                <label className="bg-form-label">Slogan or tagline</label>
                <input
                  className="bg-form-input"
                  placeholder="Do you want a slogan? What key ideas should it express?"
                  value={form.slogan}
                  onChange={(e) => update("slogan", e.target.value)}
                />
              </div>
            </section>

            {/* 4. Visual Identity */}
            <section className="bg-form-section">
              <h3 className="bg-form-section-title">4. Visual Identity</h3>

              <div className="bg-form-field">
                <label className="bg-form-label">Do you have any design preferences or ideas already in mind?</label>
                <textarea
                  className="bg-form-textarea"
                  rows={2}
                  placeholder="Share your ideas"
                  value={form.design_preferences}
                  onChange={(e) => update("design_preferences", e.target.value)}
                />
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">
                  Which colors would you like to use? Choose at least two, and no more than four.
                </label>
                <p style={{ margin: "0.4rem 0 0.2rem", fontSize: 12, color: "var(--portal-text-muted)" }}>
                  A bit of general color theory in case you need it.
                </p>
                <div className="bg-form-color-swatches">
                  {COLOR_THEORY.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`bg-form-color-swatch ${form.selected_colors.includes(c.id) ? "is-selected" : ""}`}
                      style={{ background: c.gradient }}
                      onClick={() => {
                        const isSel = form.selected_colors.includes(c.id);
                        if (!isSel && form.selected_colors.length >= 4) return;
                        toggle("selected_colors", c.id);
                      }}
                    >
                      <strong>{c.label}</strong>
                      <span>{c.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">
                  Preferred typography styles: please pick at least two.
                </label>
                <div className="bg-form-typography-grid">
                  {TYPOGRAPHY_OPTIONS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`bg-form-typography-card ${form.selected_typography.includes(t.id) ? "is-selected" : ""}`}
                      onClick={() => toggle("selected_typography", t.id)}
                    >
                      <span className="bg-form-typography-sample" style={t.style}>
                        Aa Bb Cc
                      </span>
                      <span className="bg-form-typography-name">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">Are there specific visual elements you&apos;d like to include?</label>
                <textarea
                  className="bg-form-textarea"
                  rows={2}
                  placeholder="Explain your idea or upload a sketch or reference."
                  value={form.visual_elements}
                  onChange={(e) => update("visual_elements", e.target.value)}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--portal-text-muted)" }}>Or upload files:</span>
                  <button
                    type="button"
                    className="branding-btn-primary"
                    style={{ height: 36, minWidth: 0, padding: "0 1.2rem", fontSize: 13 }}
                    onClick={() =>
                      setError("File upload is coming soon — describe references in the field above for now.")
                    }
                  >
                    <Upload size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                    Upload
                  </button>
                </div>
              </div>
            </section>

            {/* 5. Final files for brand */}
            <section className="bg-form-section">
              <h3 className="bg-form-section-title">5. Final files for brand:</h3>
              <p style={{ fontSize: 12, color: "var(--portal-text-muted)", margin: "0 0 0.7rem" }}>
                Once the development of your brand is complete, the final files you will receive include
                the logo in vector format with a transparent background, your brand guidelines, and sample
                images featuring your new brand. <strong>If you need any additional files, please let us know.</strong>
              </p>
              <div className="bg-form-deliverables">
                {DELIVERABLES.map((d) => (
                  <label key={d.id} className="bg-form-checkbox">
                    <input
                      type="checkbox"
                      checked={form.deliverables.includes(d.id)}
                      onChange={() => toggle("deliverables", d.id)}
                    />
                    {d.label}
                  </label>
                ))}
              </div>
              <input
                className="bg-form-input"
                placeholder="Other?"
                value={form.deliverables_other}
                onChange={(e) => update("deliverables_other", e.target.value)}
                style={{ marginTop: 10 }}
              />
              <textarea
                className="bg-form-textarea"
                rows={3}
                placeholder="Additional Notes or Requests"
                value={form.additional_notes}
                onChange={(e) => update("additional_notes", e.target.value)}
                style={{ marginTop: 10 }}
              />

              <div className="bg-form-model-row">
                <label htmlFor="bg-model">Model:</label>
                <select
                  id="bg-model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  {MODEL_OPTIONS.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
                <span style={{ fontSize: 11 }}>
                  Per-request override; we&apos;ll lock to a single best model later.
                </span>
              </div>

              <div className="bg-form-submit">
                <button
                  type="submit"
                  className={ready ? "is-ready" : ""}
                  disabled={!ready || submitting}
                >
                  {submitting ? "Generating…" : "Get started"}
                </button>
              </div>
            </section>
          </div>

          {/* Right meeting card */}
          <aside className="bg-form-side">
            <div className="bg-form-meeting-card">
              <h4>Prefer a more personalized experience?</h4>
              <p>You can also schedule a meeting with our team to discuss your ideas in depth.</p>
              <button type="button" className="bg-form-meeting-btn">
                <CalendarCheck size={14} />
                Schedule a meeting
              </button>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
