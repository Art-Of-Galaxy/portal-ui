import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, ChevronLeft } from "lucide-react";
import AIStrategist from "../../components/strategist/AIStrategist";
import EcommerceMockupsView from "./EcommerceMockupsView";
import { apiServices } from "../../services/apiServices";
import { useLoading } from "../../context/LoadingContext";

const EM_CHECKLIST = [
  { id: "platform", label: "Platform and product" },
  { id: "audience", label: "Target customer" },
  { id: "claims",   label: "Key claims" },
  { id: "visual",   label: "Visual style" },
  { id: "assets",   label: "Assets and notes" },
];

const EM_LOADER_MESSAGES = [
  "Reading your product brief...",
  "Distilling your claims...",
  "Composing the 6 mockup prompts...",
  "Sending them to the image model...",
  "Sketching the first concepts...",
  "Polishing the final renders...",
  "Almost there...",
];

function buildPayload(brief) {
  return {
    platforms: Array.isArray(brief.platforms) ? brief.platforms : [],
    other_platform: brief.other_platform || "",
    product_name: brief.product_name || "",
    product_description: brief.product_description || "",
    product_category: brief.product_category || "",
    target_customer: brief.target_customer || "",
    claims: brief.claims || "",
    certifications: Array.isArray(brief.certifications) ? brief.certifications : [],
    background_styles: Array.isArray(brief.background_styles) ? brief.background_styles : [],
    mockup_types: Array.isArray(brief.mockup_types) ? brief.mockup_types : [],
    has_brand: brief.has_brand || "",
    product_uploads: Array.isArray(brief.product_uploads) ? brief.product_uploads : [],
    brand_assets: Array.isArray(brief.brand_assets) ? brief.brand_assets : [],
    refs: brief.refs || "",
    notes: brief.notes || "",
  };
}

export default function EcommerceMockupsStrategist() {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [briefForResult, setBriefForResult] = useState(null);
  const [error, setError] = useState("");
  // In-composer uploads live in local state. Merge as product photos at
  // submit time so the backend can pass them to fal.ai as references.
  const [composerAttachments, setComposerAttachments] = useState([]);
  const { withLoading } = useLoading();

  async function handleReadyToGenerate(brief, session) {
    const hasPlatform = (Array.isArray(brief?.platforms) && brief.platforms.length > 0) || !!brief?.other_platform;
    if (!hasPlatform || !brief?.product_name || !brief?.product_description) {
      setError("I still need a platform, a product name, and a one-line description.");
      return;
    }
    setError("");
    setGenerating(true);
    try {
      const mergedBrief = {
        ...brief,
        product_uploads: [
          ...(Array.isArray(brief.product_uploads) ? brief.product_uploads : []),
          ...composerAttachments,
        ],
      };
      const res = await withLoading(
        () => apiServices.generate_ecommerce_mockups({ form: buildPayload(mergedBrief) }),
        EM_LOADER_MESSAGES,
        { label: "AI is designing", intervalMs: 2400 }
      );
      if (!res?.success) throw new Error(res?.message || "Generation failed");
      setResult(res);
      setBriefForResult(mergedBrief);
      if (session?.id) {
        try {
          await apiServices.strategist_complete({
            session_id: session.id,
            project_id: res.project_id,
          });
        } catch { /* non-fatal */ }
        try { localStorage.removeItem("aog.strategist.session.ecommerce_mockups"); } catch { /* ignore */ }
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
        <EcommerceMockupsView
          mockups={result.mockups}
          productName={briefForResult.product_name}
          description={briefForResult.product_description}
          statusLabel="Done"
          projectId={result.project_id}
          imageModel={result.image_model}
          errors={result.errors}
        />
      </div>
    );
  }

  const header = (
    <div className="strategist-header-row">
      <div className="strategist-header-titlewrap">
        <h2 className="strategist-header-title">E-Commerce Mockup Brief</h2>
        <span className="strategist-header-sub">Your answers build the production brief automatically</span>
      </div>
      <span className="strategist-header-tag">
        <Sparkles size={12} /> AI-guided
      </span>
      <button
        type="button"
        className="strategist-header-change"
        onClick={() => navigate("/new-projects/branding-design/ecommerce-mockups")}
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
        onClick={() => navigate("/new-projects/branding-design/ecommerce-mockups")}
      >
        <ArrowLeft size={16} />
        Back to Branding &amp; Design / E-Commerce Mockups <span className="method-picker-crumb">/ AI Specialist</span>
      </button>

      {error ? <div className="strategist-page-error">{error}</div> : null}

      <AIStrategist
        service="ecommerce_mockups"
        checklistSteps={EM_CHECKLIST}
        header={header}
        onReadyToGenerate={handleReadyToGenerate}
        generateLabel={generating ? "Generating..." : "Generate my mockups"}
        generating={generating}
        requiredFields={["platforms", "product_name", "product_description"]}
        enableAttachments
        onAttachmentsChange={setComposerAttachments}
        attachmentProjectName="E-Commerce Mockups Request"
        attachmentServiceType="ecommerce_mockups"
      />
    </div>
  );
}
