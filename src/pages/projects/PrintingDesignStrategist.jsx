import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, ChevronLeft } from "lucide-react";
import AIStrategist from "../../components/strategist/AIStrategist";
import PrintingDesignView from "./PrintingDesignView";
import { apiServices } from "../../services/apiServices";
import { useLoading } from "../../context/LoadingContext";

const PD_CHECKLIST = [
  { id: "format",  label: "Print format" },
  { id: "specs",   label: "Size and specs" },
  { id: "project", label: "Your project" },
  { id: "content", label: "Content" },
  { id: "style",   label: "Style and finish" },
];

const PD_LOADER_MESSAGES = [
  "Reading your print brief...",
  "Calibrating the timeline to your format...",
  "Drafting the deliverable list...",
  "Refining the visual direction...",
  "Lining up your next steps...",
  "Almost there...",
];

function buildPayload(brief) {
  return {
    type: brief.type || "",
    size: brief.size || "",
    fold: brief.fold || "",
    ebook_title:    brief.ebook_title || "",
    ebook_topic:    brief.ebook_topic || "",
    ebook_audience: brief.ebook_audience || "",
    ebook_goal:     brief.ebook_goal || "",
    ebook_length:   brief.ebook_length || "",
    ebook_language: brief.ebook_language || "",
    brand_name:    brief.brand_name || "",
    purpose:       brief.purpose || "",
    audience:      brief.audience || "",
    content_status: brief.content_status || "",
    content_text:   brief.content_text || "",
    ctas:           brief.ctas || "",
    visual_tone: Array.isArray(brief.visual_tone) ? brief.visual_tone : [],
    has_assets: brief.has_assets || "",
    brand_assets: Array.isArray(brief.brand_assets) ? brief.brand_assets : [],
    content_uploads: Array.isArray(brief.content_uploads) ? brief.content_uploads : [],
    refs:  brief.refs || "",
    notes: brief.notes || "",
  };
}

export default function PrintingDesignStrategist() {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [briefForResult, setBriefForResult] = useState(null);
  const [error, setError] = useState("");
  // Files uploaded via the composer paperclip. Merged into the brief at
  // submit time, exactly like the brand-guidelines flow.
  const [composerAttachments, setComposerAttachments] = useState([]);
  const { withLoading } = useLoading();

  async function handleReadyToGenerate(brief, session) {
    if (!brief?.brand_name || !brief?.purpose) {
      setError("I still need a brand name and what this piece is for.");
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
        () => apiServices.generate_printing_design({ form: buildPayload(mergedBrief) }),
        PD_LOADER_MESSAGES,
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
        try { localStorage.removeItem("aog.strategist.session.printing_design"); } catch { /* ignore */ }
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
        <PrintingDesignView
          brief={result.brief}
          brandName={briefForResult.brand_name}
          description={briefForResult.purpose}
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
        <h2 className="strategist-header-title">Print Design Brief</h2>
        <span className="strategist-header-sub">Your answers build the brief automatically</span>
      </div>
      <span className="strategist-header-tag">
        <Sparkles size={12} /> AI-guided
      </span>
      <button
        type="button"
        className="strategist-header-change"
        onClick={() => navigate("/new-projects/branding-design/printing")}
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
        onClick={() => navigate("/new-projects/branding-design/printing")}
      >
        <ArrowLeft size={16} />
        Back to Branding &amp; Design / Printing Design <span className="method-picker-crumb">/ AI Designer</span>
      </button>

      {error ? <div className="strategist-page-error">{error}</div> : null}

      <AIStrategist
        service="printing_design"
        checklistSteps={PD_CHECKLIST}
        header={header}
        onReadyToGenerate={handleReadyToGenerate}
        generateLabel={generating ? "Submitting..." : "Submit my brief"}
        generating={generating}
        requiredFields={["type", "brand_name", "purpose"]}
        enableAttachments
        onAttachmentsChange={setComposerAttachments}
        attachmentProjectName="Printing Design Request"
        attachmentServiceType="printing_design"
      />
    </div>
  );
}
