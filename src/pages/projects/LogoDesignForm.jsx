import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarCheck, PenTool, Paperclip, X } from "lucide-react";
import { fetchWithConfig } from "../../utils/authHelper";
import { apiServices } from "../../services/apiServices";
import LogoDesignView from "./LogoDesignView";
import ColorPicker from "../../components/ui/ColorPicker";
import FileUploadButton from "../../components/ui/FileUploadButton";
import { useLoading } from "../../context/LoadingContext";

import ref01 from "../../assets/branding/logo/3_1_Ref@2x.png";
import ref02 from "../../assets/branding/logo/3_2_Ref@2x.png";
import ref03 from "../../assets/branding/logo/3_3_Ref@2x.png";
import ref04 from "../../assets/branding/logo/3_4_Ref@2x.png";
import ref05 from "../../assets/branding/logo/3_5_Ref@2x.png";
import ref06 from "../../assets/branding/logo/3_6_Ref@2x.png";
import ref07 from "../../assets/branding/logo/3_7_Ref@2x.png";
import ref08 from "../../assets/branding/logo/3_8_Ref@2x.png";
import ref09 from "../../assets/branding/logo/3_9_Ref@2x.png";
import ref10 from "../../assets/branding/logo/3_10_Ref@2x.png";
import ref11 from "../../assets/branding/logo/3_11_Ref@2x.png";
import ref12 from "../../assets/branding/logo/3_12_Ref@2x.png";
import ref13 from "../../assets/branding/logo/3_13_Ref@2x.png";
import ref14 from "../../assets/branding/logo/3_14_Ref@2x.png";
import ref15 from "../../assets/branding/logo/3_15_Ref@2x.png";
import ref16 from "../../assets/branding/logo/3_16_Ref@2x.png";
import ref17 from "../../assets/branding/logo/3_17_Ref@2x.png";
import ref18 from "../../assets/branding/logo/3_18_Ref@2x.png";
import ref19 from "../../assets/branding/logo/3_19_Ref@2x.png";
import ref20 from "../../assets/branding/logo/3_20_Ref@2x.png";
import ref21 from "../../assets/branding/logo/3_21_Ref@2x.png";
import ref22 from "../../assets/branding/logo/3_22_Ref@2x.png";
import ref23 from "../../assets/branding/logo/3_23_Ref@2x.png";
import ref24 from "../../assets/branding/logo/3_24_Ref@2x.png";
import ref25 from "../../assets/branding/logo/3_25_Ref@2x.png";

const LOGO_LOADER_MESSAGES = [
  "Reading your brand brief…",
  "Picking the right visual direction…",
  "Composing the prompt…",
  "Sending it to the image model…",
  "Sketching the first concepts…",
  "Refining color and balance…",
  "Polishing the final renders…",
  "Almost there…",
];

const LOGO_STYLES = [
  { id: "vintage",     label: "Vintage",     refs: [ref01, ref02, ref03, ref04, ref05] },
  { id: "mascot",      label: "Mascot",      refs: [] },
  { id: "wordmark",    label: "Wordmark",    refs: [ref06, ref07, ref08, ref09, ref10] },
  { id: "monogram",    label: "Monogram",    refs: [ref11, ref12, ref13, ref14, ref15] },
  { id: "combination", label: "Combination", refs: [ref16, ref17, ref18, ref19, ref20] },
  { id: "minimalist",  label: "Minimalist",  refs: [ref21, ref22, ref23, ref24, ref25] },
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
  { id: "serif",     name: "Serif",      style: { fontFamily: "Georgia, 'Times New Roman', serif" } },
  { id: "sans",      name: "Sans Serif", style: { fontFamily: "Inter, Arial, sans-serif" } },
  { id: "script",    name: "Script",     style: { fontFamily: "'Brush Script MT', cursive", fontStyle: "italic" } },
  { id: "modern",    name: "Modern",     style: { fontFamily: "Arial Black, sans-serif", fontWeight: 900 } },
  { id: "display",   name: "Display",    style: { fontFamily: "Georgia, serif", fontWeight: 900 } },
  { id: "condensed", name: "Condensed",  style: { fontFamily: "'Arial Narrow', Impact, sans-serif" } },
];

const MODEL_OPTIONS = [
  // { id: "fal-ai/recraft-v3",     label: "Recraft v3 (default — strong with text & vector logos)" },
  // { id: "fal-ai/ideogram/v2",    label: "Ideogram v2 (good with on-image text)" },
  // { id: "fal-ai/flux/dev",       label: "Flux dev (general purpose, fast)" },
  { id: "fal-ai/flux-pro/v1.1",  label: "Flux Pro 1.1 (highest quality)" },
];

const initialForm = {
  brand_name: "",
  tagline: "",
  business_description: "",
  logo_style: "",
  selected_colors: [],
  custom_colors: ["", "", "", ""],
  selected_typography: [],
  reference_links: ["", "", ""],
  reference_uploads: [],
  competitor_links: ["", "", ""],
  competitor_names: "",
  additional_notes: "",
};

function isValidHex(value) {
  return /^#?[0-9a-fA-F]{6}$/.test(String(value || "").trim());
}

function normalizeHex(value) {
  const v = String(value || "").trim();
  if (!v) return "";
  return v.startsWith("#") ? v.toUpperCase() : `#${v.toUpperCase()}`;
}

export default function LogoDesignForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [model, setModel] = useState(MODEL_OPTIONS[0].id);
  const [numImages, setNumImages] = useState(4);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(true);
  const { withLoading } = useLoading();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchWithConfig("logo-design/models", { method: "GET" });
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

  const ready = useMemo(
    () =>
      form.brand_name.trim().length > 0 &&
      form.business_description.trim().length > 0,
    [form]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!ready || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const cleanedCustomColors = form.custom_colors
        .map(normalizeHex)
        .filter(isValidHex);

      const payloadForm = {
        ...form,
        custom_colors: cleanedCustomColors,
      };

      const res = await withLoading(
        () => apiServices.generate_logo_design({ form: payloadForm, model, num_images: numImages }),
        LOGO_LOADER_MESSAGES,
        { label: "AI is designing", intervalMs: 2400 }
      );
      if (!res?.success) {
        throw new Error(res?.message || "Generation failed");
      }
      setResult(res);
    } catch (err) {
      setError(err?.message || "Failed to generate logo concepts.");
    } finally {
      setSubmitting(false);
    }
  };

  const sidebar = (
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
        <PenTool size={16} />
      </span>
      <h3>Logo Design</h3>
      <p style={{ fontSize: 12, color: "var(--portal-text-muted)" }}>
        Capture your brand&apos;s essence with versatile, high-impact logos.
      </p>
      <ul style={{ marginTop: "0.6rem" }}>
        <li>Custom concepts aligned with your mission and values.</li>
        <li>Formats optimized for print, digital, and packaging.</li>
        <li>Multiple revisions to refine and perfect your vision.</li>
      </ul>
    </aside>
  );

  const meetingSidebar = (
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
  );

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
              <PenTool size={20} />
            </span>
            <div>
              <h2>Branding and Design</h2>
              <p>Craft Identity. Inspire Loyalty. Drive Growth: Build a Brand That Stands Out.</p>
            </div>
          </div>

          <div style={{ padding: "1.4rem 1.6rem" }}>
            <div className="bg-thanks-card" style={{ padding: "1rem 0 1.6rem" }}>
              <h2>Thank you — your logo concepts are ready</h2>
              <p>
                We&apos;ve saved your request to <strong>My Projects</strong> under{" "}
                <strong>Branding &amp; Design</strong>. Below are the AI-generated logo
                concepts your AOG strategist will refine with you.
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

            <LogoDesignView
              images={result.images}
              prompt={result.prompt}
              brandName={form.brand_name}
              model={result.model}
              seed={result.seed}
              errors={result.errors}
              requested={numImages}
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

      <form className="bg-form-shell" onSubmit={handleSubmit}>
        <div className="bg-form-header">
          <span className="bg-form-header-tile">
            <PenTool size={20} />
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
          {sidebar}

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
                Tell us what you need and help us bring your vision to life.
              </strong>{" "}
              Please fill out the form below with as much detail as possible. The more information
              you provide, the better we can tailor a logo that aligns perfectly with your brand
              identity and goals.
            </p>

            {/* 1. General brand info */}
            <section className="bg-form-section">
              <div className="bg-form-field">
                <label className="bg-form-label">Company or Brand</label>
                <input
                  className="bg-form-input"
                  placeholder="What is the exact name that should appear on the logo?"
                  value={form.brand_name}
                  onChange={(e) => update("brand_name", e.target.value)}
                  required
                />
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">Tagline or Slogan (Optional)</label>
                <input
                  className="bg-form-input"
                  placeholder="Do you want a tagline included? If yes, please write it here."
                  value={form.tagline}
                  onChange={(e) => update("tagline", e.target.value)}
                />
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">Business Description</label>
                <textarea
                  className="bg-form-textarea"
                  rows={3}
                  placeholder="Briefly describe what your business does, your industry, and your target audience."
                  value={form.business_description}
                  onChange={(e) => update("business_description", e.target.value)}
                  required
                />
              </div>
            </section>

            {/* 2. Logo style preference */}
            <section className="bg-form-section">
              <div className="bg-form-field">
                <label className="bg-form-label">
                  Logo Style Preference:{" "}
                  <span style={{ color: "var(--portal-text-muted)", fontWeight: 400 }}>
                    Pick the style you prefer
                  </span>
                </label>
                <div className="logo-style-grid">
                  {LOGO_STYLES.map((style) => {
                    const selected = form.logo_style === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        className={`logo-style-row ${selected ? "is-selected" : ""}`}
                        onClick={() => update("logo_style", style.id)}
                        aria-pressed={selected}
                      >
                        <span className="logo-style-name">{style.label}</span>
                        <div className="logo-style-thumbs">
                          {style.refs.length === 0
                            ? Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className="logo-style-thumb is-placeholder" />
                              ))
                            : style.refs.map((src, i) => (
                                <span key={i} className="logo-style-thumb">
                                  <img src={src} alt={`${style.label} reference ${i + 1}`} />
                                </span>
                              ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 3. Color preferences */}
            <section className="bg-form-section">
              <div className="bg-form-field">
                <label className="bg-form-label">
                  Which colors would you like to use?{" "}
                  <span style={{ color: "var(--portal-text-muted)", fontWeight: 400 }}>
                    Choose at least two, and no more than four.
                  </span>
                </label>

                <ColorPicker
                  value={form.custom_colors}
                  onChange={(next) => update("custom_colors", next)}
                  slotCount={4}
                  max={4}
                />

                <p style={{ margin: "0.6rem 0 0.4rem", fontSize: 12, color: "var(--portal-text-muted)" }}>
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
            </section>

            {/* 4. Typography */}
            <section className="bg-form-section">
              <div className="bg-form-field">
                <label className="bg-form-label">
                  Typography Preferences:{" "}
                  <span style={{ color: "var(--portal-text-muted)", fontWeight: 400 }}>Please pick at least two.</span>
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
            </section>

            {/* 5. References + competitors */}
            <section className="bg-form-section">
              <div className="bg-form-field">
                <label className="bg-form-label">
                  Inspiration or Reference Logos:{" "}
                  <span style={{ color: "var(--portal-text-muted)", fontWeight: 400 }}>
                    Upload or link 2–3 logos you like and explain what you like about them.
                  </span>
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: "var(--portal-text-muted)", minWidth: 110 }}>
                      Paste the links:
                    </span>
                    <input
                      className="bg-form-input"
                      style={{ flex: 1 }}
                      placeholder="Logo reference link"
                      value={form.reference_links[0]}
                      onChange={(e) => updateArrayItem("reference_links", 0, e.target.value)}
                    />
                  </div>
                  {form.reference_links.slice(1).map((v, i) => (
                    <div key={i + 1} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ minWidth: 110 }} />
                      <input
                        className="bg-form-input"
                        style={{ flex: 1 }}
                        placeholder="Logo reference link"
                        value={v}
                        onChange={(e) => updateArrayItem("reference_links", i + 1, e.target.value)}
                      />
                    </div>
                  ))}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: "var(--portal-text-muted)", minWidth: 110 }}>
                      Or upload files:
                    </span>
                    <FileUploadButton
                      category="Branding & Design"
                      serviceType="logo_design"
                      projectName={form.brand_name || "Logo Design Request"}
                      accept="image/*,application/pdf"
                      multiple
                      onUploaded={({ url, name }) =>
                        update("reference_uploads", [
                          ...form.reference_uploads,
                          { url, name },
                        ])
                      }
                      onError={(msg) => setError(msg)}
                    />
                  </div>
                  {form.reference_uploads.length ? (
                    <ul className="upload-chip-list">
                      {form.reference_uploads.map((f, i) => (
                        <li key={i} className="upload-chip">
                          <Paperclip size={12} />
                          <a href={f.url} target="_blank" rel="noreferrer">{f.name || `file-${i + 1}`}</a>
                          <button
                            type="button"
                            aria-label="Remove"
                            onClick={() =>
                              update(
                                "reference_uploads",
                                form.reference_uploads.filter((_, j) => j !== i)
                              )
                            }
                          >
                            <X size={11} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">
                  Competitor Information:{" "}
                  <span style={{ color: "var(--portal-text-muted)", fontWeight: 400 }}>
                    Who are your main competitors? Please share links or names if possible.
                  </span>
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: "var(--portal-text-muted)", minWidth: 110 }}>
                      Paste the links:
                    </span>
                    <input
                      className="bg-form-input"
                      style={{ flex: 1 }}
                      placeholder="Main competitor link"
                      value={form.competitor_links[0]}
                      onChange={(e) => updateArrayItem("competitor_links", 0, e.target.value)}
                    />
                  </div>
                  {form.competitor_links.slice(1).map((v, i) => (
                    <div key={i + 1} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ minWidth: 110 }} />
                      <input
                        className="bg-form-input"
                        style={{ flex: 1 }}
                        placeholder="Main competitor link"
                        value={v}
                        onChange={(e) => updateArrayItem("competitor_links", i + 1, e.target.value)}
                      />
                    </div>
                  ))}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: "var(--portal-text-muted)", minWidth: 110, paddingTop: 8 }}>
                      Or name them:
                    </span>
                    <textarea
                      className="bg-form-textarea"
                      rows={2}
                      style={{ flex: 1 }}
                      placeholder="Who are your main competitors?"
                      value={form.competitor_names}
                      onChange={(e) => update("competitor_names", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Notes + submit */}
            <section className="bg-form-section">
              <textarea
                className="bg-form-textarea"
                rows={3}
                placeholder="Additional Notes or Requests"
                value={form.additional_notes}
                onChange={(e) => update("additional_notes", e.target.value)}
              />

              <div className="bg-form-model-row">
                <label htmlFor="logo-model">Model:</label>
                <select id="logo-model" value={model} onChange={(e) => setModel(e.target.value)}>
                  {MODEL_OPTIONS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <label htmlFor="logo-num" style={{ marginLeft: "0.6rem" }}>
                  Variants:
                </label>
                <select
                  id="logo-num"
                  value={numImages}
                  onChange={(e) => setNumImages(Number(e.target.value))}
                >
                  {[4].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
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

          {meetingSidebar}
        </div>
      </form>
    </div>
  );
}
