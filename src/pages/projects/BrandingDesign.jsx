import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  PenTool,
  BookOpen,
  Printer,
  RefreshCw,
  Package,
  ShoppingBag,
  Pencil,
} from "lucide-react";

const TOOLS = [
  {
    id: "logo",
    title: "Logo Design",
    description: "Capture your brand's essence with versatile, high-impact logos.",
    icon: PenTool,
    accent: "linear-gradient(135deg, #1a3a4f 0%, #285c80 100%)",
    path: "/new-projects/branding-design/logo",
  },
  {
    id: "guidelines",
    title: "Brand Guidelines Development",
    description: "Establish a consistent, professional brand presence.",
    icon: BookOpen,
    accent: "linear-gradient(135deg, #f3eee5 0%, #cfd8e3 100%)",
    path: "/new-projects/branding-design/brand-guidelines",
  },
  {
    id: "printing",
    title: "Printing Design",
    description: "Refresh and reposition your brand with strategic updates.",
    icon: Printer,
    accent: "linear-gradient(135deg, #f7d4a3 0%, #e8a868 100%)",
    path: "/new-projects/branding-design/printing",
  },
  {
    id: "rebranding",
    title: "Rebranding Services",
    description: "Refresh and reposition your brand with strategic updates.",
    icon: RefreshCw,
    accent: "linear-gradient(135deg, #2d2d2d 0%, #4a3636 100%)",
    path: "/new-projects/branding-design/rebranding",
  },
  {
    id: "packaging",
    title: "Packaging Design",
    description: "Make your product stand out on shelves and screens.",
    icon: Package,
    accent: "linear-gradient(135deg, #e85d4a 0%, #f4a261 50%, #2a9d8f 100%)",
    path: "/new-projects/branding-design/packaging",
  },
  {
    id: "ecom",
    title: "E-Commerce Mockups",
    description: "Enhance your online presence with dynamic, platform-ready visuals.",
    icon: ShoppingBag,
    accent: "linear-gradient(135deg, #5b3a8a 0%, #c2185b 50%, #f48fb1 100%)",
    path: "/new-projects/branding-design/ecommerce-mockups",
  },
];

export default function BrandingDesign() {
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
              <Pencil size={22} />
            </span>
            <div>
              <h2 className="branding-panel-hero-title">Branding and Design</h2>
              <p className="branding-panel-hero-sub">
                Craft Identity. Inspire Loyalty. Drive Growth: Build a Brand That Stands Out.
              </p>
            </div>
          </div>
        </div>

        <div className="branding-tool-grid">
          {TOOLS.map(({ id, title, description, icon: Icon, accent, path }) => (
            <button
              key={id}
              type="button"
              className="branding-tool-card"
              onClick={() => navigate(path)}
            >
              <div className="branding-tool-image" style={{ background: accent }} />
              <div className="branding-tool-body">
                <span className="branding-tool-icon">
                  <Icon size={18} />
                </span>
                <h3 className="branding-tool-title">{title}</h3>
                <p className="branding-tool-desc">{description}</p>
              </div>
            </button>
          ))}
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
