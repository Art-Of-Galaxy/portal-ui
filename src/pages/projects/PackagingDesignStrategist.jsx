import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, ChevronLeft } from "lucide-react";
import AIStrategist from "../../components/strategist/AIStrategist";
import PackagingDesignView from "./PackagingDesignView";
import { apiServices } from "../../services/apiServices";
import { useLoading } from "../../context/LoadingContext";

const PK_CHECKLIST = [
  { id: "type",    label: "Package type" },
  { id: "style",   label: "Style and variant" },
  { id: "product", label: "Product info" },
  { id: "specs",   label: "Size and finish" },
  { id: "files",   label: "Files and notes" },
];

const PK_LOADER_MESSAGES = [
  "Reading your packaging spec...",
  "Pairing dieline templates to your style...",
  "Calibrating the timeline to your SKU count...",
  "Drafting the deliverable list...",
  "Lining up your next steps...",
  "Almost there...",
];

function buildPayload(brief) {
  return {
    package_type: brief.package_type || "",
    subtype:      brief.subtype || "",
    brand_name:   brief.brand_name || "",
    product_name: brief.product_name || "",
    product_desc: brief.product_desc || "",
    sku_count:    brief.sku_count || "",
    dim_w: brief.dim_w || "",
    dim_h: brief.dim_h || "",
    dim_d: brief.dim_d || "",
    dim_unit: brief.dim_unit || "in",
    finishes: Array.isArray(brief.finishes) ? brief.finishes : [],
    bag_features: Array.isArray(brief.bag_features) ? brief.bag_features : [],
    eco: brief.eco || "",
    has_files: brief.has_files || "",
    brand_assets: Array.isArray(brief.brand_assets) ? brief.brand_assets : [],
    inner_notes: brief.inner_notes || "",
    notes: brief.notes || "",
  };
}

export default function PackagingDesignStrategist() {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [briefForResult, setBriefForResult] = useState(null);
  const [error, setError] = useState("");
  const [composerAttachments, setComposerAttachments] = useState([]);
  const { withLoading } = useLoading();

  async function handleReadyToGenerate(brief, session) {
    if (!brief?.package_type || !brief?.brand_name || !brief?.product_name) {
      setError("I still need a package type, brand name, and product name.");
      return;
    }
    setError("");
    setGenerating(true);
    try {
      const mergedBrief = {
        ...brief,
        brand_assets: [
          ...(Array.isArray(brief.brand_assets) ? brief.brand_assets : []),
          ...composerAttachments,
        ],
      };
      const res = await withLoading(
        () => apiServices.generate_packaging_design({ form: buildPayload(mergedBrief) }),
        PK_LOADER_MESSAGES,
        { label: "AI is briefing", intervalMs: 2200 }
      );
      if (!res?.success) throw new Error(res?.message || "Brief generation failed");
      setResult(res);
      setBriefForResult(mergedBrief);
      if (session?.id) {
        try {
          await apiServices.strategist_complete({
            session_id: session.id,
            project_id: res.project_id,
          });
        } catch { /* non-fatal */ }
        try { localStorage.removeItem("aog.strategist.session.packaging_design"); } catch { /* ignore */ }
      }
    } catch (err) {
      setError(err?.message || "Could not submit. Try again?");
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
        <PackagingDesignView
          brief={result.brief}
          brandName={briefForResult.brand_name}
          description={briefForResult.product_desc || briefForResult.product_name}
          statusLabel="In Progress"
          projectId={result.project_id}
          errors={result.errors}
        />
      </div>
    );
  }

  const header = (
    <div className="strategist-header-row">
      <div className="strategist-header-titlewrap">
        <h2 className="strategist-header-title">Packaging Design Brief</h2>
        <span className="strategist-header-sub">Your specs build the brief automatically</span>
      </div>
      <span className="strategist-header-tag">
        <Sparkles size={12} /> AI-guided
      </span>
      <button
        type="button"
        className="strategist-header-change"
        onClick={() => navigate("/new-projects/branding-design/packaging")}
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
        onClick={() => navigate("/new-projects/branding-design/packaging")}
      >
        <ArrowLeft size={16} />
        Back to Branding &amp; Design / Packaging Design <span className="method-picker-crumb">/ AI Specialist</span>
      </button>

      {error ? <div className="strategist-page-error">{error}</div> : null}

      <AIStrategist
        service="packaging_design"
        checklistSteps={PK_CHECKLIST}
        header={header}
        onReadyToGenerate={handleReadyToGenerate}
        generateLabel={generating ? "Submitting..." : "Submit my packaging brief"}
        generating={generating}
        requiredFields={["package_type", "brand_name", "product_name"]}
        enableAttachments
        onAttachmentsChange={setComposerAttachments}
        attachmentProjectName="Packaging Design Request"
        attachmentServiceType="packaging_design"
      />
    </div>
  );
}
