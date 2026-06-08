import { useNavigate } from "react-router-dom";
import { ArrowLeft, Video, Megaphone, Sparkles } from "lucide-react";

// Sub-service catalog for AI Video Production. Mirrors BrandingDesign:
// one hero strip + grid of tool tiles. Only UGC Ads is wired up today,
// with "coming soon" placeholders so the catalog feels intentional and
// the operator can drop in new sub-services without re-shaping the
// layout later.

const TOOLS = [
  {
    id: "ugc",
    title: "UGC Ads Video",
    description: "Real, candid testimonial-style ads built around your product. Powered by Higgsfield.",
    icon: Megaphone,
    accent: "linear-gradient(135deg, #5540ff 0%, #00ff89 100%)",
    path: "/new-projects/video/ugc-ads",
    comingSoon: false,
  },
  {
    id: "product-demo",
    title: "Product Demo Reels",
    description: "Polished short-form product walkthroughs for Reels and TikTok.",
    icon: Video,
    accent: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
    path: "/new-projects/video",
    comingSoon: true,
  },
  {
    id: "brand-spot",
    title: "Brand Spot",
    description: "30 to 60 second hero brand films with cinematic camera moves.",
    icon: Sparkles,
    accent: "linear-gradient(135deg, #1e1b48 0%, #377cc7 100%)",
    path: "/new-projects/video",
    comingSoon: true,
  },
];

export default function AIVideoProduction() {
  const navigate = useNavigate();

  return (
    <div className="portal-page">
      <button
        type="button"
        className="portal-back-link"
        onClick={() => navigate("/new-projects")}
      >
        <ArrowLeft size={16} />
        Back to services
      </button>

      <div className="portal-create-header">
        <h1 className="portal-create-title">Let&apos;s create a project</h1>
        <p className="portal-create-sub">Choose the service you need</p>
      </div>

      <div className="branding-panel">
        <div className="branding-panel-hero">
          <div className="branding-panel-hero-content">
            <span className="branding-panel-hero-tile">
              <Video size={22} />
            </span>
            <div>
              <h2 className="branding-panel-hero-title">AI Video Production</h2>
              <p className="branding-panel-hero-sub">
                Create. Automate. Captivate: Cinematic AI-powered video assets for every channel.
              </p>
            </div>
          </div>
        </div>

        <div className="branding-tool-grid">
          {TOOLS.map((tool) => {
            const TileIcon = tool.icon;
            return (
              <button
                key={tool.id}
                type="button"
                className={`branding-tool-card ${tool.comingSoon ? "is-coming-soon" : ""}`}
                onClick={() => (tool.comingSoon ? null : navigate(tool.path))}
                disabled={tool.comingSoon}
                title={tool.comingSoon ? "Coming soon" : undefined}
              >
                <div className="branding-tool-image" style={{ background: tool.accent }} />
                <div className="branding-tool-body">
                  <span className="branding-tool-icon">
                    <TileIcon size={18} />
                  </span>
                  <h3 className="branding-tool-title">{tool.title}</h3>
                  <p className="branding-tool-desc">{tool.description}</p>
                  {tool.comingSoon ? <span className="branding-tool-soon">Coming soon</span> : null}
                </div>
              </button>
            );
          })}
        </div>

        <div className="branding-panel-actions">
          <button
            type="button"
            className="branding-btn-primary"
            onClick={() => navigate("/new-projects")}
          >
            Return
          </button>
        </div>
      </div>
    </div>
  );
}
