import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import OnboardingShell from "../../components/auth/OnboardingShell";
import { authAppearance } from "../../config/authAppearance";
import onboardingFormBG from "../../assets/OnboardingFormBG.png";
import {
  getCurrentOnboardingUser,
  getOnboardingProgress,
  markOnboardingCompleted,
  saveOnboardingProgress,
  setCurrentOnboardingUser,
} from "../../utils/onboardingProgress";
import { apiServices } from "../../services/apiServices";

const GOAL_OPTIONS = [
  "Increase Brand Awareness",
  "Boost Online Sales",
  "Launch New Product or Service",
  "Improve Lead Generation",
  "Optimize Marketing Automation",
];

const SERVICE_OPTIONS = [
  "Branding & Logo Design",
  "AI Automation & Integrations",
  "Packaging Design",
  "Campaign Concepting",
  "Email Marketing",
  "Digital Ads (Paid Social / Display)",
  "Social Media Management",
  "Lead Generation",
  "Website Design/Development",
  "CRM or Chatbot Integration",
  "SEO & Funnel Optimization",
  "AI Video Production",
];

const ASSET_OPTIONS = [
  "Logo Files",
  "Brand Guidelines",
  "Color Palette / Fonts",
  "Product Photos",
  "Marketing Collateral",
  "None, I need help developing",
];

const TOTAL_STEPS = 4;
const clampStep = (value) => Math.min(Math.max(Number(value) || 1, 1), TOTAL_STEPS);

function ProgressHeader({ step }) {
  const percentage = Math.round((step / TOTAL_STEPS) * 100);
  return (
    <div className="onboard-progress-wrap">
      <p className="onboard-progress-label">
        Step {step} of {TOTAL_STEPS}: <strong>{percentage}% Complete</strong>
      </p>
      <div className="onboard-progress-track">
        <div className="onboard-progress-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function StepCard({ title, description, children, onBack, onNext, nextLabel = "Next", disabled = false }) {
  const nextButtonText = nextLabel === "Done" ? nextLabel : `${nextLabel} ->`;

  return (
    <section className="onboard-card">
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="onboard-card-content">{children}</div>
      <div className="onboard-actions">
        <button type="button" className="onboard-back-btn" onClick={onBack}>
          {"<-"}
        </button>
        <button type="button" className="onboard-next-btn" onClick={onNext} disabled={disabled}>
          {nextButtonText}
        </button>
      </div>
    </section>
  );
}

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userEmail =
    (typeof window !== "undefined" && localStorage.getItem("user_email")?.trim().toLowerCase()) ||
    getCurrentOnboardingUser();
  const pendingProgress = getOnboardingProgress(userEmail);
  const stepFromQuery = Number(searchParams.get("step"));

  const [step, setStep] = useState(() => clampStep(stepFromQuery || pendingProgress?.step || 1));
  const [isDone, setIsDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [business, setBusiness] = useState({
    primary_contact_name: localStorage.getItem("user_name") || "",
    brand_company_name: "",
    website_url: "",
    phone: "",
    preferred_communication: "",
    offering_type: "",
    industry: "",
    social_media_handles: "",
  });
  const [goals, setGoals] = useState([]);
  const [goalOther, setGoalOther] = useState("");
  const [services, setServices] = useState([]);
  const [serviceOther, setServiceOther] = useState("");
  const [assets, setAssets] = useState([]);
  const [assetUrl, setAssetUrl] = useState("");

  useEffect(() => {
    if (userEmail) {
      setCurrentOnboardingUser(userEmail);
    }
  }, [userEmail]);

  useEffect(() => {
    if (isDone) {
      markOnboardingCompleted(userEmail);
      return;
    }

    saveOnboardingProgress(userEmail, step);
  }, [isDone, step, userEmail]);

  const toggleFromList = (value, selectedValues, setSelectedValues) => {
    setSelectedValues((previousValues) =>
      previousValues.includes(value)
        ? previousValues.filter((item) => item !== value)
        : [...previousValues, value]
    );
  };

  const serviceGrid = useMemo(() => {
    return SERVICE_OPTIONS.map((label) => (
      <button
        key={label}
        type="button"
        className={`onboard-chip ${services.includes(label) ? "is-selected" : ""}`}
        onClick={() => toggleFromList(label, services, setServices)}
      >
        {label}
      </button>
    ));
  }, [services]);

  const updateBusiness = (key, value) => {
    setBusiness((previous) => ({ ...previous, [key]: value }));
  };

  const buildOnboardingPayload = () => ({
    business,
    goals,
    goal_other: goalOther,
    interested_services: services,
    service_other: serviceOther,
    brand_assets: assets,
    asset_url: assetUrl,
    completed_at: new Date().toISOString(),
  });

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep((previousStep) => previousStep + 1);
      return;
    }

    setSaving(true);
    setError("");
    try {
      await apiServices.save_onboarding(buildOnboardingPayload());
      localStorage.setItem("aog_onboarding_data", JSON.stringify(buildOnboardingPayload()));
      setIsDone(true);
    } catch (err) {
      setError(err?.message || "Unable to save onboarding details.");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((previousStep) => previousStep - 1);
    }
  };

  const stepContent = (
    <>
      <ProgressHeader step={step} />
      {error ? <p className="onboard-error">{error}</p> : null}
      {step === 1 ? (
        <StepCard
          title="Let Us Get to Know Your Brand"
          description="Please provide a few essential details so we can better understand your business and tailor your experience."
          onBack={handleBack}
          onNext={handleNext}
          disabled={saving}
        >
          <input className="onboard-input" placeholder="Primary Contact Name" value={business.primary_contact_name} onChange={(e) => updateBusiness("primary_contact_name", e.target.value)} />
          <input className="onboard-input" placeholder="Brand/Company Name" value={business.brand_company_name} onChange={(e) => updateBusiness("brand_company_name", e.target.value)} />
          <input className="onboard-input" placeholder="Website URL" value={business.website_url} onChange={(e) => updateBusiness("website_url", e.target.value)} />
          <input className="onboard-input" placeholder="Phone Number" value={business.phone} onChange={(e) => updateBusiness("phone", e.target.value)} />
          <input className="onboard-input" placeholder="Preferred Method of Communication" value={business.preferred_communication} onChange={(e) => updateBusiness("preferred_communication", e.target.value)} />
          <select className="onboard-input" value={business.offering_type} onChange={(e) => updateBusiness("offering_type", e.target.value)}>
            <option value="">Services or Product</option>
            <option value="Service">Service</option>
            <option value="Product">Product</option>
          </select>
          <select className="onboard-input" value={business.industry} onChange={(e) => updateBusiness("industry", e.target.value)}>
            <option value="">Industry/Market Segment</option>
            <option value="Technology">Technology</option>
            <option value="Retail">Retail</option>
            <option value="Education">Education</option>
          </select>
          <input className="onboard-input" placeholder="Social Media Handles (if applicable)" value={business.social_media_handles} onChange={(e) => updateBusiness("social_media_handles", e.target.value)} />
        </StepCard>
      ) : null}

      {step === 2 ? (
        <StepCard
          title="Define Your Business Goals"
          description="Let us know what you aim to achieve in the next 1 to 6 months so we can align strategy and execution."
          onBack={handleBack}
          onNext={handleNext}
          disabled={saving}
        >
          {GOAL_OPTIONS.map((goal) => (
            <button
              key={goal}
              type="button"
              className={`onboard-chip ${goals.includes(goal) ? "is-selected" : ""}`}
              onClick={() => toggleFromList(goal, goals, setGoals)}
            >
              {goal}
            </button>
          ))}
          <input className="onboard-input" placeholder="Other:" value={goalOther} onChange={(e) => setGoalOther(e.target.value)} />
        </StepCard>
      ) : null}

      {step === 3 ? (
        <StepCard
          title="Select the Services You Are Interested In"
          description="Choose the services you plan to request or explore."
          onBack={handleBack}
          onNext={handleNext}
          disabled={saving}
        >
          <div className="onboard-grid-two">{serviceGrid}</div>
          <input className="onboard-input onboard-grid-span" placeholder="Other:" value={serviceOther} onChange={(e) => setServiceOther(e.target.value)} />
        </StepCard>
      ) : null}

      {step === 4 ? (
        <StepCard
          title="Upload Your Brand Assets"
          description="If you have existing brand materials, indicate what is available. If not, we can help you build from scratch."
          onBack={handleBack}
          onNext={handleNext}
          nextLabel={saving ? "Saving..." : "Done"}
          disabled={saving}
        >
          <div className="onboard-grid-two">
            {ASSET_OPTIONS.map((asset) => (
              <button
                key={asset}
                type="button"
                className={`onboard-chip ${assets.includes(asset) ? "is-selected" : ""}`}
                onClick={() => toggleFromList(asset, assets, setAssets)}
              >
                {asset}
              </button>
            ))}
          </div>
          <p className="onboard-helper-text">
            Upload files directly through the portal or provide links below:
          </p>
          <input className="onboard-input onboard-grid-span" placeholder="Paste a URL" value={assetUrl} onChange={(e) => setAssetUrl(e.target.value)} />
        </StepCard>
      ) : null}
    </>
  );

  const doneContent = (
    <section className="onboard-card onboard-card-done">
      {authAppearance.logoSrc ? (
        <img src={authAppearance.logoSrc} alt={authAppearance.brandName} className="onboard-done-logo" />
      ) : (
        <h2>{authAppearance.brandName}</h2>
      )}
      <p className="onboard-done-main">
        Your responses have been received, and your onboarding is now underway.
      </p>
      <p>
        You will receive a welcome email shortly with next steps, including how to submit projects
        through your AI Portal.
      </p>
      <div className="onboard-done-actions">
        <button type="button" className="onboard-next-btn" onClick={() => navigate("/create-project")}>
          Create a Project
        </button>
        <button type="button" className="onboard-next-btn" onClick={() => navigate("/home")}>
          Go to Home
        </button>
      </div>
    </section>
  );

  return (
    <OnboardingShell
      backgroundImageSrc={onboardingFormBG}
      backgroundImageAlt="Onboarding form background"
    >
      {isDone ? doneContent : stepContent}
    </OnboardingShell>
  );
}
