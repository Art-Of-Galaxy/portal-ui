import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarCheck, ShoppingBag, Upload, X } from "lucide-react";
import { fetchWithConfig } from "../../utils/authHelper";
import { apiServices } from "../../services/apiServices";
import EcommerceMockupsView from "./EcommerceMockupsView";
import { useLoading } from "../../context/LoadingContext";

const ECOM_LOADER_MESSAGES = [
  "Reading your product brief…",
  "Mapping platform image specs…",
  "Sketching the hero shot…",
  "Plotting feature callouts…",
  "Composing the shot list…",
  "Tuning lighting and palette…",
  "Lining up deliverables…",
  "Polishing the production checklist…",
  "Almost there…",
];

const PLATFORM_OPTIONS = [
  { id: "amazon", label: "Amazon" },
  { id: "shopify", label: "Shopify" },
  { id: "etsy", label: "Etsy" },
  { id: "woocommerce", label: "WooCommerce" },
];

const BACKGROUND_STYLE_OPTIONS = [
  { id: "white_transparent", label: "White / Transparent" },
  { id: "lifestyle_scene", label: "Lifestyle / Scene" },
  { id: "minimalist_clean", label: "Minimalist / Clean" },
  { id: "branded_color", label: "Branded color background" },
];

const MOCKUP_TYPE_OPTIONS = [
  { id: "hero_image", label: "Hero image (main image)" },
  { id: "product_close_ups", label: "Product close-ups" },
  { id: "feature_highlights", label: "Feature highlights" },
  { id: "lifestyle_scenes", label: "Lifestyle scenes" },
  { id: "packaging_display", label: "Packaging display" },
];

const MODEL_OPTIONS = [
  { id: "claude-opus-4-7", label: "Claude Opus 4.7 (default — most capable)" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 (balanced)" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5 (fast)" },
];

const initialForm = {
  platforms: [],
  platforms_other: "",
  product_name: "",
  product_description: "",
  key_features_benefits: "",
  materials_or_ingredients: "",
  certifications: "",
  target_customer: "",
  has_brand_guidelines: "",
  background_styles: [],
  background_styles_other: "",
  reference_links: ["", "", ""],
  mockup_types: [],
  mockup_types_other: "",
  highlight_features: "",
  additional_notes: "",
};

export default function EcommerceMockupsForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [model, setModel] = useState(MODEL_OPTIONS[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(true);
  const { withLoading } = useLoading();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchWithConfig("ecommerce-mockups/models", { method: "GET" });
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
      form.product_name.trim().length > 0 &&
      form.product_description.trim().length > 0,
    [form]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!ready || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await withLoading(
        () => apiServices.generate_ecommerce_mockups({ form, model }),
        ECOM_LOADER_MESSAGES,
        { label: "AI is thinking", intervalMs: 2200 }
      );
      if (!res?.success) {
        throw new Error(res?.message || "Generation failed");
      }
      setResult(res);
    } catch (err) {
      setError(err?.message || "Failed to generate mockup brief.");
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
          background: "linear-gradient(135deg, #00cf8b 0%, #1a8cd8 100%)",
          color: "#fff",
          display: "grid",
          placeItems: "center",
        }}
      >
        <ShoppingBag size={16} />
      </span>
      <h3>E-Commerce Mockups</h3>
      <p style={{ fontSize: 12, color: "var(--portal-text-muted)" }}>
        Enhance your online presence with dynamic, platform-ready visuals.
      </p>
      <ul style={{ marginTop: "0.6rem" }}>
        <li>Tailored mockups for Amazon, Shopify, and other marketplaces.</li>
        <li>High-resolution images that boost product appeal.</li>
        <li>Branded layouts to elevate user trust and conversions.</li>
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
              <ShoppingBag size={20} />
            </span>
            <div>
              <h2>Branding and Design</h2>
              <p>Craft Identity. Inspire Loyalty. Drive Growth: Build a Brand That Stands Out.</p>
            </div>
          </div>

          <div style={{ padding: "1.4rem 1.6rem" }}>
            <div className="bg-thanks-card" style={{ padding: "1rem 0 1.6rem" }}>
              <h2>Thank you for your request!</h2>
              <p>
                We&apos;ve received your <strong>E-Commerce Mockups</strong> brief and our team will start
                reviewing it shortly. Below is the AI-generated creative brief your AOG strategist will
                refine with you.
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

            <EcommerceMockupsView
              mockups={result.mockups}
              productName={form.product_name}
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
            <ShoppingBag size={20} />
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
                Help us showcase your product at its best.
              </strong>{" "}
              Please fill out the form below with as much detail as possible. The more context you
              provide, the better we can create high-impact mockups that drive conversions across your
              e-commerce platforms.
            </p>

            {/* 1. Platform & Product Information */}
            <section className="bg-form-section">
              <h3 className="bg-form-section-title">1. Platform &amp; Product Information</h3>

              <div className="bg-form-field">
                <label className="bg-form-label">
                  Which platform(s) are the mockups for?:{" "}
                  <span style={{ color: "var(--portal-text-muted)", fontWeight: 400 }}>Select one or more</span>
                </label>
                <div className="bg-form-grid-2" style={{ alignItems: "start" }}>
                  <div className="bg-form-deliverables">
                    {PLATFORM_OPTIONS.map((p) => (
                      <label key={p.id} className="bg-form-checkbox">
                        <input
                          type="checkbox"
                          checked={form.platforms.includes(p.id)}
                          onChange={() => toggle("platforms", p.id)}
                        />
                        {p.label}
                      </label>
                    ))}
                  </div>
                  <textarea
                    className="bg-form-textarea"
                    rows={4}
                    placeholder="Other?"
                    value={form.platforms_other}
                    onChange={(e) => update("platforms_other", e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">Product name:</label>
                <input
                  className="bg-form-input"
                  placeholder="e.g., Organic Herbal Tea — 50g"
                  value={form.product_name}
                  onChange={(e) => update("product_name", e.target.value)}
                  required
                />
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">Product description:</label>
                <textarea
                  className="bg-form-textarea"
                  rows={3}
                  placeholder="e.g., 100% natural tea blend made with chamomile, mint, and lemongrass. Gluten-free and non-GMO."
                  value={form.product_description}
                  onChange={(e) => update("product_description", e.target.value)}
                  required
                />
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">What are the key features and benefits of the product?:</label>
                <textarea
                  className="bg-form-textarea"
                  rows={3}
                  placeholder="e.g., Long-lasting hydration and fast absorption"
                  value={form.key_features_benefits}
                  onChange={(e) => update("key_features_benefits", e.target.value)}
                />
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">What materials or ingredients are used?:</label>
                <textarea
                  className="bg-form-textarea"
                  rows={3}
                  placeholder="e.g., Magnesium citrate, vitamin B12, ashwagandha extract"
                  value={form.materials_or_ingredients}
                  onChange={(e) => update("materials_or_ingredients", e.target.value)}
                />
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">What certifications or compliances does the product meet?:</label>
                <textarea
                  className="bg-form-textarea"
                  rows={3}
                  placeholder="e.g., FDA, organic, cruelty-free, etc"
                  value={form.certifications}
                  onChange={(e) => update("certifications", e.target.value)}
                />
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">Who is the target customer for this product?:</label>
                <input
                  className="bg-form-input"
                  placeholder="e.g., Eco-conscious women aged 25-40"
                  value={form.target_customer}
                  onChange={(e) => update("target_customer", e.target.value)}
                />
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">
                  Upload your product images:{" "}
                  <span style={{ color: "var(--portal-text-muted)", fontWeight: 400 }}>
                    High-quality photos of your product (JPG, PNG, or PSD preferred)
                  </span>
                </label>
                <button
                  type="button"
                  className="branding-btn-primary"
                  style={{ height: 36, minWidth: 0, padding: "0 1.4rem", fontSize: 13 }}
                  onClick={() =>
                    setError("File upload is coming soon — describe your product in detail above for now.")
                  }
                >
                  <Upload size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                  Upload
                </button>
              </div>
            </section>

            {/* 2. Visual Style Preferences */}
            <section className="bg-form-section">
              <h3 className="bg-form-section-title">2. Visual Style Preferences</h3>

              <div className="bg-form-field">
                <label className="bg-form-label">Do you have brand guidelines or a style guide?</label>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <label className="bg-form-checkbox" style={{ marginBottom: 0 }}>
                    <input
                      type="radio"
                      name="has_brand_guidelines"
                      checked={form.has_brand_guidelines === "yes"}
                      onChange={() => update("has_brand_guidelines", "yes")}
                    />
                    <strong style={{ marginRight: 4 }}>Yes:</strong>
                    <span style={{ color: "var(--portal-text-muted)" }}>Upload file</span>
                  </label>
                  <button
                    type="button"
                    className="branding-btn-primary"
                    style={{ height: 36, minWidth: 0, padding: "0 1.4rem", fontSize: 13 }}
                    onClick={() =>
                      setError("File upload is coming soon — describe your brand cues in the notes for now.")
                    }
                  >
                    <Upload size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                    Upload
                  </button>
                </div>
                <label className="bg-form-checkbox" style={{ marginTop: 6 }}>
                  <input
                    type="radio"
                    name="has_brand_guidelines"
                    checked={form.has_brand_guidelines === "no"}
                    onChange={() => update("has_brand_guidelines", "no")}
                  />
                  No
                </label>
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">
                  Preferred background style:{" "}
                  <span style={{ color: "var(--portal-text-muted)", fontWeight: 400 }}>Select one or more</span>
                </label>
                <div className="bg-form-grid-2" style={{ alignItems: "start" }}>
                  <div className="bg-form-deliverables">
                    {BACKGROUND_STYLE_OPTIONS.map((b) => (
                      <label key={b.id} className="bg-form-checkbox">
                        <input
                          type="checkbox"
                          checked={form.background_styles.includes(b.id)}
                          onChange={() => toggle("background_styles", b.id)}
                        />
                        {b.label}
                      </label>
                    ))}
                  </div>
                  <textarea
                    className="bg-form-textarea"
                    rows={4}
                    placeholder="Other?"
                    value={form.background_styles_other}
                    onChange={(e) => update("background_styles_other", e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">
                  Upload reference images or moodboard:{" "}
                  <span style={{ color: "var(--portal-text-muted)", fontWeight: 400 }}>
                    Examples you like or that represent the look and feel you want.
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
                    <button
                      type="button"
                      className="branding-btn-primary"
                      style={{ height: 36, minWidth: 0, padding: "0 1.4rem", fontSize: 13 }}
                      onClick={() =>
                        setError("File upload is coming soon — paste reference links above for now.")
                      }
                    >
                      <Upload size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                      Upload
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Mockup Content & Layout */}
            <section className="bg-form-section">
              <h3 className="bg-form-section-title">3. Mockup Content &amp; Layout</h3>

              <div className="bg-form-field">
                <label className="bg-form-label">
                  What type of mockups do you need?:{" "}
                  <span style={{ color: "var(--portal-text-muted)", fontWeight: 400 }}>Select all that apply</span>
                </label>
                <div className="bg-form-grid-2" style={{ alignItems: "start" }}>
                  <div className="bg-form-deliverables">
                    {MOCKUP_TYPE_OPTIONS.map((m) => (
                      <label key={m.id} className="bg-form-checkbox">
                        <input
                          type="checkbox"
                          checked={form.mockup_types.includes(m.id)}
                          onChange={() => toggle("mockup_types", m.id)}
                        />
                        {m.label}
                      </label>
                    ))}
                  </div>
                  <textarea
                    className="bg-form-textarea"
                    rows={4}
                    placeholder="Other?"
                    value={form.mockup_types_other}
                    onChange={(e) => update("mockup_types_other", e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">List key features or selling points to highlight:</label>
                <textarea
                  className="bg-form-textarea"
                  rows={3}
                  placeholder="e.g., Sugar-free, 30-day guarantee, 2-in-1 function, made in the USA, etc."
                  value={form.highlight_features}
                  onChange={(e) => update("highlight_features", e.target.value)}
                />
              </div>

              <textarea
                className="bg-form-textarea"
                rows={3}
                placeholder="Additional Notes or Requests"
                value={form.additional_notes}
                onChange={(e) => update("additional_notes", e.target.value)}
                style={{ marginTop: 10 }}
              />

              <div className="bg-form-model-row">
                <label htmlFor="ecom-model">Model:</label>
                <select id="ecom-model" value={model} onChange={(e) => setModel(e.target.value)}>
                  {MODEL_OPTIONS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
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
