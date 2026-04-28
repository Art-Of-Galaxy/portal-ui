import { useNavigate } from "react-router-dom";
import {
  Palette,
  MonitorSmartphone,
  LineChart,
  Share2,
  Mail,
  Megaphone,
  Bot,
  Film,
} from "lucide-react";
import project1 from "../../assets/signup-assets/2_CreateProject_1@2x.png";
import project2 from "../../assets/signup-assets/2_CreateProject_2@2x.png";
import project3 from "../../assets/signup-assets/2_CreateProject_3@2x.png";
import project4 from "../../assets/signup-assets/2_CreateProject_4@2x.png";
import project5 from "../../assets/signup-assets/2_CreateProject_5@2x.png";
import project6 from "../../assets/signup-assets/2_CreateProject_6@2x.png";
import project7 from "../../assets/signup-assets/2_CreateProject_7@2x.png";
import project8 from "../../assets/signup-assets/2_CreateProject_8@2x.png";

const SERVICES = [
  {
    id: "branding",
    title: "Branding and Design",
    description: "Craft Identity. Inspire Loyalty. Drive Growth: Build a Brand That Stands Out.",
    image: project1,
    icon: Palette,
    path: "/new-projects/branding-design",
  },
  {
    id: "web",
    title: "Web Solutions",
    description: "Build. Connect. Thrive: Web Solutions Designed for Growth.",
    image: project2,
    icon: MonitorSmartphone,
    path: "/new-projects/web-solutions",
  },
  {
    id: "marketing",
    title: "Marketing Consulting",
    description: "Unify Your Strategy. Scale with Precision. Lead the Market.",
    image: project3,
    icon: LineChart,
    path: "/new-projects/marketing",
  },
  {
    id: "social",
    title: "Social Media Management",
    description: "Engage. Inspire. Thrive.",
    image: project4,
    icon: Share2,
    path: "/new-projects/social",
  },
  {
    id: "email",
    title: "Email Marketing",
    description: "Engage. Nurture. Convert: Powered by Creative Strategy and Automation.",
    image: project5,
    icon: Mail,
    path: "/new-projects/email",
  },
  {
    id: "campaigns",
    title: "B2B & B2C Campaigns",
    description: "Drive the Right Action. Attract the Right Audience. Fuel Real Growth.",
    image: project6,
    icon: Megaphone,
    path: "/new-projects/campaigns",
  },
  {
    id: "ai",
    title: "AI Integrations & Automations",
    description: "Engage Seamlessly on Every Channel with AI solutions, AI voice Agents, AI Chatbots.",
    image: project7,
    icon: Bot,
    path: "/new-projects/ai-integrations",
  },
  {
    id: "video",
    title: "AI Video Production",
    description: "Create. Automate. Captivate.",
    image: project8,
    icon: Film,
    path: "/new-projects/video",
  },
];

export default function NewProject() {
  const navigate = useNavigate();

  return (
    <div className="portal-page">
      <div className="portal-create-header">
        <h1 className="portal-create-title">Let's create a project</h1>
        <p className="portal-create-sub">Choose the service you need</p>
      </div>

      <div className="portal-service-grid">
        {SERVICES.map(({ id, title, description, image, icon: Icon, path }) => (
          <button
            key={id}
            type="button"
            className="portal-service-card"
            onClick={() => navigate(path)}
          >
            <div className="portal-service-image">
              <img src={image} alt={title} />
            </div>
            <div className="portal-service-body">
              <span className="portal-service-icon">
                <Icon size={18} />
              </span>
              <h3 className="portal-service-title">{title}</h3>
              <p className="portal-service-desc">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
