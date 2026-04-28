import { useState } from "react";
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
    description: "Craft identity and visuals that stand out.",
    image: project1,
    icon: "BD",
  },
  {
    id: "web",
    title: "Web Solutions",
    description: "Build modern web experiences for growth.",
    image: project2,
    icon: "WEB",
  },
  {
    id: "marketing",
    title: "Marketing Consulting",
    description: "Scale with precision and data-backed strategy.",
    image: project3,
    icon: "MKT",
  },
  {
    id: "social",
    title: "Social Media Management",
    description: "Engage and grow across channels.",
    image: project4,
    icon: "SMM",
  },
  {
    id: "email",
    title: "Email Marketing",
    description: "Automate campaigns and improve retention.",
    image: project5,
    icon: "EML",
  },
  {
    id: "campaigns",
    title: "B2B & B2C Campaigns",
    description: "Drive targeted growth with creative campaigns.",
    image: project6,
    icon: "B2B",
  },
  {
    id: "ai-integrations",
    title: "AI Integrations",
    description: "Build practical AI workflows and automations.",
    image: project7,
    icon: "AI",
  },
  {
    id: "video",
    title: "AI Video Production",
    description: "Create cinematic AI-powered video assets.",
    image: project8,
    icon: "VID",
  },
];

export default function CreateProjectSelection() {
  const [selectedOption, setSelectedOption] = useState("");

  return (
    <OnboardingShell showHomeLink showLanguage={false} homePath="/home" homeLabel="Home">
      <section className="project-select-wrap">
        <h1>Let&apos;s create a project</h1>
        <p>Choose the service you need</p>

        <div className="project-grid">
          {PROJECT_OPTIONS.map(({ id, title, description, image, icon }) => (
            <button
              key={id}
              type="button"
              className={`project-card ${selectedOption === id ? "is-selected" : ""}`}
              onClick={() => setSelectedOption(id)}
            >
              <img src={image} alt={title} />
              <div className="project-card-content">
                <span className="project-card-icon">{icon}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </button>
          ))}
        </div>

        <button type="button" className="project-start-btn" disabled={!selectedOption}>
          Start my request
        </button>
      </section>
    </OnboardingShell>
  );
}
