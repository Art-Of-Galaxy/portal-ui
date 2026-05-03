import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "../pages/login/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import SignUp from "../pages/signUp/SignUp";
import OnboardingFlow from "../pages/signUp/OnboardingFlow";
import Home from "../pages/dashboard/Home";
import Dashboard from "../pages/dashboard/Dashboard";
import { AuthenticatedLayout } from "../layouts/mainLayout/AuthenticatedLayout";
import Projects from "../pages/projects/Projects";
import CreateProjectSelection from "../pages/projects/CreateProjectSelection";
import NewProject from "../pages/projects/NewProject";
import BrandingDesign from "../pages/projects/BrandingDesign";
import BrandGuidelinesForm from "../pages/projects/BrandGuidelinesForm";
import RebrandingForm from "../pages/projects/RebrandingForm";
import EcommerceMockupsForm from "../pages/projects/EcommerceMockupsForm";
import LogoDesignForm from "../pages/projects/LogoDesignForm";
import MyFiles from "../pages/files/MyFiles";
import ProjectDetail from "../pages/projects/ProjectDetail";
import Authentication from "../components/Authentication";
import ForgotPassword from "../pages/login/ForgotPassword";
import ForgotPasswordSent from "../pages/login/ForgotPasswordSent";
import ComingSoon from "../pages/ComingSoon";
import ProfileSettings from "../pages/profile/ProfileSettings";

const withLayout = (Page, props = {}) => (
  <AuthenticatedLayout>
    <Page {...props} />
  </AuthenticatedLayout>
);

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<Authentication />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signup/onboarding" element={<OnboardingFlow />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-password/sent" element={<ForgotPasswordSent />} />

        {/* Onboarding-flow create project (keep separate from portal "New Projects") */}
        <Route path="/create-project" element={<CreateProjectSelection />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={withLayout(Home)} />
          <Route path="/dashboard" element={withLayout(Dashboard)} />

          {/* Portal "New Projects" — service catalog */}
          <Route path="/new-projects" element={withLayout(NewProject)} />
          <Route path="/new-projects/branding-design" element={withLayout(BrandingDesign)} />

          {/* Branding & Design tool agents (placeholders until each is built) */}
          <Route path="/new-projects/branding-design/logo" element={withLayout(LogoDesignForm)} />
          <Route path="/new-projects/branding-design/brand-guidelines" element={withLayout(BrandGuidelinesForm)} />
          <Route path="/new-projects/branding-design/printing" element={withLayout(ComingSoon, { title: "Printing Design", description: "Print-ready collateral powered by GPT and Claude Sonnet. Tool flow coming soon." })} />
          <Route path="/new-projects/branding-design/rebranding" element={withLayout(RebrandingForm)} />
          <Route path="/new-projects/branding-design/packaging" element={withLayout(ComingSoon, { title: "Packaging Design", description: "Production-ready packaging concepts. Tool flow coming soon." })} />
          <Route path="/new-projects/branding-design/ecommerce-mockups" element={withLayout(EcommerceMockupsForm)} />

          {/* Other 7 domain expert agents (placeholders) */}
          <Route path="/new-projects/web-solutions" element={withLayout(ComingSoon, { title: "Web Solutions", description: "Website development, e-commerce, landing pages, SEO, web apps and remodels. Coming soon." })} />
          <Route path="/new-projects/marketing" element={withLayout(ComingSoon, { title: "Marketing Consulting", description: "Strategy, positioning and growth playbooks. Coming soon." })} />
          <Route path="/new-projects/social" element={withLayout(ComingSoon, { title: "Social Media Management", description: "Content planning, scheduling and analytics. Coming soon." })} />
          <Route path="/new-projects/email" element={withLayout(ComingSoon, { title: "Email Marketing", description: "Lifecycle automations, broadcasts and template design. Coming soon." })} />
          <Route path="/new-projects/campaigns" element={withLayout(ComingSoon, { title: "B2B & B2C Campaigns", description: "Multi-channel campaign strategy and creative. Coming soon." })} />
          <Route path="/new-projects/ai-integrations" element={withLayout(ComingSoon, { title: "AI Integrations & Automations", description: "Voice agents, chatbots and workflow automation. Coming soon." })} />
          <Route path="/new-projects/video" element={withLayout(ComingSoon, { title: "AI Video Production", description: "Cinematic AI-powered video assets. Coming soon." })} />

          <Route path="/my-projects" element={withLayout(Projects)} />
          <Route path="/my-projects/:id" element={withLayout(ProjectDetail)} />
          <Route path="/my-tasks" element={withLayout(ComingSoon, { title: "My Tasks", description: "Your task inbox will live here — assignments, due dates, and status in one place." })} />
          <Route path="/my-files" element={withLayout(MyFiles)} />

          <Route path="/customers" element={withLayout(ComingSoon, { title: "Customers", description: "Manage your customer database, tags, and segments in one place." })} />
          <Route path="/conversations" element={withLayout(ComingSoon, { title: "Conversations", description: "Centralize chats and client communication across channels." })} />
          <Route path="/campaigns" element={withLayout(ComingSoon, { title: "Campaigns", description: "Plan, launch, and monitor your B2B/B2C marketing campaigns here." })} />
          <Route path="/conversions" element={withLayout(ComingSoon, { title: "Conversions", description: "Track conversion metrics and funnels across channels." })} />
          <Route path="/reporting" element={withLayout(ComingSoon, { title: "Reporting", description: "Performance dashboards and exportable reports live here." })} />
          <Route path="/billing" element={withLayout(ComingSoon, { title: "Billing", description: "Your invoices, plans, and payment methods will appear here." })} />
          <Route path="/get-inspired" element={withLayout(ComingSoon, { title: "Get Inspired", description: "A curated gallery of ideas, templates, and success stories." })} />

          <Route path="/support" element={withLayout(ComingSoon, { title: "Live customer support", description: "Chat with our team. We'll bring live support right inside the portal." })} />
          <Route path="/invite-team" element={withLayout(ComingSoon, { title: "Invite team members", description: "Invite teammates and set their roles to collaborate on projects." })} />
          <Route path="/profile" element={withLayout(ProfileSettings)} />
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
