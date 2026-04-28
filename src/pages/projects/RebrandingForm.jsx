import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarCheck, RefreshCw, Upload, X } from "lucide-react";
import { fetchWithConfig } from "../../utils/authHelper";
import { apiServices } from "../../services/apiServices";
import RebrandingView from "./RebrandingView";
import { useLoading } from "../../context/LoadingContext";

const REBRANDING_LOADER_MESSAGES = [
  "Reading your rebranding brief…",
  "Auditing the current brand…",
  "Mapping the positioning shift…",
  "Drafting the new brand essence…",
  "Sketching visual direction…",
  "Plotting the rollout phases…",
  "Lining up deliverables…",
  "Polishing risks &amp; next steps…",
  "Almost there…",
];

const SCOPE_OPTIONS = [
  { id: "logo_redesign", label: "Logo redesign" },
  { id: "typography", label: "Typography" },
  { id: "brand_manual", label: "Brand manual" },
  { id: "corporate_stationery", label: "Corporate stationery" },
  { id: "social_media_assets", label: "Social media graphic assets" },
  { id: "editable_templates", label: "Editable templates" },
];

const MODEL_OPTIONS = [
  { id: "claude-opus-4-7", label: "Claude Opus 4.7 (default — most capable)" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 (balanced)" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5 (fast)" },
];

const initialForm = {
  current_brand_name: "",
  current_links: ["", "", "", "", "", ""],
  whats_not_working: "",
  motivation: "",
  goals: "",
  ideal_customer: "",
  desired_values: "",
  perception_after: "",
  reference_links: ["", "", ""],
  scope: [],
  scope_other: "",
  additional_notes: "",
};

export default function RebrandingForm() {
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
        const res = await fetchWithConfig("rebranding/models", { method: "GET" });
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
      form.current_brand_name.trim().length > 0 &&
      form.whats_not_working.trim().length > 0,
    [form]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!ready || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await withLoading(
        () => apiServices.generate_rebranding({ form, model }),
        REBRANDING_LOADER_MESSAGES,
        { label: "AI is thinking", intervalMs: 2200 }
      );
      if (!res?.success) {
        throw new Error(res?.message || "Generation failed");
      }
      setResult(res);
    } catch (err) {
      setError(err?.message || "Failed to generate rebranding plan.");
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
        <RefreshCw size={16} />
      </span>
      <h3>Rebranding Services</h3>
      <p style={{ fontSize: 12, color: "var(--portal-text-muted)" }}>
        Refresh and reposition your brand with strategic updates.
      </p>
      <ul style={{ marginTop: "0.6rem" }}>
        <li>Visual and messaging redesign based on market trends.</li>
        <li>Full brand audit to identify opportunities for evolution.</li>
        <li>Relaunch-ready assets that modernize your identity.</li>
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
              <RefreshCw size={20} />
            </span>
            <div>
              <h2>Branding and Design</h2>
              <p>Craft Identity. Inspire Loyalty. Drive Growth: Build a Brand That Stands Out.</p>
            </div>
          </div>

          <div style={{ padding: "1.4rem 1.6rem" }}>
            <div className="bg-thanks-card" style={{ padding: "1rem 0 1.6rem" }}>
              <h2>Thank you — your rebranding plan is ready</h2>
              <p>
                We&apos;ve saved your request to <strong>My Projects</strong> under{" "}
                <strong>Branding &amp; Design</strong>. Below is the AI-generated rebranding plan
                your AOG strategist will review and refine with you.
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

            <RebrandingView
              rebranding={result.rebranding}
              brandName={form.current_brand_name}
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
            <RefreshCw size={20} />
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
                Help us transform your brand into its best version.
              </strong>{" "}
              Please fill out the form below with as much detail as possible. The more context you
              provide, the better we can refresh and elevate your brand identity while staying true
              to what makes it unique.
            </p>

            {/* 1. Current Brand Information */}
            <section className="bg-form-section">
              <h3 className="bg-form-section-title">1. Current Brand Information</h3>

              <div className="bg-form-field">
                <label className="bg-form-label">Current brand name:</label>
                <input
                  className="bg-form-input"
                  placeholder="e.g., Nova Design Studio"
                  value={form.current_brand_name}
                  onChange={(e) => update("current_brand_name", e.target.value)}
                  required
                />
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">Website or social media (if applicable):</label>
                <div className="bg-form-grid-2">
                  {form.current_links.map((v, i) => (
                    <input
                      key={i}
                      className="bg-form-input"
                      placeholder="e.g., www.brandname.com / @brandname"
                      value={v}
                      onChange={(e) => updateArrayItem("current_links", i, e.target.value)}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">
                  What&apos;s not working or what would you like to change about your current brand?
                </label>
                <textarea
                  className="bg-form-textarea"
                  rows={3}
                  placeholder="e.g., The logo feels outdated, the colors don't reflect our values…"
                  value={form.whats_not_working}
                  onChange={(e) => update("whats_not_working", e.target.value)}
                  required
                />
              </div>
            </section>

            {/* 2. Rebranding Goals */}
            <section className="bg-form-section">
              <h3 className="bg-form-section-title">2. Rebranding Goals</h3>

              <div className="bg-form-field">
                <label className="bg-form-label">What&apos;s motivating you to rebrand?</label>
                <textarea
                  className="bg-form-textarea"
                  rows={3}
                  placeholder="e.g., We've grown and need a more mature look…"
                  value={form.motivation}
                  onChange={(e) => update("motivation", e.target.value)}
                />
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">What do you hope to achieve with this rebrand?</label>
                <textarea
                  className="bg-form-textarea"
                  rows={3}
                  placeholder="e.g., Attract new customers, align with new market, improve recognition…"
                  value={form.goals}
                  onChange={(e) => update("goals", e.target.value)}
                />
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">Who is your ideal customer or target audience?</label>
                <input
                  className="bg-form-input"
                  placeholder="e.g., Young professionals aged 25-35, small business owners, eco-conscious families…"
                  value={form.ideal_customer}
                  onChange={(e) => update("ideal_customer", e.target.value)}
                />
              </div>
            </section>

            {/* 3. Desired Brand Identity */}
            <section className="bg-form-section">
              <h3 className="bg-form-section-title">3. Desired Brand Identity</h3>

              <div className="bg-form-field">
                <label className="bg-form-label">What values should your new brand communicate?</label>
                <input
                  className="bg-form-input"
                  placeholder="e.g., Sustainability, trust, boldness, creativity…"
                  value={form.desired_values}
                  onChange={(e) => update("desired_values", e.target.value)}
                />
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">
                  How do you want your brand to be perceived after the rebrand?
                </label>
                <input
                  className="bg-form-input"
                  placeholder="e.g., More modern and confident, more approachable, more premium…"
                  value={form.perception_after}
                  onChange={(e) => update("perception_after", e.target.value)}
                />
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">Do you have visual references or brands you admire?</label>
                {form.reference_links.map((v, i) => (
                  <input
                    key={i}
                    className="bg-form-input"
                    placeholder="Paste link"
                    value={v}
                    onChange={(e) => updateArrayItem("reference_links", i, e.target.value)}
                    style={{ marginBottom: 5 }}
                  />
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--portal-text-muted)" }}>
                    Or upload files:
                  </span>
                  <button
                    type="button"
                    className="branding-btn-primary"
                    style={{ height: 36, minWidth: 0, padding: "0 1.2rem", fontSize: 13 }}
                    onClick={() =>
                      setError(
                        "File upload is coming soon — paste reference links above for now."
                      )
                    }
                  >
                    <Upload size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                    Upload
                  </button>
                </div>
              </div>
            </section>

            {/* 4. Final details */}
            <section className="bg-form-section">
              <h3 className="bg-form-section-title">4. Final details</h3>

              <p
                style={{
                  fontSize: 12,
                  color: "var(--portal-text-muted)",
                  margin: "0 0 0.7rem",
                }}
              >
                <strong>Scope of the Rebrand:</strong> Select the elements you&apos;d like to include in this
                rebranding:
              </p>

              <div className="bg-form-deliverables">
                {SCOPE_OPTIONS.map((d) => (
                  <label key={d.id} className="bg-form-checkbox">
                    <input
                      type="checkbox"
                      checked={form.scope.includes(d.id)}
                      onChange={() => toggle("scope", d.id)}
                    />
                    {d.label}
                  </label>
                ))}
              </div>
              <input
                className="bg-form-input"
                placeholder="Other?"
                value={form.scope_other}
                onChange={(e) => update("scope_other", e.target.value)}
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
                <label htmlFor="rb-model">Model:</label>
                <select id="rb-model" value={model} onChange={(e) => setModel(e.target.value)}>
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
