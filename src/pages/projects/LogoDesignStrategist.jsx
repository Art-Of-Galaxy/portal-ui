import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, ChevronLeft } from "lucide-react";
import AIStrategist from "../../components/strategist/AIStrategist";
import LogoDesignView from "./LogoDesignView";
import { apiServices } from "../../services/apiServices";
import { useLoading } from "../../context/LoadingContext";

const LOGO_CHECKLIST = [
  { id: "brand_name", label: "Brand name" },
  { id: "business", label: "Your business" },
  { id: "logo_style", label: "Logo style" },
  { id: "colors_type", label: "Colors & type" },
  { id: "references", label: "References" },
];

const LOGO_LOADER_MESSAGES = [
  "Reading your brand brief...",
  "Picking the right visual direction...",
  "Composing the prompt...",
  "Sending it to the image model...",
  "Sketching the first concepts...",
  "Refining color and balance...",
  "Polishing the final renders...",
  "Almost there...",
];

export default function LogoDesignStrategist() {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [briefForResult, setBriefForResult] = useState(null);
  const [error, setError] = useState("");
  const { withLoading } = useLoading();

  async function handleReadyToGenerate(brief, session) {
    if (!brief?.brand_name) {
      setError("I still need at least a brand name to generate.");
      return;
    }
    setError("");
    setGenerating(true);
    try {
      const res = await withLoading(
        () => apiServices.generate_logo_design({
          form: {
            brand_name: brief.brand_name || "",
            tagline: brief.tagline || "",
            business_description: brief.business_description || "",
            logo_style: brief.logo_style || "",
            selected_colors: Array.isArray(brief.selected_colors) ? brief.selected_colors : [],
            custom_colors: Array.isArray(brief.custom_colors) ? brief.custom_colors : [],
            selected_typography: Array.isArray(brief.selected_typography) ? brief.selected_typography : [],
            reference_links: Array.isArray(brief.reference_links) ? brief.reference_links : [],
            reference_uploads: Array.isArray(brief.reference_uploads) ? brief.reference_uploads : [],
            competitor_links: Array.isArray(brief.competitor_links) ? brief.competitor_links : [],
            competitor_names: brief.competitor_names || "",
            additional_notes: brief.additional_notes || "",
          },
          num_images: 4,
        }),
        LOGO_LOADER_MESSAGES,
        { label: "AI is designing", intervalMs: 2400 }
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
        // Clear the persisted session so a fresh "Start over" doesn't try
        // to resume an already-completed conversation.
        try { localStorage.removeItem(`aog.strategist.session.logo_design`); } catch { /* ignore */ }
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
        <LogoDesignView
          images={result.images}
          prompt={result.prompt}
          brandName={briefForResult.brand_name}
          model={result.model}
          seed={result.seed}
          errors={result.errors}
          requested={4}
          tagline={briefForResult.tagline}
          businessDescription={briefForResult.business_description}
          logoStyle={briefForResult.logo_style}
          selectedColors={briefForResult.selected_colors}
          customColors={briefForResult.custom_colors}
          typography={briefForResult.selected_typography}
          statusLabel="Done"
        />
      </div>
    );
  }

  const header = (
    <div className="strategist-header-row">
      <div className="strategist-header-titlewrap">
        <h2 className="strategist-header-title">Logo Design Brief</h2>
        <span className="strategist-header-sub">Your answers build the brief automatically</span>
      </div>
      <span className="strategist-header-tag">
        <Sparkles size={12} /> AI-guided
      </span>
      <button
        type="button"
        className="strategist-header-change"
        onClick={() => navigate("/new-projects/branding-design/logo")}
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
        onClick={() => navigate("/new-projects/branding-design/logo")}
      >
        <ArrowLeft size={16} />
        Back to Branding &amp; Design / Logo Design <span className="method-picker-crumb">/ AI Strategist</span>
      </button>

      {error ? <div className="strategist-page-error">{error}</div> : null}

      <AIStrategist
        service="logo_design"
        checklistSteps={LOGO_CHECKLIST}
        header={header}
        onReadyToGenerate={handleReadyToGenerate}
        generateLabel={generating ? "Generating..." : "I'm ready, generate my logo"}
        generating={generating}
        requiredFields={["brand_name", "business_description"]}
      />
    </div>
  );
}
