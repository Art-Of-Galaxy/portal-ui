import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Video, CalendarCheck, Paperclip, X, Image as ImageIcon,
  AlertTriangle, CreditCard, ExternalLink,
} from "lucide-react";
import { apiServices } from "../../services/apiServices";
import UGCAdsView from "./UGCAdsView";
import FileUploadButton from "../../components/ui/FileUploadButton";
import { useLoading } from "../../context/LoadingContext";

const UGC_LOADER_MESSAGES = [
  "Reading your product brief...",
  "Uploading your product images to Higgsfield...",
  "Wiring up the reference video as a style template...",
  "Composing the Higgsfield prompt with Claude...",
  "Queueing your video on Marketing Studio...",
  "Casting an everyday presenter...",
  "Filming the take...",
  "Cutting captions and audio...",
  "Polishing the final render...",
  "Almost there...",
];

// Ad style modes shown as visual cards. Maps 1:1 to Higgsfield's `mode`
// enum on marketing_studio_video. "Review / Testimonial" is the closest
// fit to the street-interview pattern.
const AD_STYLES = [
  {
    id: "ugc",
    title: "Casual UGC",
    blurb: "Phone-filmed organic feel, candid energy.",
  },
  {
    id: "product_review",
    title: "Review / Testimonial",
    blurb: "Interview style with mic in frame and word-by-word captions.",
  },
  {
    id: "ugc_unboxing",
    title: "Unboxing",
    blurb: "Open the packaging on camera with a genuine reaction.",
  },
  {
    id: "ugc_how_to",
    title: "Tutorial / How-To",
    blurb: "Quick explainer walking through how to use the product.",
  },
  {
    id: "ugc_virtual_try_on",
    title: "Try-On",
    blurb: "Presenter physically wears or interacts with the product.",
  },
  {
    id: "product_showcase",
    title: "Polished Showcase",
    blurb: "Clean studio look, controlled lighting, slow camera moves.",
  },
];

const ASPECT_OPTIONS = [
  { id: "9:16", label: "Vertical (Reels / TikTok)" },
  { id: "1:1", label: "Square (Feed)" },
  { id: "16:9", label: "Horizontal (YouTube)" },
];

const DURATION_OPTIONS = [
  { id: 10, label: "10s" },
  { id: 15, label: "15s" },
  { id: 20, label: "20s" },
  { id: 30, label: "30s" },
];

const RESOLUTION_OPTIONS = [
  { id: "480p", label: "480p" },
  { id: "720p", label: "720p" },
  { id: "1080p", label: "1080p" },
];

const TONE_OPTIONS = [
  { id: "casual",      label: "Casual" },
  { id: "professional",label: "Professional" },
  { id: "energetic",   label: "Energetic" },
  { id: "calm",        label: "Calm" },
  { id: "funny",       label: "Funny" },
  { id: "premium",     label: "Premium" },
];

const initialForm = {
  product_name: "",
  product_description: "",
  product_image_urls: [],
  mode: "product_review",
  aspect_ratio: "9:16",
  duration: 15,
  resolution: "720p",
  generate_audio: true,
  tone: [],
  target_audience: "",
  key_message: "",
  talking_points: "",
  reference_video_url: "",
  reference_links: ["", ""],
};

export default function UGCAdsForm() {
  const navigate = useNavigate();
  const { withLoading } = useLoading();

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  // Error is { message, code? } so we can render specific guidance for
  // known backend error_codes (e.g. not_enough_credits gets a top-up
  // CTA) and fall back to a plain banner otherwise.
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(true);

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
      form.product_description.trim().length >= 8 &&
      form.product_image_urls.length > 0,
    [form]
  );

  const runGenerate = async () => {
    if (!ready || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await withLoading(
        () => apiServices.generate_ugc_ad({ form }),
        UGC_LOADER_MESSAGES,
        { label: "AI is producing your ad", intervalMs: 4000 }
      );
      if (!res?.success) {
        const fakeErr = new Error(res?.message || "Generation failed");
        fakeErr.body = res || null;
        throw fakeErr;
      }
      setResult(res);
    } catch (err) {
      // fetchWithConfig attaches the parsed response body to err.body
      // (see utils/authHelper). Pull error_code / higgsfield off it so
      // the banner can render a branch-specific message + CTA.
      const body = err?.body || {};
      setError({
        message: err?.message || body.message || "Failed to generate the ad video.",
        code: body.error_code || null,
        higgsfield: body.higgsfield || null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    runGenerate();
  };

  const sidebar = (
    <aside className="bg-form-side">
      <span
        style={{
          width: 38,
          height: 38,
          borderRadius: 9,
          background: "linear-gradient(135deg, #5540ff 0%, #00ff89 100%)",
          color: "#fff",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Video size={16} />
      </span>
      <h3>UGC Ads Video</h3>
      <p style={{ fontSize: 12, color: "var(--portal-text-muted)" }}>
        Generate real, candid social ads that put your product in a presenter&apos;s hands.
      </p>
      <ul style={{ marginTop: "0.6rem" }}>
        <li>Powered by Higgsfield Marketing Studio.</li>
        <li>Choose the format that fits your channel.</li>
        <li>Attach a reference video and we will mirror its style.</li>
      </ul>
    </aside>
  );

  const meetingSidebar = (
    <aside className="bg-form-side">
      <div className="bg-form-meeting-card">
        <h4>Want to talk through the angle first?</h4>
        <p>
          Book a quick call with a strategist to nail the script and creative direction before
          we burn render credits.
        </p>
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
          onClick={() => navigate("/new-projects/video")}
        >
          <ArrowLeft size={16} />
          Back to AI Video Production
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
          onClick={() => navigate("/new-projects/video")}
        >
          <ArrowLeft size={16} />
          Back to AI Video Production
        </button>

        <UGCAdsView
          video={result.video}
          prompt={result.prompt}
          productName={form.product_name}
          productDescription={form.product_description}
          mode={result.mode}
          aspectRatio={result.aspect_ratio}
          duration={result.duration}
          resolution={result.resolution}
          projectId={result.project_id}
          onAnother={() => { setResult(null); }}
          statusLabel="Done"
        />
      </div>
    );
  }

  return (
    <div className="portal-page">
      <button
        type="button"
        className="portal-back-link"
        onClick={() => navigate("/new-projects/video")}
      >
        <ArrowLeft size={16} />
        Back to AI Video Production
      </button>

      <form className="bg-form-shell" onSubmit={handleSubmit}>
        <div className="bg-form-header">
          <span className="bg-form-header-tile">
            <Video size={20} />
          </span>
          <div style={{ flex: 1 }}>
            <h2>UGC Ads Video</h2>
            <p>Tell us about your product and pick the angle. We&apos;ll generate the ad.</p>
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
            {error ? <UgcErrorBanner error={error} onDismiss={() => setError(null)} /> : null}

            <p style={{ fontSize: 13, color: "var(--portal-text-muted)", marginBottom: "1rem" }}>
              <strong style={{ color: "var(--portal-text)" }}>
                One ad, your product, real energy.
              </strong>{" "}
              Each video runs through Higgsfield Marketing Studio. Sharper briefs produce
              sharper outputs, so the more context you give the better.
            </p>

            {/* 1. Product */}
            <section className="bg-form-section">
              <div className="bg-form-field">
                <label className="bg-form-label">Product or Brand Name *</label>
                <input
                  className="bg-form-input"
                  placeholder="Exact product name as you want it referenced"
                  value={form.product_name}
                  onChange={(e) => update("product_name", e.target.value)}
                  required
                />
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">Product Description *</label>
                <textarea
                  className="bg-form-textarea"
                  rows={3}
                  placeholder="One or two sentences: what it is, who it is for, what makes it different."
                  value={form.product_description}
                  onChange={(e) => update("product_description", e.target.value)}
                  required
                />
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">
                  Product Images{" "}
                  <span style={{ color: "var(--portal-text-muted)", fontWeight: 400 }}>
                    Upload 1 to 4 high-quality shots of the product itself.
                  </span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <FileUploadButton
                    category="AI Video Production"
                    serviceType="ugc_ads"
                    projectName={form.product_name || "UGC Ads Request"}
                    accept="image/*"
                    multiple
                    onUploaded={({ url }) =>
                      update("product_image_urls", [
                        ...form.product_image_urls,
                        url,
                      ].slice(0, 4))
                    }
                    onError={(msg) => setError({ message: msg, code: "upload_failed" })}
                  />
                  <span style={{ fontSize: 12, color: "var(--portal-text-muted)" }}>
                    {form.product_image_urls.length} / 4 uploaded
                  </span>
                </div>
                {form.product_image_urls.length ? (
                  <ul className="upload-chip-list">
                    {form.product_image_urls.map((url, i) => (
                      <li key={url + i} className="upload-chip">
                        <ImageIcon size={12} />
                        <a href={url} target="_blank" rel="noreferrer">Image {i + 1}</a>
                        <button
                          type="button"
                          aria-label="Remove"
                          onClick={() =>
                            update(
                              "product_image_urls",
                              form.product_image_urls.filter((_, j) => j !== i)
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
            </section>

            {/* 2. Style of ad */}
            <section className="bg-form-section">
              <div className="bg-form-field">
                <label className="bg-form-label">
                  Style of Ad{" "}
                  <span style={{ color: "var(--portal-text-muted)", fontWeight: 400 }}>
                    Pick the format you want
                  </span>
                </label>
                <div className="bg-form-typography-grid">
                  {AD_STYLES.map((s) => {
                    const selected = form.mode === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className={`bg-form-typography-card ${selected ? "is-selected" : ""}`}
                        onClick={() => update("mode", s.id)}
                      >
                        <span className="bg-form-typography-sample" style={{ fontSize: 14, fontWeight: 700 }}>
                          {s.title}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--portal-text-muted)", lineHeight: 1.35 }}>
                          {s.blurb}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 3. Message & tone */}
            <section className="bg-form-section">
              <div className="bg-form-field">
                <label className="bg-form-label">Key Message (one line)</label>
                <input
                  className="bg-form-input"
                  placeholder="e.g. Real peach taste, zero sugar, perfect for poolside."
                  value={form.key_message}
                  onChange={(e) => update("key_message", e.target.value)}
                />
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">Talking Points</label>
                <textarea
                  className="bg-form-textarea"
                  rows={3}
                  placeholder="Two or three specific things the presenter should mention (features, benefits, social proof, etc.)."
                  value={form.talking_points}
                  onChange={(e) => update("talking_points", e.target.value)}
                />
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">Tone</label>
                <div className="bg-form-color-swatches" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
                  {TONE_OPTIONS.map((t) => {
                    const selected = form.tone.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={`bg-form-color-swatch ${selected ? "is-selected" : ""}`}
                        style={{
                          background: selected
                            ? "linear-gradient(135deg, #5540ff 0%, #00ff89 100%)"
                            : "var(--portal-surface-muted)",
                          color: selected ? "#fff" : "var(--portal-text)",
                          minHeight: 44,
                        }}
                        onClick={() => toggle("tone", t.id)}
                      >
                        <strong style={{ fontSize: 13 }}>{t.label}</strong>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">Target Audience</label>
                <input
                  className="bg-form-input"
                  placeholder="e.g. women 25 to 35 who shop summer drinks for friends"
                  value={form.target_audience}
                  onChange={(e) => update("target_audience", e.target.value)}
                />
              </div>
            </section>

            {/* 4. References */}
            <section className="bg-form-section">
              <div className="bg-form-field">
                <label className="bg-form-label">
                  Reference Video{" "}
                  <span style={{ color: "var(--portal-text-muted)", fontWeight: 400 }}>
                    Optional. If you upload an ad you love, we mirror its style.
                  </span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <FileUploadButton
                    category="AI Video Production"
                    serviceType="ugc_ads"
                    projectName={form.product_name || "UGC Ads Request"}
                    accept="video/*"
                    onUploaded={({ url }) => update("reference_video_url", url)}
                    onError={(msg) => setError({ message: msg, code: "upload_failed" })}
                  />
                  <span style={{ fontSize: 12, color: "var(--portal-text-muted)" }}>
                    {form.reference_video_url ? "1 video attached" : "No video attached"}
                  </span>
                </div>
                {form.reference_video_url ? (
                  <ul className="upload-chip-list">
                    <li className="upload-chip">
                      <Paperclip size={12} />
                      <a href={form.reference_video_url} target="_blank" rel="noreferrer">
                        Reference video
                      </a>
                      <button
                        type="button"
                        aria-label="Remove"
                        onClick={() => update("reference_video_url", "")}
                      >
                        <X size={11} />
                      </button>
                    </li>
                  </ul>
                ) : null}
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">
                  Reference Links{" "}
                  <span style={{ color: "var(--portal-text-muted)", fontWeight: 400 }}>
                    Optional. Paste links to ads or videos you like.
                  </span>
                </label>
                {form.reference_links.map((v, i) => (
                  <input
                    key={i}
                    className="bg-form-input"
                    style={{ marginBottom: 6 }}
                    placeholder="Reference link"
                    value={v}
                    onChange={(e) => updateArrayItem("reference_links", i, e.target.value)}
                  />
                ))}
              </div>
            </section>

            {/* 5. Output options */}
            <section className="bg-form-section">
              <div className="bg-form-field">
                <label className="bg-form-label">Aspect Ratio</label>
                <div className="bg-form-color-swatches" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
                  {ASPECT_OPTIONS.map((a) => {
                    const selected = form.aspect_ratio === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        className={`bg-form-color-swatch ${selected ? "is-selected" : ""}`}
                        style={{
                          background: selected
                            ? "linear-gradient(135deg, #5540ff 0%, #00ff89 100%)"
                            : "var(--portal-surface-muted)",
                          color: selected ? "#fff" : "var(--portal-text)",
                          minHeight: 50,
                        }}
                        onClick={() => update("aspect_ratio", a.id)}
                      >
                        <strong style={{ fontSize: 13 }}>{a.id}</strong>
                        <span style={{ fontSize: 11, opacity: 0.9 }}>{a.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">Duration</label>
                <div className="bg-form-color-swatches" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
                  {DURATION_OPTIONS.map((d) => {
                    const selected = form.duration === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        className={`bg-form-color-swatch ${selected ? "is-selected" : ""}`}
                        style={{
                          background: selected
                            ? "linear-gradient(135deg, #5540ff 0%, #00ff89 100%)"
                            : "var(--portal-surface-muted)",
                          color: selected ? "#fff" : "var(--portal-text)",
                          minHeight: 44,
                        }}
                        onClick={() => update("duration", d.id)}
                      >
                        <strong style={{ fontSize: 13 }}>{d.label}</strong>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-form-field">
                <label className="bg-form-label">Resolution</label>
                <div className="bg-form-color-swatches" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
                  {RESOLUTION_OPTIONS.map((r) => {
                    const selected = form.resolution === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        className={`bg-form-color-swatch ${selected ? "is-selected" : ""}`}
                        style={{
                          background: selected
                            ? "linear-gradient(135deg, #5540ff 0%, #00ff89 100%)"
                            : "var(--portal-surface-muted)",
                          color: selected ? "#fff" : "var(--portal-text)",
                          minHeight: 44,
                        }}
                        onClick={() => update("resolution", r.id)}
                      >
                        <strong style={{ fontSize: 13 }}>{r.label}</strong>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-form-field" style={{ marginTop: "0.4rem" }}>
                <label
                  className="bg-form-label"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    checked={form.generate_audio}
                    onChange={(e) => update("generate_audio", e.target.checked)}
                  />
                  Generate audio (voiceover + ambient)
                </label>
              </div>
            </section>

            <section className="bg-form-section">
              <div className="bg-form-submit">
                <button
                  type="submit"
                  className={ready ? "is-ready" : ""}
                  disabled={!ready || submitting}
                >
                  {submitting ? "Generating..." : "Generate ad video"}
                </button>
                <span style={{ display: "block", marginTop: 6, fontSize: 11, color: "var(--portal-text-muted)" }}>
                  Video generation typically takes 3 to 8 minutes. We&apos;ll save the result to
                  your My Files automatically.
                </span>
              </div>
            </section>
          </div>

          {meetingSidebar}
        </div>
      </form>
    </div>
  );
}

// Error banner with code-specific branches. For "not_enough_credits" we
// show a billing-themed surface + a top-up link, since that's the most
// common failure mode and it needs a clear next step. Other codes fall
// through to a generic red banner.
function UgcErrorBanner({ error, onDismiss }) {
  const isCredits = error?.code === "not_enough_credits";
  return (
    <div
      role="alert"
      className="ugc-error-banner"
      data-code={error?.code || "generic"}
      style={{
        background: isCredits ? "rgba(85, 64, 255, 0.07)" : "rgba(232, 77, 77, 0.10)",
        border: `1px solid ${isCredits ? "rgba(85, 64, 255, 0.30)" : "rgba(232, 77, 77, 0.30)"}`,
        borderRadius: 10,
        padding: "0.85rem 1rem",
        marginBottom: "1rem",
        fontSize: 13,
        color: isCredits ? "var(--portal-text)" : "var(--portal-danger)",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          background: isCredits ? "var(--portal-accent-tint)" : "rgba(232,77,77,0.15)",
          color: isCredits ? "var(--portal-accent-solid)" : "var(--portal-danger)",
        }}
      >
        {isCredits ? <CreditCard size={15} /> : <AlertTriangle size={15} />}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ display: "block", marginBottom: 2, color: "var(--portal-text)" }}>
          {isCredits ? "Not enough Higgsfield credits" : "We couldn't generate the video"}
        </strong>
        <span>{error?.message}</span>
        {isCredits ? (
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a
              href="https://higgsfield.ai/account/billing"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "linear-gradient(135deg, var(--portal-accent-solid) 0%, var(--portal-brand-green) 100%)",
                color: "#fff",
                padding: "0.4rem 0.85rem",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(85, 64, 255, 0.20)",
              }}
            >
              Top up Higgsfield credits <ExternalLink size={11} />
            </a>
            <button
              type="button"
              onClick={onDismiss}
              style={{
                background: "transparent",
                border: "1px solid var(--portal-border)",
                color: "var(--portal-text-muted)",
                padding: "0.4rem 0.85rem",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Dismiss
            </button>
          </div>
        ) : null}
      </div>
      {!isCredits ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            background: "transparent",
            border: 0,
            color: "var(--portal-danger)",
            cursor: "pointer",
            padding: 0,
            marginLeft: 8,
          }}
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}

UgcErrorBanner.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string,
    code: PropTypes.string,
  }).isRequired,
  onDismiss: PropTypes.func.isRequired,
};
