import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Calendar, Check, ChevronLeft, ChevronRight,
  Loader2, Sparkles, X,
} from "lucide-react";
import { apiServices } from "../../../services/apiServices";

// Social Media Studio create flow. Single component that orchestrates
// the five screens (TypePicker → Brief → Generating → Preview →
// Schedule → Success) via an internal `step` state. Brief state is
// shared across steps; the brief builder uses type-specific sub-steps
// inside the "brief" screen.

const TYPES = {
  batch:    { emoji: "⚡", label: "Full content batch", ratio: "mixed",     tag: "Recommended", desc: "Let the agent plan a week of content and schedule it across IG + FB.",        grad: "linear-gradient(135deg,#5540ff,#00ff89)", platforms: ["instagram", "facebook", "youtube"], steps: ["Planning the weekly theme", "Mapping formats to the best days", "Generating each asset on-brand", "Writing every caption and hashtag set", "Building the auto-publish schedule"] },
  carousel: { emoji: "🎠", label: "Carousel",           ratio: "4:5",       tag: "Multi-slide",  desc: "A swipeable 3 to 10 slide story. Education, listicles, value posts.",         grad: "linear-gradient(150deg,#5540ff,#1e1b48)", platforms: ["instagram", "facebook"], steps: ["Analyzing your topic and brand voice", "Structuring the slide narrative", "Writing each slide and the cover hook", "Designing on-brand slide layouts", "Drafting caption and hashtags"] },
  reel:     { emoji: "🎬", label: "Reel",               ratio: "9:16",      tag: "Short video",  desc: "A 15 to 60s vertical video with hook, scenes, captions, and audio direction.", grad: "linear-gradient(160deg,#7c3aed,#4c1d95)", platforms: ["instagram", "facebook", "youtube"], steps: ["Researching trending hooks in your niche", "Writing a scroll-stopping hook", "Building the scene-by-scene script", "Suggesting audio and on-screen captions", "Drafting caption and hashtags"] },
  post:     { emoji: "🖼", label: "Single Post",        ratio: "1:1 / 4:5", tag: "Single image", desc: "One scroll-stopping graphic with a sharp headline and conversion caption.",   grad: "linear-gradient(150deg,#0057ff,#0d9488)", platforms: ["instagram", "facebook"], steps: ["Analyzing your topic and brand voice", "Crafting the headline and key message", "Designing the on-brand graphic", "Drafting caption and hashtags"] },
  thumbnail: { emoji: "▶", label: "Thumbnail",          ratio: "16:9",      tag: "Cover image",  desc: "A high-CTR cover for YouTube, Reels covers, or blog headers.",                 grad: "linear-gradient(150deg,#dc2626,#7f1d1d)", platforms: ["youtube", "facebook"], steps: ["Analyzing the title and angle", "Testing high-CTR layout patterns", "Designing the bold cover graphic", "Finalizing text and focal point"] },
  profile:  { emoji: "👤", label: "Profile Image",      ratio: "1:1",       tag: "Avatar / mark", desc: "A clean profile picture or brand mark that reads clearly at small sizes.",   grad: "linear-gradient(150deg,#16a34a,#15803d)", platforms: ["instagram", "facebook"], steps: ["Pulling your brand colors and mark", "Generating avatar concepts", "Optimizing legibility at small sizes", "Exporting all required sizes"] },
};

const PLATFORM_INFO = {
  instagram: { name: "Instagram", badge: "📷", meta: "Feed + Reels",   cls: "is-ig" },
  facebook:  { name: "Facebook",  badge: "f",  meta: "Page + Reels",   cls: "is-fb" },
  youtube:   { name: "YouTube",   badge: "▶",  meta: "Shorts + Cover", cls: "is-yt" },
};

const GOAL_OPTIONS = [
  { val: "awareness",  emoji: "📣", title: "Awareness",            desc: "Reach new people, get saves and shares" },
  { val: "engagement", emoji: "💬", title: "Engagement",           desc: "Spark comments and DMs" },
  { val: "sales",      emoji: "🛒", title: "Sales / conversions",  desc: "Drive clicks to product or offer" },
  { val: "authority",  emoji: "📚", title: "Authority / educate",  desc: "Build trust and expertise" },
];

const TONE_OPTIONS = [
  "🔥 Bold and punchy", "☕ Warm and friendly", "📚 Educational",
  "✨ Aspirational",    "😄 Playful",            "💎 Premium",
];

const TYPE_ORDER = ["batch", "carousel", "reel", "post", "thumbnail", "profile"];

// ---------- Brief subcomponents ----------

function TypePicker({ onPick }) {
  return (
    <div className="sm-create-content">
      <div className="sm-create-eyebrow">Content Generation</div>
      <h1 className="sm-create-headline">What should we create today?</h1>
      <p className="sm-create-sub">Pick a format. Our Social Media AI will draft it on-brand, you refine it, then we auto-publish.</p>
      <div className="sm-type-grid">
        {TYPE_ORDER.map((key) => {
          const t = TYPES[key];
          const featured = key === "batch";
          return (
            <button
              key={key}
              type="button"
              className={`sm-type-card ${featured ? "is-featured" : ""}`}
              onClick={() => onPick(key)}
            >
              <span className="sm-type-icon" style={{ background: t.grad, color: "#fff" }}>{t.emoji}</span>
              <span className="sm-type-tag">{t.tag}</span>
              <h3 className="sm-type-title">{t.label}</h3>
              <p className="sm-type-desc">{t.desc}</p>
              <div className="sm-type-meta">
                <div className="sm-type-dots">
                  {t.platforms.map((p) => (
                    <span key={p} className={`sm-plat-badge ${PLATFORM_INFO[p].cls}`}>{PLATFORM_INFO[p].badge}</span>
                  ))}
                </div>
                <span className="sm-type-ratio">{t.ratio}</span>
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

function BriefBuilder({ type, brief, onUpdate, onBack, onGenerate }) {
  const t = TYPES[type];
  const steps = useMemo(() => buildBriefSteps(type), [type]);
  const [bStep, setBStep] = useState(0);
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
    <div className="sm-create-content">
      <div className="sm-progress-wrap">
        <div className="sm-progress-top">
          <span className="sm-progress-step">Step {bStep + 1} of {total} · <strong>{step.name}</strong></span>
          <span className="sm-progress-count">{pct}% complete</span>
        </div>
        <div className="sm-progress-track">
          <div className="sm-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <section className="sm-brief-card">
        <div className="sm-brief-typebadge">{t.emoji} {t.label}</div>
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

        {step.slider ? (
          <div className="sm-field">
            <div className="sm-slider-row">
              <span className="sm-slider-val">{brief[step.slider.id] ?? step.slider.default}</span>
              <input
                type="range"
                min={step.slider.min}
                max={step.slider.max}
                value={brief[step.slider.id] ?? step.slider.default}
                onChange={(e) => onUpdate({ [step.slider.id]: Number(e.target.value) })}
              />
              <span className="sm-slider-unit">{step.slider.unit}</span>
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
                      const next = cur.includes(opt)
                        ? cur.filter((v) => v !== opt)
                        : (cur.length >= cap ? cur : [...cur, opt]);
                      onUpdate({ [step.chips.id]: next });
                    }}
                  >{opt}</button>
                );
              })}
            </div>
          </div>
        ) : null}

        {step.platformPicker ? (
          <div className="sm-field">
            <div className="sm-platform-grid">
              {Object.keys(PLATFORM_INFO).map((p) => {
                const info = PLATFORM_INFO[p];
                const sel = (brief.platforms || []).includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    className={`sm-platform-card ${sel ? "is-selected" : ""}`}
                    onClick={() => {
                      const cur = brief.platforms || [];
                      onUpdate({ platforms: cur.includes(p) ? cur.filter((v) => v !== p) : [...cur, p] });
                    }}
                  >
                    <span className={`sm-plat-badge is-large ${info.cls}`}>{info.badge}</span>
                    <div className="sm-platform-meta">
                      <span className="sm-platform-name">{info.name}</span>
                      <span className="sm-platform-sub">{info.meta}</span>
                    </div>
                    <span className="sm-platform-toggle">{sel ? "✓" : ""}</span>
                  </button>
                );
              })}
            </div>
          </div>
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
            {bStep === total - 1 ? <><Sparkles size={14} /> Generate content</> : <>Continue <ArrowRight size={14} /></>}
          </button>
        </footer>
      </section>
    </div>
  );
}
BriefBuilder.propTypes = {
  type: PropTypes.string.isRequired,
  brief: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onGenerate: PropTypes.func.isRequired,
};

function buildBriefSteps(type) {
  const t = TYPES[type];
  const common = [
    {
      name: "Topic", icon: "💡",
      q: type === "batch" ? "What's this week's theme?" : `What's this ${t.label.toLowerCase()} about?`,
      sub: "Give the agent a topic, angle, or rough idea, a sentence is plenty.",
      fields: [
        { id: "brand", type: "text", label: "Brand", placeholder: "e.g. HAiRADE", required: true },
        { id: "topic", type: "textarea", label: "Topic / idea", placeholder: type === "batch"
            ? "e.g. Educate new customers on why biotin and caffeine actually work for hair growth"
            : "e.g. 5 myths about hair growth supplements, debunked", required: true },
      ],
    },
    {
      name: "Goal & Tone", icon: "🎯",
      q: "What's the goal and vibe?",
      sub: "This shapes the hook, the copy, and the call-to-action.",
      options: { id: "goal", label: "Primary goal", cols: 2, items: GOAL_OPTIONS },
      chips:   { id: "tone", label: "Tone of voice (pick up to 2)", max: 2, options: TONE_OPTIONS },
    },
  ];
  const typeSpecific = {
    carousel: [{
      name: "Slides", icon: "🎠", q: "How many slides?",
      sub: "3 to 5 is snappy, 7 to 10 goes deep. The cover always counts as slide 1.",
      slider: { id: "slides", min: 3, max: 10, default: 6, unit: "slides" },
      chips:  { id: "structure", label: "Slide structure", max: 1, options: ["📚 Listicle", "❌ Myth vs fact", "🔄 Before / after", "🪜 Step-by-step", "❓ Question + answer"] },
    }],
    reel: [{
      name: "Format", icon: "🎬", q: "How should the reel feel?",
      sub: "Sets the pacing, hook style, and editing direction.",
      slider: { id: "duration", min: 15, max: 60, default: 30, unit: "sec" },
      chips:  { id: "reelStyle", label: "Reel style", max: 1, options: ["🗣 Talking head", "📝 Text-on-screen", "🎞 B-roll + voiceover", "🤳 UGC / selfie", "🎵 Trend / audio-led"] },
    }],
    post: [{
      name: "Format", icon: "🖼", q: "Pick the post format",
      sub: "Portrait (4:5) takes more feed space, square (1:1) is the classic.",
      options: { id: "postFormat", label: "", cols: 2, items: [
        { val: "portrait", emoji: "📱", title: "Portrait · 4:5", desc: "More screen space in-feed" },
        { val: "square",   emoji: "⬛", title: "Square · 1:1",   desc: "Universal, clean grid" },
      ]},
      chips: { id: "postStyle", label: "Visual style", max: 1, options: ["📰 Bold headline", "💬 Quote card", "📊 Stat / data", "🎁 Promo / offer"] },
    }],
    thumbnail: [{
      name: "Title", icon: "▶", q: "What's the title or hook?",
      sub: "Short and punchy wins. We'll make it huge and legible.",
      fields: [{ id: "thumbTitle", type: "text", label: "Thumbnail text", placeholder: "e.g. I TESTED IT FOR 30 DAYS", required: true }],
      chips:  { id: "thumbStyle", label: "Style", max: 1, options: ["😲 Reaction / face", "🆚 This vs that", "🔢 Big number", "⚠ Bold warning"] },
    }],
    profile: [{
      name: "Style", icon: "👤", q: "What kind of profile image?",
      sub: "We'll keep it crisp at 32px and up.",
      options: { id: "profileStyle", label: "", cols: 2, items: [
        { val: "monogram", emoji: "🔤", title: "Monogram",         desc: "Initials in your brand style" },
        { val: "mark",     emoji: "✦",  title: "Brand mark / icon", desc: "A simple symbolic logo" },
        { val: "avatar",   emoji: "🧑", title: "Founder avatar",    desc: "Stylized portrait" },
        { val: "wordmark", emoji: "🕰", title: "Compact wordmark",  desc: "Short brand name lockup" },
      ]},
    }],
    batch: [{
      name: "Volume", icon: "⚡", q: "How many posts this week?",
      sub: "We'll mix carousels, reels, and single posts across the week.",
      slider: { id: "volume", min: 3, max: 14, default: 7, unit: "posts" },
      chips:  { id: "mix", label: "Lean toward", max: 1, options: ["⚖ Balanced mix", "🎠 More carousels", "🎬 More reels", "🖼 More single posts"] },
    }],
  };
  const platform = {
    name: "Publishing", icon: "🌐", q: "Where should this go live?",
    sub: "We'll format each asset correctly for every platform you pick.",
    platformPicker: true,
  };
  return [...common, ...(typeSpecific[type] || []), platform];
}

// ---------- Generating ----------

function Generating({ type, onSettled }) {
  const t = TYPES[type];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (idx >= t.steps.length) { const tt = setTimeout(onSettled, 600); return () => clearTimeout(tt); }
    const tt = setTimeout(() => setIdx((i) => i + 1), 1100 + Math.random() * 600);
    return () => clearTimeout(tt);
  }, [idx, t.steps.length, onSettled]);
  return (
    <div className="sm-gen-content">
      <div className="sm-gen-orb">✦</div>
      <h2 className="sm-gen-title">Creating your {t.label.toLowerCase()}...</h2>
      <p className="sm-gen-sub">The Social Media Agent is drafting your on-brand assets</p>
      <div className="sm-gen-steps">
        {t.steps.map((s, i) => (
          <div key={i} className={`sm-gen-step ${i < idx ? "is-done" : i === idx ? "is-active" : ""}`}>
            <span className="sm-gen-step-icon">{i < idx ? "✓" : i === idx ? <Loader2 size={12} className="bg-spin" /> : i + 1}</span>
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
Generating.propTypes = { type: PropTypes.string.isRequired, onSettled: PropTypes.func.isRequired };

// ---------- Preview ----------

function Preview({ type, brief, result, onScheduleNext, onEdit }) {
  const t = TYPES[type];
  const spec = result?.spec || {};
  const cover = result?.cover?.url || null;
  const [slide, setSlide] = useState(0);

  // Reset the carousel slide when result changes
  useEffect(() => { setSlide(0); }, [result]);

  const slides = Array.isArray(spec.slides) ? spec.slides : [];

  return (
    <div className="sm-preview-layout">
      <div className="sm-preview-stage">
        <span className="sm-stage-label">Preview · {t.label} · {t.ratio}</span>

        {type === "carousel" ? (
          <>
            <div className="sm-frame-carousel" style={{ background: spec.palette || t.grad }}>
              {cover && slide === 0 ? (
                <img className="sm-frame-bg" src={cover} alt={spec.headline || "Cover"} />
              ) : null}
              <div className="sm-cs-tag">{slides[slide]?.tag || spec.tag || "Swipe →"}</div>
              <div className="sm-cs-headline">{(slides[slide]?.headline || spec.headline || "Headline").split("\n").map((line, i) => <span key={i}>{line}<br/></span>)}</div>
              {slides[slide]?.body ? <div className="sm-cs-body">{slides[slide].body}</div> : null}
              <div className="sm-cs-foot"><span>{brief.brand || "@brand"}</span><span>{slide + 1}/{slides.length || 1}</span></div>
            </div>
            {slides.length > 1 ? (
              <>
                <div className="sm-carousel-dots">
                  {slides.map((_, i) => (
                    <button key={i} type="button" className={`sm-cdot ${i === slide ? "is-active" : ""}`} onClick={() => setSlide(i)} aria-label={`Go to slide ${i + 1}`} />
                  ))}
                </div>
                <div className="sm-carousel-nav">
                  <button type="button" className="sm-cnav" onClick={() => setSlide((s) => (s - 1 + slides.length) % slides.length)}><ChevronLeft size={16} /></button>
                  <button type="button" className="sm-cnav" onClick={() => setSlide((s) => (s + 1) % slides.length)}><ChevronRight size={16} /></button>
                </div>
              </>
            ) : null}
          </>
        ) : null}

        {type === "reel" ? (
          <div className="sm-frame-reel" style={{ background: t.grad }}>
            {cover ? <img className="sm-frame-bg" src={cover} alt={spec.hook || "Hook"} /> : null}
            <div className="sm-reel-top"><span>● REC</span><span>0:{String(brief.duration || 30).padStart(2, "0")}</span></div>
            <div className="sm-reel-hook">{spec.hook || "Hook"}</div>
            <div className="sm-reel-bottom">
              <div className="sm-reel-handle">@{(brief.brand || "brand").toLowerCase().replace(/\s+/g, "")}</div>
              <div className="sm-reel-caption">{(spec.caption || "").split("\n")[0]}</div>
            </div>
          </div>
        ) : null}

        {type === "post" ? (
          <div className={`sm-frame-post ${brief.postFormat === "portrait" ? "is-portrait" : ""}`} style={{ background: spec.palette || t.grad }}>
            {cover ? <img className="sm-frame-bg" src={cover} alt={spec.headline || "Headline"} /> : null}
            <div className="sm-fp-tag">{spec.tag || "New"}</div>
            <div className="sm-fp-headline">{(spec.headline || "Headline").split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}</div>
            {spec.sub ? <div className="sm-fp-sub">{spec.sub}</div> : null}
          </div>
        ) : null}

        {type === "thumbnail" ? (
          <div className="sm-frame-thumb" style={{ background: t.grad }}>
            {cover ? <img className="sm-frame-bg" src={cover} alt={spec.title || "Title"} /> : null}
            <div className="sm-ft-kicker">{spec.kicker || (brief.thumbTitle || "").toUpperCase()}</div>
            <div className="sm-ft-title">{(spec.title || brief.thumbTitle || "TITLE").toUpperCase()}</div>
          </div>
        ) : null}

        {type === "profile" ? (
          <div className="sm-frame-profile" style={{ background: t.grad }}>
            {cover ? <img className="sm-frame-bg is-round" src={cover} alt="Profile" /> : null}
            <div className="sm-fpr-mark">{spec.mark || (brief.brand || "B").charAt(0).toUpperCase()}</div>
          </div>
        ) : null}

        {type === "batch" ? (
          <div className="sm-batch-grid">
            {(spec.posts || []).map((p, i) => (
              <div key={i} className="sm-batch-cell" style={{ background: TYPES[p.content_type]?.grad || t.grad }}>
                <span className="sm-batch-day">{p.day}</span>
                <span className="sm-batch-type">{TYPES[p.content_type]?.emoji || "•"} {p.content_type}</span>
                <span className="sm-batch-brief">{p.brief}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="sm-refine-panel">
        {type !== "profile" && type !== "thumbnail" && type !== "batch" ? (
          <section className="sm-refine-card">
            <span className="sm-refine-label">📝 Caption</span>
            <div className="sm-caption-box">{spec.caption || "Your AI-written caption appears here, tuned to your goal and tone, ready to edit before publishing."}</div>
          </section>
        ) : null}

        {Array.isArray(spec.hashtags) && spec.hashtags.length ? (
          <section className="sm-refine-card">
            <span className="sm-refine-label"># Hashtags</span>
            <div className="sm-hashtag-wrap">
              {spec.hashtags.map((h) => <span key={h} className="sm-htag">{h}</span>)}
            </div>
          </section>
        ) : null}

        {type === "reel" && Array.isArray(spec.scenes) && spec.scenes.length ? (
          <section className="sm-refine-card">
            <span className="sm-refine-label">🎬 Scene script</span>
            <div className="sm-scene-list">
              {spec.scenes.map((s, i) => (
                <div key={i} className="sm-scene-row">
                  <strong>{s.range}</strong> · {s.on_screen} <em>{s.voiceover ? `("${s.voiceover}")` : ""}</em>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="sm-refine-card">
          <span className="sm-refine-label">📡 Publishing to</span>
          <div className="sm-preview-platforms">
            {(brief.platforms || []).map((p) => (
              <span key={p} className="sm-pp-pill">
                <span className={`sm-plat-badge ${PLATFORM_INFO[p].cls}`}>{PLATFORM_INFO[p].badge}</span>
                {PLATFORM_INFO[p].name}
              </span>
            ))}
          </div>
        </section>

        <button type="button" className="sm-edit-link" onClick={onEdit}>← Edit brief</button>
        <button type="button" className="sm-proceed-btn" onClick={onScheduleNext}>Looks good, schedule it →</button>
      </div>
    </div>
  );
}
Preview.propTypes = {
  type: PropTypes.string.isRequired,
  brief: PropTypes.object.isRequired,
  result: PropTypes.object,
  onScheduleNext: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

// ---------- Schedule ----------

function Schedule({ type, brief, postId, onSuccess, onBack }) {
  const t = TYPES[type];
  const [when, setWhen] = useState("now");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("18:00");
  const [platforms, setPlatforms] = useState(brief.platforms || []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function togglePlatform(p) {
    setPlatforms((cur) => cur.includes(p) ? cur.filter((v) => v !== p) : [...cur, p]);
  }

  async function handlePublish() {
    if (busy) return;
    if (!platforms.length) { setError("Pick at least one platform."); return; }
    setBusy(true);
    setError("");
    try {
      const scheduledFor = when === "later" ? new Date(`${date}T${time}:00`).toISOString() : null;
      const status = when === "later" ? "scheduled" : "draft";
      await apiServices.social_media_save({
        post_id: postId,
        platforms,
        status,
        scheduled_for: scheduledFor,
      });
      if (when === "now") {
        await apiServices.social_media_publish_now({ id: postId });
      }
      onSuccess({ platforms, when, scheduledFor });
    } catch (err) {
      setError(err?.message || "Could not finalize.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sm-publish-body">
      <div className="sm-publish-card">
        <div className="sm-publish-head">
          <span className="sm-publish-thumb" style={{ background: t.grad }}>{t.emoji}</span>
          <div>
            <h2 className="sm-publish-title">{t.label} ready to publish</h2>
            <span className="sm-publish-meta">{brief.brand || "Your brand"} · {t.ratio} · {platforms.length} platform{platforms.length === 1 ? "" : "s"}</span>
          </div>
        </div>

        <span className="sm-pub-section-label">When should it go live?</span>
        <div className="sm-when-grid">
          <button type="button" className={`sm-when-card ${when === "now" ? "is-selected" : ""}`} onClick={() => setWhen("now")}>
            <span className="sm-when-icon">🚀</span>
            <span className="sm-when-name">Publish now</span>
            <span className="sm-when-desc">Goes live immediately</span>
          </button>
          <button type="button" className={`sm-when-card ${when === "later" ? "is-selected" : ""}`} onClick={() => setWhen("later")}>
            <span className="sm-when-icon">📅</span>
            <span className="sm-when-name">Schedule</span>
            <span className="sm-when-desc">Pick date and time</span>
          </button>
        </div>

        {when === "later" ? (
          <div className="sm-when-fields">
            <div className="sm-field">
              <label className="sm-field-label">Date</label>
              <input type="date" className="sm-field-input" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="sm-field">
              <label className="sm-field-label">Time</label>
              <input type="time" className="sm-field-input" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
        ) : null}

        <span className="sm-pub-section-label">Publishing to</span>
        <div className="sm-pub-platforms">
          {Object.keys(PLATFORM_INFO).map((p) => {
            const info = PLATFORM_INFO[p];
            const sel = platforms.includes(p);
            return (
              <button key={p} type="button" className={`sm-platform-card ${sel ? "is-selected" : ""}`} onClick={() => togglePlatform(p)}>
                <span className={`sm-plat-badge is-large ${info.cls}`}>{info.badge}</span>
                <div className="sm-platform-meta">
                  <span className="sm-platform-name">{info.name}</span>
                  <span className="sm-platform-sub">{info.meta}</span>
                </div>
                <span className="sm-platform-toggle">{sel ? "✓" : ""}</span>
              </button>
            );
          })}
        </div>

        {error ? <div className="sm-banner is-error" style={{ marginTop: 16 }}>{error}</div> : null}

        <div className="sm-publish-nav">
          <button type="button" className="sm-back-btn" onClick={onBack}><ChevronLeft size={14} /> Back</button>
          <button type="button" className="sm-publish-btn" onClick={handlePublish} disabled={busy}>
            {busy ? <Loader2 size={14} className="bg-spin" /> : when === "now" ? <Sparkles size={14} /> : <Calendar size={14} />}
            {when === "now" ? "Publish now" : "Schedule post"}
          </button>
        </div>
      </div>
    </div>
  );
}
Schedule.propTypes = {
  type: PropTypes.string.isRequired,
  brief: PropTypes.object.isRequired,
  postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSuccess: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

function Success({ when, platforms, onCreateAnother, onHub }) {
  return (
    <div className="sm-publish-body">
      <div className="sm-publish-card">
        <div className="sm-success-confirm">
          <div className="sm-success-icon">{when === "now" ? "🎉" : "⏰"}</div>
          <h2 className="sm-success-title">{when === "now" ? "Published successfully!" : "Scheduled successfully!"}</h2>
          <p className="sm-success-sub">
            {when === "now"
              ? "Your post is going live across your connected accounts right now."
              : "Your post is queued and will auto-publish at the time you set."}
          </p>
          <div className="sm-success-rows">
            {platforms.map((p) => {
              const info = PLATFORM_INFO[p];
              return (
                <div key={p} className="sm-success-row">
                  <span className={`sm-plat-badge ${info.cls}`}>{info.badge}</span>
                  <span className="sm-success-row-name">{info.name}</span>
                  <span className="sm-success-status">✓ {when === "now" ? "Published" : "Scheduled"}</span>
                </div>
              );
            })}
          </div>
          <button type="button" className="sm-dashboard-btn" onClick={onHub}>View content dashboard →</button>
          <button type="button" className="sm-secondary-link" onClick={onCreateAnother}>+ Create another post</button>
        </div>
      </div>
    </div>
  );
}
Success.propTypes = {
  when: PropTypes.string.isRequired,
  platforms: PropTypes.arrayOf(PropTypes.string).isRequired,
  onCreateAnother: PropTypes.func.isRequired,
  onHub: PropTypes.func.isRequired,
};

// ---------- Main orchestrator ----------

export default function SocialMediaCreate() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialType = params.get("type");
  const [step, setStep] = useState(initialType && TYPES[initialType] ? "brief" : "typePicker");
  const [type, setType] = useState(initialType && TYPES[initialType] ? initialType : null);
  const [brief, setBrief] = useState(() => ({ platforms: initialType && TYPES[initialType] ? TYPES[initialType].platforms : [] }));
  const [result, setResult] = useState(null);
  const [postId, setPostId] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);
  const [genError, setGenError] = useState("");
  const generatingRef = useRef(false);

  const onUpdate = useCallback((patch) => setBrief((b) => ({ ...b, ...patch })), []);

  function pickType(key) {
    setType(key);
    setBrief({ platforms: [...TYPES[key].platforms] });
    setStep("brief");
  }

  async function runGeneration() {
    if (generatingRef.current) return;
    generatingRef.current = true;
    setGenError("");
    setStep("generating");
    try {
      const [genRes] = await Promise.all([
        apiServices.social_media_generate({
          brief: { content_type: type, ...brief },
        }),
        new Promise((r) => setTimeout(r, 2000)),  // minimum 2s of animated steps
      ]);
      if (!genRes?.success) throw new Error(genRes?.message || "Generation failed");
      setResult(genRes);
      // Persist as a draft right away so the user can come back to it.
      try {
        const save = await apiServices.social_media_save({
          content_type: type,
          brief: { content_type: type, ...brief },
          spec: genRes.spec,
          cover: genRes.cover,
          caption: genRes.spec?.caption || "",
          hashtags: genRes.spec?.hashtags || [],
          platforms: brief.platforms || [],
          status: "draft",
        });
        if (save?.success) setPostId(save.post_id);
      } catch { /* non-fatal */ }
      setStep("preview");
    } catch (err) {
      setGenError(err?.message || "Could not generate.");
      setStep("brief");
    } finally {
      generatingRef.current = false;
    }
  }

  function handleSuccess({ platforms, when }) {
    setSuccessInfo({ platforms, when });
    setStep("success");
  }

  function reset() {
    setType(null);
    setBrief({ platforms: [] });
    setResult(null);
    setPostId(null);
    setSuccessInfo(null);
    setStep("typePicker");
  }

  return (
    <div className="portal-page sm-page sm-create">
      <button
        type="button"
        className="portal-back-link"
        onClick={() => navigate("/new-projects/social")}
      >
        <ArrowLeft size={16} /> Back to Social Media Studio
      </button>

      {genError ? <div className="sm-banner is-error">{genError}</div> : null}

      {step === "typePicker" ? <TypePicker onPick={pickType} /> : null}

      {step === "brief" && type ? (
        <BriefBuilder
          type={type}
          brief={brief}
          onUpdate={onUpdate}
          onBack={() => setStep("typePicker")}
          onGenerate={runGeneration}
        />
      ) : null}

      {step === "generating" && type ? <Generating type={type} onSettled={() => {}} /> : null}

      {step === "preview" && type ? (
        <Preview
          type={type}
          brief={brief}
          result={result}
          onScheduleNext={() => setStep("schedule")}
          onEdit={() => setStep("brief")}
        />
      ) : null}

      {step === "schedule" && type ? (
        <Schedule
          type={type}
          brief={brief}
          postId={postId}
          onSuccess={handleSuccess}
          onBack={() => setStep("preview")}
        />
      ) : null}

      {step === "success" && successInfo ? (
        <Success
          when={successInfo.when}
          platforms={successInfo.platforms}
          onCreateAnother={reset}
          onHub={() => navigate("/new-projects/social")}
        />
      ) : null}
    </div>
  );
}
