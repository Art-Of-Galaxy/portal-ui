import { createElement, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Film,
  LineChart,
  Mail,
  Megaphone,
  MonitorSmartphone,
  Palette,
  Share2,
} from "lucide-react";
import OnboardingShell from "../../components/auth/OnboardingShell";
import project1 from "../../assets/signup-assets/2_CreateProject_1@2x.png";
import project2 from "../../assets/signup-assets/2_CreateProject_2@2x.png";
import project3 from "../../assets/signup-assets/2_CreateProject_3@2x.png";
import project4 from "../../assets/signup-assets/2_CreateProject_4@2x.png";
import project5 from "../../assets/signup-assets/2_CreateProject_5@2x.png";
import project6 from "../../assets/signup-assets/2_CreateProject_6@2x.png";
import project7 from "../../assets/signup-assets/2_CreateProject_7@2x.png";
import project8 from "../../assets/signup-assets/2_CreateProject_8@2x.png";

const PROJECT_OPTIONS = [
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
    id: "ai-integrations",
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

export default function CreateProjectSelection() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState("");
  const selectedProject = PROJECT_OPTIONS.find((option) => option.id === selectedOption);

  return (
    <OnboardingShell showHomeLink showLanguage={false} homePath="/home" homeLabel="Home">
      <section className="project-select-wrap">
        <h1>Let&apos;s create a project</h1>
        <p>Choose the service you need</p>

        <div className="portal-service-grid project-grid">
          {PROJECT_OPTIONS.map(({ id, title, description, image, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`portal-service-card project-card ${selectedOption === id ? "is-selected" : ""}`}
              onClick={() => setSelectedOption(id)}
            >
              <div className="portal-service-image">
                <img src={image} alt={title} />
              </div>
              <div className="portal-service-body">
                <span className="portal-service-icon">
                  {createElement(Icon, { size: 18 })}
                </span>
                <h3 className="portal-service-title">{title}</h3>
                <p className="portal-service-desc">{description}</p>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="project-start-btn"
          disabled={!selectedProject}
          onClick={() => selectedProject && navigate(selectedProject.path)}
        >
          Start my request
        </button>
      </section>
    </OnboardingShell>
  );
}
