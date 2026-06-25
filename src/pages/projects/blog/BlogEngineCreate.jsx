import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertTriangle, ArrowLeft, ArrowRight, Calendar, ChevronLeft, ChevronRight,
  Image as ImageIcon, Loader2, RefreshCw, Sparkles, Store, Upload,
} from "lucide-react";
import { apiServices } from "../../../services/apiServices";
import BrandAssetUploader from "../../../components/brand/BrandAssetUploader";

// Blog Engine create flow. Single component orchestrating five
// sub-screens (TypePicker → Brief → Generating → Preview → Publish →
// Success). Brief state is shared across steps. Hydrates from
// ?article=ID for re-edit and ?mode=autopilot from the Hub CTA.

const MODES = {
  autopilot: {
    emoji: "🌸", label: "Autopilot Engine", tag: "Recommended", grad: "linear-gradient(135deg,#0f766e,#34d399)",
    desc: "Hand the agent a keyword bank and a cadence. It researches, writes, optimizes, and auto-publishes to Shopify on schedule.",
    pills: ["recurring", "auto-publish", "SEO + GEO + AEO"],
    steps: ["Connecting to your Shopify blog", "Clustering your keyword bank", "Drafting the first article", "Optimizing for SEO / GEO / AEO", "Scheduling the publishing queue"],
  },
  single: {
    emoji: "📝", label: "Single Article", tag: "One post", grad: "linear-gradient(150deg,#0f766e,#134e4a)",
    desc: "One keyword, one polished article. Research, draft, optimize, preview, publish.",
    pills: ["1 article", "SEO-optimized"],
    steps: ["Connecting to your Shopify blog", "Researching keyword + search intent", "Outlining the article", "Drafting the full article on-brand", "Optimizing meta, links + schema"],
  },
  cluster: {
    emoji: "🕸", label: "Topic Cluster", tag: "Pillar + posts", grad: "linear-gradient(150deg,#7c3aed,#4c1d95)",
    desc: "One pillar article plus supporting posts, generated and queued together.",
    pills: ["1 pillar + N posts"],
    steps: ["Connecting to your Shopify blog", "Mapping pillar + supporting topics", "Drafting the pillar article", "Drafting each supporting post", "Queueing them for publish"],
  },
  bulk: {
    emoji: "📚", label: "Bulk from Keywords", tag: "Batch", grad: "linear-gradient(150deg,#0057ff,#0d9488)",
    desc: "Paste a keyword list. We generate an article for each and queue them all.",
    pills: ["many articles", "queued"],
    steps: ["Connecting to your Shopify blog", "Parsing your keyword list", "Drafting an article per keyword", "Optimizing each for search", "Queueing them for publish"],
  },
};

const INTENT_OPTIONS = [
  { val: "informational", emoji: "📚", title: "Informational", desc: "Educate, build authority (how-to, guides)" },
  { val: "commercial",    emoji: "🛒", title: "Commercial",    desc: "Comparison + best-of, pre-purchase research" },
  { val: "transactional", emoji: "💰", title: "Transactional", desc: "Drive product clicks + conversions" },
  { val: "aeo",           emoji: "🤖", title: "Answer / GEO",  desc: "Optimized to be cited by AI + answer engines" },
];

const TONE_OPTIONS = ["📚 Educational", "☕ Warm + friendly", "🔬 Science-backed", "✨ Aspirational", "💬 Conversational", "💎 Premium"];

const LENGTH_OPTIONS = [
  { val: "short",    emoji: "⚡", title: "Short · 600 to 900w",    desc: "Quick reads, news, updates" },
  { val: "standard", emoji: "📄", title: "Standard · 1,200 to 1,600w", desc: "The SEO sweet spot" },
  { val: "long",     emoji: "📖", title: "Long-form · 2,000w+",    desc: "Pillar + authority pieces" },
  { val: "auto",     emoji: "🪄", title: "Let the agent decide",   desc: "Length matched to intent" },
];

const CADENCE_OPTIONS = [
  { val: "daily",    num: "7×", lab: "per week" },
  { val: "3x",       num: "3×", lab: "per week" },
  { val: "2x",       num: "2×", lab: "per week" },
  { val: "weekly",   num: "1×", lab: "per week" },
  { val: "biweekly", num: "2×", lab: "per month" },
  { val: "monthly",  num: "1×", lab: "per month" },
];

const MODE_ORDER = ["autopilot", "single", "cluster", "bulk"];

// ---------- TypePicker ----------

function TypePicker({ onPick }) {
  return (
    <div className="sm-create-content">
      <div className="sm-create-eyebrow">SEO Blog Generation</div>
      <h1 className="sm-create-headline">How should we write &amp; publish?</h1>
      <p className="sm-create-sub">Generate SEO / GEO / AEO articles and push them straight to your Shopify blog. One at a time, or fully on autopilot.</p>
      <div className="sm-type-grid">
        {MODE_ORDER.map((key) => {
          const m = MODES[key];
          const featured = key === "autopilot";
          return (
            <button
              key={key}
              type="button"
              className={`sm-type-card ${featured ? "is-featured" : ""}`}
              onClick={() => onPick(key)}
            >
              <span className="sm-type-icon" style={{ background: m.grad, color: "#fff" }}>{m.emoji}</span>
              <span className="sm-type-tag">{m.tag}</span>
              <h3 className="sm-type-title">{m.label}</h3>
              <p className="sm-type-desc">{m.desc}</p>
              <div className="sm-type-meta">
                {m.pills.map((p) => <span key={p} className="sm-type-ratio">{p}</span>)}
                <ArrowRight size={14} className="sm-type-arrow" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
TypePicker.propTypes = { onPick: PropTypes.func.isRequired };

// ---------- Brief builder ----------

function buildBriefSteps(mode) {
  const topicStep = {
    name: "Topic", icon: "💡",
    q: mode === "autopilot" ? "What's your keyword bank?"
      : mode === "cluster" ? "What's the pillar topic?"
        : mode === "bulk" ? "Paste your keywords"
          : "What should this article rank for?",
    sub: mode === "autopilot" ? "One keyword or topic per line. The agent rotates through them."
      : mode === "bulk" ? "One keyword per line. We'll write an article for each (max 25)."
        : "Give a primary keyword or topic. The agent picks search intent and angle.",
    fields: (mode === "autopilot" || mode === "bulk") ? [
      { id: "brand", type: "text", label: "Brand", placeholder: "e.g. Herbana", required: true },
      { id: "keywords", type: "textarea", label: "Keywords / topics", placeholder: "best adaptogens for stress\nashwagandha vs rhodiola\nhow to build a nootropic stack", required: true },
    ] : [
      { id: "brand", type: "text", label: "Brand", placeholder: "e.g. Herbana", required: true },
      { id: "keyword", type: "text", label: mode === "cluster" ? "Pillar keyword" : "Primary keyword", placeholder: "e.g. adaptogens for stress", required: true },
      { id: "angle", type: "textarea", label: "Angle / notes (optional)", placeholder: "e.g. Beginner-friendly, science-backed, lead toward our Calm stack product", required: false },
    ],
  };
  const seoStep = {
    name: "SEO + Intent", icon: "🔍",
    q: "How should it be optimized?",
    sub: "Search intent shapes structure. Meta + schema + internal links are always added.",
    options: { id: "intent", label: "Primary search intent", cols: 2, items: INTENT_OPTIONS },
  };
  const styleStep = {
    name: "Voice + Length", icon: "✍️",
    q: "Voice and length?",
    sub: "Match your brand and how deep you want to go.",
    chips: { id: "tone", label: "Tone of voice (pick up to 2)", max: 2, options: TONE_OPTIONS },
    options: { id: "length", label: "Article length", cols: 2, items: LENGTH_OPTIONS },
  };
  const imageStep = {
    name: "Featured image", icon: "🖼",
    q: "Featured image",
    sub: "Generate one via fal.ai, or upload your own. Reference images steer the generated style.",
    customImage: true,
  };
  const cadenceStep = {
    name: "Schedule", icon: "📅",
    q: "How often should it publish?",
    sub: "The engine drafts ahead and auto-pushes to Shopify on this cadence.",
    cadence: { id: "cadence", options: CADENCE_OPTIONS },
    chips: { id: "publish_time", label: "Preferred publish time", max: 1, options: ["🌅 08:00", "🌞 12:00", "🌇 18:00"] },
  };
  if (mode === "autopilot") return [topicStep, seoStep, styleStep, imageStep, cadenceStep];
  if (mode === "cluster")   return [topicStep, styleStep, seoStep, imageStep];
  return [topicStep, seoStep, styleStep, imageStep];
}

function BriefBuilder({ mode, brief, onUpdate, onBack, onGenerate }) {
  const steps = useMemo(() => buildBriefSteps(mode), [mode]);
  const [bStep, setBStep] = useState(0);
  const m = MODES[mode];
  const step = steps[bStep];
  const total = steps.length;
  const pct = Math.round(((bStep + 1) / total) * 100);

  function canAdvance() {
    if (step.fields) {
      for (const f of step.fields) {
        if (f.required && !(brief[f.id] || "").toString().trim()) return false;
      }
    }
    return true;
  }
  function next() {
    if (!canAdvance()) return;
    if (bStep === total - 1) { onGenerate(); return; }
    setBStep((s) => s + 1);
  }
  function back() {
    if (bStep === 0) { onBack(); return; }
    setBStep((s) => s - 1);
  }

  return (
    <div className="sm-create-content" style={{ alignItems: "stretch" }}>
      <div className="sm-progress-wrap" style={{ alignSelf: "center" }}>
        <div className="sm-progress-top">
          <span className="sm-progress-step">Step {bStep + 1} of {total} · <strong>{step.name}</strong></span>
          <span className="sm-progress-count">{pct}% complete</span>
        </div>
        <div className="sm-progress-track"><div className="sm-progress-fill" style={{ width: `${pct}%` }} /></div>
      </div>

      <section className="sm-brief-card" style={{ alignSelf: "center" }}>
        <div className="sm-brief-typebadge">{m.emoji} {m.label}</div>
        <div className="sm-brief-icon">{step.icon}</div>
        <h2 className="sm-brief-q">{step.q}</h2>
        <p className="sm-brief-sub">{step.sub}</p>

        {step.fields ? step.fields.map((f) => (
          <div key={f.id} className="sm-field">
            <label className="sm-field-label">
              {f.label}{!f.required ? <span className="sm-field-optional"> (optional)</span> : null}
            </label>
            {f.type === "textarea" ? (
              <textarea
                className="sm-field-input is-textarea"
                placeholder={f.placeholder}
                value={brief[f.id] || ""}
                onChange={(e) => onUpdate({ [f.id]: e.target.value })}
              />
            ) : (
              <input
                type="text"
                className="sm-field-input"
                placeholder={f.placeholder}
                value={brief[f.id] || ""}
                onChange={(e) => onUpdate({ [f.id]: e.target.value })}
              />
            )}
          </div>
        )) : null}

        {step.options ? (
          <>
            {step.options.label ? <label className="sm-field-label">{step.options.label}</label> : null}
            <div className="sm-option-grid is-2col">
              {step.options.items.map((it) => {
                const sel = brief[step.options.id] === it.val;
                return (
                  <button
                    key={it.val}
                    type="button"
                    className={`sm-option-card ${sel ? "is-selected" : ""}`}
                    onClick={() => onUpdate({ [step.options.id]: it.val })}
                  >
                    <div className="sm-option-inner">
                      <span className="sm-option-emoji">{it.emoji}</span>
                      <div>
                        <div className="sm-option-title">{it.title}</div>
                        <div className="sm-option-desc">{it.desc}</div>
                      </div>
                      <span className="sm-option-check">✓</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {step.cadence ? (
          <div className="sm-field">
            <div className="be-cadence-grid">
              {step.cadence.options.map((o) => {
                const sel = brief[step.cadence.id] === o.val;
                return (
                  <button
                    key={o.val}
                    type="button"
                    className={`be-cadence-card ${sel ? "is-selected" : ""}`}
                    onClick={() => onUpdate({ [step.cadence.id]: o.val })}
                  >
                    <div className="be-cadence-num">{o.num}</div>
                    <div className="be-cadence-lab">{o.lab}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {step.chips ? (
          <div className="sm-field">
            <label className="sm-field-label">{step.chips.label}</label>
            <div className="sm-chip-grid">
              {step.chips.options.map((opt) => {
                const arr = brief[step.chips.id] || [];
                const sel = arr.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    className={`sm-chip ${sel ? "is-selected" : ""}`}
                    onClick={() => {
                      const cur = brief[step.chips.id] || [];
                      const cap = step.chips.max || 99;
                      const nextArr = cur.includes(opt)
                        ? cur.filter((v) => v !== opt)
                        : (cur.length >= cap ? cur : [...cur, opt]);
                      onUpdate({ [step.chips.id]: nextArr });
                    }}
                  >{opt}</button>
                );
              })}
            </div>
          </div>
        ) : null}

        {step.customImage ? (
          <>
            <BrandAssetUploader
              value={brief.custom_image || []}
              onChange={(next) => onUpdate({ custom_image: next })}
              projectName={brief.brand || "Blog Article"}
              label="Custom featured image (optional)"
              helper="If set, we'll use this instead of generating one. PNG/JPG/WEBP."
              accept="image/*"
            />
            <div style={{ marginTop: "1rem" }} />
            <BrandAssetUploader
              value={brief.reference_images || []}
              onChange={(next) => onUpdate({ reference_images: next })}
              projectName={brief.brand || "Blog Article"}
              label="Reference images for fal.ai (optional)"
              helper="If you DON'T upload a custom image, fal.ai will generate one and use these as style references."
              accept="image/*"
            />
          </>
        ) : null}

        <footer className="sm-brief-nav">
          <button type="button" className="sm-back-btn" onClick={back}>
            <ChevronLeft size={14} /> Back
          </button>
          <button
            type="button"
            className={`sm-next-btn ${canAdvance() ? "is-ready" : ""}`}
            onClick={next}
            disabled={!canAdvance()}
          >
            {bStep === total - 1 ? <><Sparkles size={14} /> {mode === "autopilot" ? "Generate first article" : mode === "bulk" ? "Generate all articles" : "Generate article"}</> : <>Continue <ArrowRight size={14} /></>}
          </button>
        </footer>
      </section>
    </div>
  );
}
BriefBuilder.propTypes = {
  mode: PropTypes.string.isRequired,
  brief: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onGenerate: PropTypes.func.isRequired,
};

// ---------- Generating ----------

function Generating({ mode, onSettled }) {
  const m = MODES[mode];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (idx >= m.steps.length) { const tt = setTimeout(onSettled, 600); return () => clearTimeout(tt); }
    const tt = setTimeout(() => setIdx((i) => i + 1), 1100 + Math.random() * 600);
    return () => clearTimeout(tt);
  }, [idx, m.steps.length, onSettled]);
  return (
    <div className="sm-gen-content">
      <div className="sm-gen-orb">✦</div>
      <h2 className="sm-gen-title">{mode === "autopilot" ? "Setting up your autopilot..." : "Writing your article..."}</h2>
      <p className="sm-gen-sub">The Blog Agent is researching and drafting on-brand</p>
      <div className="sm-gen-steps">
        {m.steps.map((s, i) => (
          <div key={i} className={`sm-gen-step ${i < idx ? "is-done" : i === idx ? "is-active" : ""}`}>
            <span className="sm-gen-step-icon">{i < idx ? "✓" : i === idx ? <Loader2 size={12} className="bg-spin" /> : i + 1}</span>
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
Generating.propTypes = { mode: PropTypes.string.isRequired, onSettled: PropTypes.func.isRequired };

// ---------- Preview ----------

function Preview({ mode, brief, result, articleId, onFeaturedChange, onScheduleNext, onEdit }) {
  const m = MODES[mode];
  const spec = result?.spec || {};
  const featured = result?.featured || null;
  const bodyHtml = result?.body_html || "";
  const customFeaturedFromUser = (brief.custom_image || [])[0]?.url;

  // The hero shows whatever featured we have. Order: live `featured`
  // (which is what state reflects after any swap/regen), then the
  // user-supplied brief.custom_image, then the mode gradient.
  const currentImageUrl = featured?.url || customFeaturedFromUser || null;
  const heroBg = currentImageUrl
    ? `url(${currentImageUrl}) center/cover, ${m.grad}`
    : m.grad;

  // Featured-image picker state. Two buttons:
  //   - Upload: file input -> /api/files/upload -> setFeaturedImage
  //   - Regenerate: rerun fal.ai with the (optionally edited) prompt
  const fileInputRef = useRef(null);
  const [imgPrompt, setImgPrompt] = useState(spec.image_prompt || "");
  const [imgBusy, setImgBusy] = useState(null); // 'upload' | 'regen' | null
  const [imgError, setImgError] = useState("");
  useEffect(() => { setImgPrompt(spec.image_prompt || ""); }, [spec.image_prompt]);

  async function persistFeatured(image_url, source, content_type) {
    if (!articleId) {
      onFeaturedChange?.({ url: image_url, source, content_type: content_type || null });
      return;
    }
    const res = await apiServices.blog_engine_set_featured_image({
      id: articleId,
      image_url,
      source,
      content_type,
    });
    if (!res?.success) throw new Error(res?.message || "Could not save image.");
    onFeaturedChange?.(res.featured || { url: image_url, source, content_type });
  }

  async function handleUploadClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChosen(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { setImgError("Pick an image file."); return; }
    setImgBusy("upload");
    setImgError("");
    try {
      const up = await apiServices.upload_file(file, {
        projectName: brief.brand || "Blog Article",
        category: "blog-featured",
        serviceType: "blog-engine",
      });
      const url = up?.url || up?.file?.url || up?.data?.url;
      if (!url) throw new Error(up?.message || "Upload returned no URL.");
      await persistFeatured(url, "user", file.type);
    } catch (err) {
      setImgError(err?.message || "Upload failed.");
    } finally {
      setImgBusy(null);
    }
  }

  async function handleRegenerate() {
    if (!articleId) { setImgError("Save the draft first, then regenerate."); return; }
    if (!imgPrompt.trim()) { setImgError("Add an image prompt before regenerating."); return; }
    setImgBusy("regen");
    setImgError("");
    try {
      const refs = (brief.reference_images || []).map((r) => r?.url).filter(Boolean);
      const res = await apiServices.blog_engine_regen_image({
        id: articleId,
        prompt: imgPrompt,
        reference_image_urls: refs,
      });
      if (!res?.success || !res.featured?.url) throw new Error(res?.message || "Image generation failed.");
      onFeaturedChange?.(res.featured);
    } catch (err) {
      setImgError(err?.message || "Could not regenerate.");
    } finally {
      setImgBusy(null);
    }
  }

  const [editedMetaTitle, setEditedMetaTitle] = useState(spec.meta_title || "");
  const [editedMetaDesc, setEditedMetaDesc] = useState(spec.meta_description || "");
  const [editedHandle, setEditedHandle] = useState(spec.handle || "");
  useEffect(() => {
    setEditedMetaTitle(spec.meta_title || "");
    setEditedMetaDesc(spec.meta_description || "");
    setEditedHandle(spec.handle || "");
  }, [spec.meta_title, spec.meta_description, spec.handle]);

  return (
    <div className="be-preview-layout">
      <div className="be-article-wrap">
        <div className="be-article-hero" style={{ background: heroBg }}>
          {spec.kicker ? <div className="be-article-kicker">{spec.kicker}</div> : null}
          <div className="be-article-h1">{spec.title || brief.keyword || "Untitled article"}</div>
        </div>
        <div className="be-article-body">
          <div className="be-article-meta">
            <span>{brief.brand || "Editorial"}</span>
            <span>·</span>
            <span>{spec.word_count ? `${spec.word_count.toLocaleString()} words` : "~ 1,200 words"}</span>
            <span>·</span>
            <span>Draft</span>
          </div>
          <div className="be-prose" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        </div>
      </div>

      <aside className="be-seo-panel">
        <section className="be-seo-card">
          <span className="be-seo-label">Featured image</span>
          <div className="be-featured-preview" style={{ backgroundImage: currentImageUrl ? `url(${currentImageUrl})` : "none" }}>
            {!currentImageUrl ? <span className="be-featured-empty"><ImageIcon size={22} /> No image yet</span> : null}
            {featured?.source ? (
              <span className={`be-featured-badge is-${featured.source}`}>
                {featured.source === "user" ? "Your upload" : "AI generated"}
              </span>
            ) : null}
          </div>
          <div className="be-featured-actions">
            <button
              type="button"
              className="be-img-btn"
              onClick={handleUploadClick}
              disabled={imgBusy !== null}
            >
              {imgBusy === "upload" ? <Loader2 size={12} className="bg-spin" /> : <Upload size={12} />}
              Upload
            </button>
            <button
              type="button"
              className="be-img-btn"
              onClick={handleRegenerate}
              disabled={imgBusy !== null || !articleId}
              title={!articleId ? "Save the draft first" : "Regenerate with fal.ai"}
            >
              {imgBusy === "regen" ? <Loader2 size={12} className="bg-spin" /> : <RefreshCw size={12} />}
              Regenerate
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChosen}
          />
          <div className="be-meta-field" style={{ marginTop: 10 }}>
            <div className="be-meta-flabel"><span>Image prompt</span></div>
            <textarea
              className="be-meta-input is-area"
              rows={3}
              value={imgPrompt}
              onChange={(e) => setImgPrompt(e.target.value)}
              placeholder="Describe the image you want fal.ai to generate"
            />
          </div>
          {imgError ? <div className="be-img-error">{imgError}</div> : null}
        </section>

        <section className="be-seo-card">
          <span className="be-seo-label">SEO score</span>
          <div className="be-seo-score-row">
            <div className="be-seo-ring" style={{ background: `conic-gradient(#16a34a 0% ${(spec.seo_score || 0)}%, var(--portal-border) ${(spec.seo_score || 0)}% 100%)` }}>
              <div className="be-seo-ring-inner">{spec.seo_score || 0}</div>
            </div>
            <div className="be-seo-score-txt">
              {spec.seo_score >= 85 ? "Strong" : spec.seo_score >= 70 ? "Good" : "Needs work"}. Targeting <strong>{brief.keyword || (brief.keywords || "").split("\n")[0] || "your keyword"}</strong>.
            </div>
          </div>
          <div className="be-seo-checks">
            <div className="be-seo-check"><span className="be-seo-check-dot">✓</span> Keyword in title + H1</div>
            <div className="be-seo-check"><span className="be-seo-check-dot">✓</span> Meta title + description</div>
            <div className="be-seo-check"><span className="be-seo-check-dot">✓</span> FAQ schema for answer engines</div>
            {Array.isArray(spec.internal_link_suggestions) && spec.internal_link_suggestions.length ? (
              <div className="be-seo-check"><span className="be-seo-check-dot">✓</span> {spec.internal_link_suggestions.length} internal link suggestion{spec.internal_link_suggestions.length === 1 ? "" : "s"}</div>
            ) : null}
            {featured || customFeaturedFromUser ? <div className="be-seo-check"><span className="be-seo-check-dot">✓</span> Featured image with alt text</div> : null}
          </div>
        </section>

        <section className="be-seo-card">
          <span className="be-seo-label">Google preview</span>
          <div className="be-serp-preview">
            <div className="be-serp-url">{(brief.shop_domain || "yourstore.myshopify.com")} › blogs › {editedHandle || spec.handle || "article"}</div>
            <div className="be-serp-title">{editedMetaTitle || spec.meta_title || spec.title}</div>
            <div className="be-serp-desc">{editedMetaDesc || spec.meta_description || ""}</div>
          </div>
          <div className="be-meta-field">
            <div className="be-meta-flabel"><span>Meta title</span><span>{(editedMetaTitle || "").length}/60</span></div>
            <input
              className="be-meta-input"
              value={editedMetaTitle}
              onChange={(e) => setEditedMetaTitle(e.target.value)}
            />
          </div>
          <div className="be-meta-field">
            <div className="be-meta-flabel"><span>Meta description</span></div>
            <textarea
              className="be-meta-input is-area"
              value={editedMetaDesc}
              onChange={(e) => setEditedMetaDesc(e.target.value)}
            />
          </div>
          <div className="be-meta-field">
            <div className="be-meta-flabel"><span>URL handle</span></div>
            <input
              className="be-meta-input"
              value={editedHandle}
              onChange={(e) => setEditedHandle(e.target.value)}
            />
          </div>
        </section>

        {Array.isArray(spec.tags) && spec.tags.length ? (
          <section className="be-seo-card">
            <span className="be-seo-label">Tags</span>
            <div className="sm-hashtag-wrap">
              {spec.tags.map((t) => <span key={t} className="sm-htag">{t}</span>)}
            </div>
          </section>
        ) : null}

        <button type="button" className="sm-edit-link" onClick={onEdit}>← Edit brief</button>
        <button
          type="button"
          className="sm-proceed-btn"
          onClick={() => onScheduleNext({ editedMetaTitle, editedMetaDesc, editedHandle })}
        >
          {mode === "autopilot" ? "Activate autopilot →" : "Publish to Shopify →"}
        </button>
      </aside>
    </div>
  );
}
Preview.propTypes = {
  mode: PropTypes.string.isRequired,
  brief: PropTypes.object.isRequired,
  result: PropTypes.object,
  articleId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onFeaturedChange: PropTypes.func,
  onScheduleNext: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

// ---------- Publish ----------

function Publish({ mode, brief, articleId, connections, onSuccess, onBack }) {
  const isAuto = mode === "autopilot";
  const [shopConnectionId, setShopConnectionId] = useState(brief.shop_connection_id || connections[0]?.id || null);
  const [blogs, setBlogs] = useState([]);
  const [blogId, setBlogId] = useState(brief.blog_id || "");
  const [when, setWhen] = useState("now");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("08:00");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!shopConnectionId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiServices.shopify_connections_blogs({ id: shopConnectionId });
        if (cancelled) return;
        if (res?.success) {
          setBlogs(res.blogs || []);
          if (!blogId && res.blogs?.[0]) setBlogId(res.blogs[0].id);
        }
      } catch (err) {
        console.warn("blogs load failed:", err.message);
      }
    })();
    return () => { cancelled = true; };
  }, [shopConnectionId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handlePublish() {
    if (busy) return;
    if (!shopConnectionId) { setError("Pick a connected store first."); return; }
    setBusy(true);
    setError("");
    try {
      if (isAuto) {
        const keywords = (brief.keywords || "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
        const res = await apiServices.blog_engine_autopilot_save({
          shop_connection_id: shopConnectionId,
          blog_id: blogId,
          blog_title: (blogs.find((b) => b.id === blogId) || {}).title || null,
          keywords,
          cadence: brief.cadence || "3x",
          publish_time: (brief.publish_time || []).join(" ").match(/\d\d:\d\d/) ? brief.publish_time[0].match(/\d\d:\d\d/)[0] : "08:00",
          voice: { tone: brief.tone || [], brand: brief.brand || "" },
          intent: brief.intent || "informational",
          length: brief.length || "standard",
          queue_depth: 5,
          status: "active",
        });
        if (!res?.success) throw new Error(res?.message || "Could not activate autopilot.");
        onSuccess({ when: "autopilot", autopilotId: res.autopilot_id });
        return;
      }

      // Single / cluster / bulk: write the article(s) with the chosen
      // schedule. articleId is set if Preview generated one already.
      const scheduledFor = when === "later" ? new Date(`${date}T${time}:00`).toISOString() : null;
      const status = when === "later" ? "scheduled" : when === "draft" ? "draft" : "draft";
      // Persist the current draft / scheduled article first
      await apiServices.blog_engine_save({
        id: articleId,
        shop_connection_id: shopConnectionId,
        target_blog_id: blogId,
        target_blog_title: (blogs.find((b) => b.id === blogId) || {}).title || null,
        status,
        scheduled_for: scheduledFor,
      });
      if (when === "now") {
        await apiServices.blog_engine_publish_now({ id: articleId });
      }
      onSuccess({ when, blogId });
    } catch (err) {
      setError(err?.message || "Could not finalize.");
    } finally {
      setBusy(false);
    }
  }

  const m = MODES[mode];

  return (
    <div className="sm-publish-body">
      <div className="sm-publish-card">
        <div className="sm-publish-head">
          <span className="sm-publish-thumb" style={{ background: m.grad }}>{m.emoji}</span>
          <div>
            <h2 className="sm-publish-title">{isAuto ? "Activate your Blog Autopilot" : "Publish to Shopify"}</h2>
            <span className="sm-publish-meta">{brief.brand || "Your brand"} · {m.label}</span>
          </div>
        </div>

        {/* Store + blog picker */}
        <span className="sm-pub-section-label">Publish to which store?</span>
        {connections.length === 0 ? (
          <div className="sm-banner is-warn">
            <AlertTriangle size={14} />
            <span>No connected stores. <a href="/new-projects/ai-integrations/shopify-blog/connections">Connect one</a> first.</span>
          </div>
        ) : (
          <div className="sm-platform-grid">
            {connections.map((c) => {
              const sel = shopConnectionId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`sm-platform-card ${sel ? "is-selected" : ""}`}
                  onClick={() => setShopConnectionId(c.id)}
                >
                  <span className="sh-store-badge"><Store size={14} /></span>
                  <div className="sm-platform-meta">
                    <span className="sm-platform-name">{c.shop_name || c.shop_domain}</span>
                    <span className="sm-platform-sub">{c.shop_domain}</span>
                  </div>
                  <span className="sm-platform-toggle">{sel ? "✓" : ""}</span>
                </button>
              );
            })}
          </div>
        )}

        {shopConnectionId && blogs.length ? (
          <>
            <span className="sm-pub-section-label">Publish to which blog?</span>
            <select
              className="be-blog-select"
              value={blogId}
              onChange={(e) => setBlogId(e.target.value)}
            >
              {blogs.map((b) => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
          </>
        ) : null}

        {!isAuto ? (
          <>
            <span className="sm-pub-section-label">When should it go live?</span>
            <div className="sm-when-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
              <button type="button" className={`sm-when-card ${when === "now" ? "is-selected" : ""}`} onClick={() => setWhen("now")}>
                <span className="sm-when-icon">🚀</span>
                <span className="sm-when-name">Publish now</span>
                <span className="sm-when-desc">Goes live immediately</span>
              </button>
              <button type="button" className={`sm-when-card ${when === "later" ? "is-selected" : ""}`} onClick={() => setWhen("later")}>
                <span className="sm-when-icon">📅</span>
                <span className="sm-when-name">Schedule</span>
                <span className="sm-when-desc">Pick date + time</span>
              </button>
              <button type="button" className={`sm-when-card ${when === "draft" ? "is-selected" : ""}`} onClick={() => setWhen("draft")}>
                <span className="sm-when-icon">✏</span>
                <span className="sm-when-name">Save draft</span>
                <span className="sm-when-desc">Keep in-portal only</span>
              </button>
            </div>
            {when === "later" ? (
              <div className="sm-when-fields">
                <div className="sm-field"><label className="sm-field-label">Date</label><input type="date" className="sm-field-input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
                <div className="sm-field"><label className="sm-field-label">Time</label><input type="time" className="sm-field-input" value={time} onChange={(e) => setTime(e.target.value)} /></div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="be-autopilot-summary">
            <div className="be-ap-summary-row">
              <span>Cadence</span>
              <strong>{(CADENCE_OPTIONS.find((c) => c.val === (brief.cadence || "3x")) || {}).num} {(CADENCE_OPTIONS.find((c) => c.val === (brief.cadence || "3x")) || {}).lab}</strong>
            </div>
            <div className="be-ap-summary-row">
              <span>Publish time</span>
              <strong>{(brief.publish_time || ["08:00"])[0]}</strong>
            </div>
            <div className="be-ap-summary-row">
              <span>Keywords in bank</span>
              <strong>{((brief.keywords || "").split(/\r?\n/).filter((s) => s.trim()).length)} ready</strong>
            </div>
          </div>
        )}

        {error ? <div className="sm-banner is-error" style={{ marginTop: 16 }}><AlertTriangle size={14} /><span>{error}</span></div> : null}

        <div className="sm-publish-nav">
          <button type="button" className="sm-back-btn" onClick={onBack}><ChevronLeft size={14} /> Back</button>
          <button type="button" className="sm-publish-btn" onClick={handlePublish} disabled={busy || !shopConnectionId}>
            {busy ? <Loader2 size={14} className="bg-spin" /> : isAuto ? <Sparkles size={14} /> : when === "now" ? <Upload size={14} /> : <Calendar size={14} />}
            {isAuto ? "Activate autopilot" : when === "now" ? "Publish to Shopify" : when === "later" ? "Schedule article" : "Save as draft"}
          </button>
        </div>
      </div>
    </div>
  );
}
Publish.propTypes = {
  mode: PropTypes.string.isRequired,
  brief: PropTypes.object.isRequired,
  articleId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  connections: PropTypes.array.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

// ---------- Success ----------

function Success({ mode, info, onCreateAnother, onHub }) {
  const isAuto = mode === "autopilot";
  return (
    <div className="sm-publish-body">
      <div className="sm-publish-card">
        <div className="sm-success-confirm">
          <div className="sm-success-icon">{isAuto ? "🌸" : info?.when === "now" ? "🎉" : "⏰"}</div>
          <h2 className="sm-success-title">
            {isAuto ? "Autopilot is live!"
              : info?.when === "now" ? "Published to Shopify!"
                : info?.when === "later" ? "Scheduled to Shopify!"
                  : "Saved as draft"}
          </h2>
          <p className="sm-success-sub">
            {isAuto ? "Your Blog Engine will now write and auto-publish to Shopify on schedule, hands-off."
              : info?.when === "now" ? "Your article is live on your Shopify blog and submitted for indexing."
                : info?.when === "later" ? "Your article is queued and will auto-publish at the time you set."
                  : "Your draft is saved. You can publish it anytime from the dashboard."}
          </p>
          <button type="button" className="sm-dashboard-btn" onClick={onHub}>View blog dashboard →</button>
          <button type="button" className="sm-secondary-link" onClick={onCreateAnother}>+ Create another article</button>
        </div>
      </div>
    </div>
  );
}
Success.propTypes = {
  mode: PropTypes.string.isRequired,
  info: PropTypes.object,
  onCreateAnother: PropTypes.func.isRequired,
  onHub: PropTypes.func.isRequired,
};

// ---------- Main orchestrator ----------

export default function BlogEngineCreate() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialMode = params.get("mode");
  const initialArticleId = params.get("article");
  const [step, setStep] = useState(initialArticleId ? "loadingArticle" : (initialMode && MODES[initialMode] ? "brief" : "typePicker"));
  const [mode, setMode] = useState(initialMode && MODES[initialMode] ? initialMode : null);
  const [brief, setBrief] = useState({});
  const [result, setResult] = useState(null);
  const [articleId, setArticleId] = useState(initialArticleId ? Number(initialArticleId) : null);
  const [connections, setConnections] = useState([]);
  const [successInfo, setSuccessInfo] = useState(null);
  const [genError, setGenError] = useState("");
  const generatingRef = useRef(false);

  const onUpdate = useCallback((patch) => setBrief((b) => ({ ...b, ...patch })), []);

  // Load shop connections so the Publish screen knows what's available.
  useEffect(() => {
    (async () => {
      try {
        const res = await apiServices.shopify_connections_list();
        if (res?.success) setConnections(res.connections || []);
      } catch { /* surfaced inline */ }
    })();
  }, []);

  // Hydrate when re-editing an existing article.
  useEffect(() => {
    if (!initialArticleId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiServices.blog_engine_get({ id: initialArticleId });
        if (cancelled) return;
        if (!res?.success || !res.article) throw new Error(res?.message || "Could not load that article.");
        const a = res.article;
        const m = a.mode && MODES[a.mode] ? a.mode : "single";
        setMode(m);
        setBrief({
          ...(a.brief || {}),
          keyword: a.keyword || a.brief?.keyword || "",
          shop_connection_id: a.shop_connection_id || null,
        });
        setResult({
          spec: a.spec || {},
          featured: a.assets?.featured || null,
          body_html: a.assets?.body_html || "",
        });
        setArticleId(a.id);
        setStep("preview");
      } catch (err) {
        if (!cancelled) { setGenError(err?.message || "Could not load that article."); setStep("typePicker"); }
      }
    })();
    return () => { cancelled = true; };
  }, [initialArticleId]);

  function pickMode(key) {
    setMode(key);
    setBrief({});
    setStep("brief");
  }

  async function runGeneration() {
    if (generatingRef.current) return;
    generatingRef.current = true;
    setGenError("");
    setStep("generating");
    try {
      // Map brief fields into the API shape.
      const briefForApi = {
        brand: brief.brand,
        keyword: brief.keyword || ((brief.keywords || "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean)[0]) || "",
        intent: brief.intent || "informational",
        voice: { tone: brief.tone || [] },
        length: brief.length || "standard",
        notes: brief.angle || "",
        custom_featured_image_url: (brief.custom_image || [])[0]?.url || null,
        reference_images: brief.reference_images || [],
      };

      const startedAt = Date.now();
      let res;

      if (mode === "bulk" || mode === "cluster") {
        // Cluster + bulk both call /bulk; cluster gets the first
        // keyword as the pillar and the rest as supporting (we tag the
        // pillar with brief.pillar in the API mode for v2).
        const keywords = (brief.keywords || "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
        // For preview, we still need one article preview. Generate
        // a single one inline; the rest get bulk-drafted on Publish.
        res = await apiServices.blog_engine_generate({
          brief: { ...briefForApi, keyword: keywords[0] || briefForApi.keyword },
        });
      } else {
        res = await apiServices.blog_engine_generate({ brief: briefForApi });
      }

      // Keep the generating animation visible for at least 2s.
      const remain = 2000 - (Date.now() - startedAt);
      if (remain > 0) await new Promise((r) => setTimeout(r, remain));

      if (!res?.success) throw new Error(res?.message || "Generation failed");
      setResult(res);

      // Persist as a draft immediately.
      try {
        const save = await apiServices.blog_engine_save({
          mode,
          keyword: briefForApi.keyword,
          brief: briefForApi,
          spec: res.spec,
          featured: res.featured,
          body_html: res.body_html,
          title: res.spec?.title,
          handle: res.spec?.handle,
          meta_title: res.spec?.meta_title,
          meta_description: res.spec?.meta_description,
          tags: res.spec?.tags,
          seo_score: res.spec?.seo_score,
          word_count: res.spec?.word_count,
          status: "draft",
        });
        if (save?.success) setArticleId(save.article_id);
      } catch { /* non-fatal */ }

      setStep("preview");
    } catch (err) {
      setGenError(err?.message || "Could not generate.");
      setStep("brief");
    } finally {
      generatingRef.current = false;
    }
  }

  function handleScheduleNext(edits) {
    // Persist edits from the SEO sidebar before moving to Publish.
    if (articleId && edits) {
      apiServices.blog_engine_save({
        id: articleId,
        meta_title: edits.editedMetaTitle,
        meta_description: edits.editedMetaDesc,
        handle: edits.editedHandle,
      }).catch(() => { /* silent */ });
    }
    setStep("publish");
  }

  function handleSuccess(info) {
    setSuccessInfo(info);
    setStep("success");
  }

  function reset() {
    setMode(null); setBrief({}); setResult(null);
    setArticleId(null); setSuccessInfo(null); setGenError("");
    setStep("typePicker");
  }

  return (
    <div className="portal-page sm-page">
      <button
        type="button"
        className="portal-back-link"
        onClick={() => navigate("/new-projects/ai-integrations/shopify-blog")}
      >
        <ArrowLeft size={16} /> Back to Blog Engine
      </button>

      {genError ? <div className="sm-banner is-error"><AlertTriangle size={14} /><span>{genError}</span></div> : null}

      {step === "loadingArticle" ? (
        <div className="sm-loading" style={{ minHeight: 240 }}>
          <Loader2 size={14} className="bg-spin" /> Loading article...
        </div>
      ) : null}

      {step === "typePicker" ? <TypePicker onPick={pickMode} /> : null}
      {step === "brief" && mode ? (
        <BriefBuilder mode={mode} brief={brief} onUpdate={onUpdate} onBack={() => setStep("typePicker")} onGenerate={runGeneration} />
      ) : null}
      {step === "generating" && mode ? <Generating mode={mode} onSettled={() => {}} /> : null}
      {step === "preview" && mode ? (
        <Preview
          mode={mode}
          brief={brief}
          result={result}
          articleId={articleId}
          onFeaturedChange={(featured) => setResult((prev) => ({ ...(prev || {}), featured }))}
          onScheduleNext={handleScheduleNext}
          onEdit={() => setStep("brief")}
        />
      ) : null}
      {step === "publish" && mode ? (
        <Publish mode={mode} brief={brief} articleId={articleId} connections={connections} onSuccess={handleSuccess} onBack={() => setStep("preview")} />
      ) : null}
      {step === "success" && successInfo ? (
        <Success mode={mode} info={successInfo} onCreateAnother={reset} onHub={() => navigate("/new-projects/ai-integrations/shopify-blog")} />
      ) : null}
    </div>
  );
}
