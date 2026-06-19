import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Mic, Sparkles, Workflow } from "lucide-react";

// Sub-service catalog for AI Integrations & Automations. Mirrors
// AIVideoProduction: hero strip + tool tiles. Shopify Blog Engine is
// the first one live; the rest are "coming soon" placeholders.

const TOOLS = [
  {
    id: "shopify-blog",
    title: "Shopify Blog Engine",
    description: "Connect your Shopify store and let the agent write, optimize, and auto-publish SEO articles on schedule.",
    icon: FileText,
    accent: "linear-gradient(135deg, #5e8e3e 0%, #0f766e 100%)",
    path: "/new-projects/ai-integrations/shopify-blog",
    comingSoon: false,
  },
  {
    id: "voice-agent",
    title: "Voice Agents",
    description: "Set up inbound and outbound voice agents that route, qualify, and book.",
    icon: Mic,
    accent: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
    path: "/new-projects/ai-integrations",
    comingSoon: true,
  },
  {
    id: "chatbot",
    title: "Website Chatbot",
    description: "Trained on your site + product catalog. Lives in the corner of your storefront.",
    icon: Sparkles,
    accent: "linear-gradient(135deg, #5540ff 0%, #00ff89 100%)",
    path: "/new-projects/ai-integrations",
    comingSoon: true,
  },
  {
    id: "workflows",
    title: "Workflow Automations",
    description: "Trigger AI actions from anything: webhooks, Slack, Notion, email, calendar.",
    icon: Workflow,
    accent: "linear-gradient(135deg, #1e1b48 0%, #377cc7 100%)",
    path: "/new-projects/ai-integrations",
    comingSoon: true,
  },
];

export default function AIIntegrations() {
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
        <p className="portal-create-sub">Choose the integration you need</p>
      </div>

      <div className="branding-panel">
        <div className="branding-panel-hero">
          <div className="branding-panel-hero-content">
            <span className="branding-panel-hero-tile">
              <Workflow size={22} />
            </span>
            <div>
              <h2 className="branding-panel-hero-title">AI Integrations &amp; Automations</h2>
              <p className="branding-panel-hero-sub">
                Hook your business systems up to AI. Publish, route, qualify, and automate, hands-off.
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
