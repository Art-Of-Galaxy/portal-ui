import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, ChevronLeft } from "lucide-react";
import AIStrategist from "../../components/strategist/AIStrategist";
import BrandGuidelinesView from "./BrandGuidelinesView";
import { apiServices } from "../../services/apiServices";
import { useLoading } from "../../context/LoadingContext";

// Conversational path for the Brand Guidelines service. The chat collects
// the 6 stage brief, and once the brief is "ready" we call the
// brand-guidelines generator (Claude + fal.ai) and swap the chat for the
// result view.

const BG_CHECKLIST = [
  { id: "brand",        label: "Your brand" },
  { id: "audience",     label: "Your audience" },
  { id: "personality",  label: "Brand personality" },
  { id: "visual",       label: "Visual direction" },
  { id: "references",   label: "References" },
  { id: "deliverables", label: "Deliverables" },
];

const BG_LOADER_MESSAGES = [
  "Reading your brand brief...",
  "Distilling positioning and audience...",
  "Drafting voice and tone...",
  "Pairing typefaces...",
  "Building your color system...",
  "Sketching logo concepts...",
  "Composing social mockups...",
  "Rendering the brand book...",
  "Polishing the deliverables...",
  "Almost there...",
];

function buildPayload(brief) {
  return {
    brand_name: brief.brand_name || "",
    product_description: brief.product_description || "",
    audience_age: brief.audience_age || "",
    lifestyle: Array.isArray(brief.lifestyle) ? brief.lifestyle : [],
    personality: brief.personality || "",
    voice_tone: brief.voice_tone || "",
    color_mood: Array.isArray(brief.color_mood) ? brief.color_mood : [],
    typography_feel: brief.typography_feel || "",
    admired_brand: brief.admired_brand || "",
    main_competitor: brief.main_competitor || "",
    differentiation: brief.differentiation || "",
    extras: Array.isArray(brief.extras) ? brief.extras : [],
    additional_notes: brief.additional_notes || "",
    brand_assets: Array.isArray(brief.brand_assets) ? brief.brand_assets : [],
  };
}

export default function BrandGuidelinesStrategist() {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [briefForResult, setBriefForResult] = useState(null);
  const [error, setError] = useState("");
  // Brand assets live OUTSIDE the LLM's brief — the conversation doesn't
  // need to manage uploads, but at generate time we merge them in so the
  // backend can feed them to fal.ai as reference images.
  const [brandAssets, setBrandAssets] = useState([]);
  const { withLoading } = useLoading();

  async function handleReadyToGenerate(brief, session) {
    if (!brief?.brand_name || !brief?.product_description) {
      setError("I still need at least a brand name and a one-line description.");
      return;
    }
    setError("");
    setGenerating(true);
    try {
      const mergedBrief = { ...brief, brand_assets: brandAssets };
      const res = await withLoading(
        () => apiServices.generate_brand_guidelines({ form: buildPayload(mergedBrief) }),
        BG_LOADER_MESSAGES,
        { label: "AI is building", intervalMs: 2400 }
      );
      if (!res?.success) throw new Error(res?.message || "Generation failed");
      setResult(res);
      setBriefForResult(brief);
      if (session?.id) {
        try {
          await apiServices.strategist_complete({
            session_id: session.id,
            project_id: res.project_id,
          });
        } catch { /* non-fatal */ }
        try { localStorage.removeItem("aog.strategist.session.brand_guidelines"); } catch { /* ignore */ }
      }
    } catch (err) {
      setError(err?.message || "Could not generate. Try again?");
    } finally {
      setGenerating(false);
    }
  }

  if (result && briefForResult) {
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
        <BrandGuidelinesView
          guidelines={result.guidelines}
          deliverables={result.deliverables}
          brandName={briefForResult.brand_name}
          description={briefForResult.product_description}
          tagline={result?.guidelines?.positioning_statement}
          statusLabel="Done"
          projectId={result.project_id}
          errors={result.errors}
        />
      </div>
    );
  }

  const header = (
    <div className="strategist-header-row">
      <div className="strategist-header-titlewrap">
        <h2 className="strategist-header-title">Brand Development Brief</h2>
        <span className="strategist-header-sub">Your answers build the brief automatically</span>
      </div>
      <span className="strategist-header-tag">
        <Sparkles size={12} /> AI-guided
      </span>
      <button
        type="button"
        className="strategist-header-change"
        onClick={() => navigate("/new-projects/branding-design/brand-guidelines")}
      >
        <ChevronLeft size={13} /> Change Method
      </button>
    </div>
  );

  return (
    <div className="portal-page strategist-page">
      <button
        type="button"
        className="portal-back-link"
        onClick={() => navigate("/new-projects/branding-design/brand-guidelines")}
      >
        <ArrowLeft size={16} />
        Back to Branding &amp; Design / Brand Guidelines <span className="method-picker-crumb">/ AI Strategist</span>
      </button>

      {error ? <div className="strategist-page-error">{error}</div> : null}

      <AIStrategist
        service="brand_guidelines"
        checklistSteps={BG_CHECKLIST}
        header={header}
        onReadyToGenerate={handleReadyToGenerate}
        generateLabel={generating ? "Building..." : "I'm ready, build my guidelines"}
        generating={generating}
        requiredFields={["brand_name", "product_description"]}
        enableAttachments
        onAttachmentsChange={setBrandAssets}
        attachmentProjectName="Brand Guidelines Request"
        attachmentServiceType="brand_guidelines"
      />
    </div>
  );
}
