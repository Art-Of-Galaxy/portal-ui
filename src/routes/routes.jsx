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
import BrandGuidelines from "../pages/projects/BrandGuidelines";
import BrandGuidelinesStrategist from "../pages/projects/BrandGuidelinesStrategist";
import BrandGuidelinesQuiz from "../pages/projects/BrandGuidelinesQuiz";
import PrintingDesign from "../pages/projects/PrintingDesign";
import PrintingDesignStrategist from "../pages/projects/PrintingDesignStrategist";
import PrintingDesignQuiz from "../pages/projects/PrintingDesignQuiz";
import PackagingDesign from "../pages/projects/PackagingDesign";
import PackagingDesignStrategist from "../pages/projects/PackagingDesignStrategist";
import PackagingDesignQuiz from "../pages/projects/PackagingDesignQuiz";
import RebrandingForm from "../pages/projects/RebrandingForm";
import EcommerceMockups from "../pages/projects/EcommerceMockups";
import EcommerceMockupsStrategist from "../pages/projects/EcommerceMockupsStrategist";
import EcommerceMockupsQuiz from "../pages/projects/EcommerceMockupsQuiz";
import SocialMediaHub from "../pages/projects/social/SocialMediaHub";
import SocialMediaCreate from "../pages/projects/social/SocialMediaCreate";
import SocialConnections from "../pages/projects/social/SocialConnections";
import AIIntegrations from "../pages/projects/AIIntegrations";
import BlogEngineHub from "../pages/projects/blog/BlogEngineHub";
import BlogEngineCreate from "../pages/projects/blog/BlogEngineCreate";
import ShopifyConnections from "../pages/projects/blog/ShopifyConnections";
import WordPressBlogHub from "../pages/projects/wp-blog/WordPressBlogHub";
import WordPressBlogCreate from "../pages/projects/wp-blog/WordPressBlogCreate";
import WordPressConnections from "../pages/projects/wp-blog/WordPressConnections";
import PrivacyPolicy from "../pages/legal/PrivacyPolicy";
import DataDeletion from "../pages/legal/DataDeletion";
import LogoDesign from "../pages/projects/LogoDesign";
import LogoDesignStrategist from "../pages/projects/LogoDesignStrategist";
import LogoDesignQuiz from "../pages/projects/LogoDesignQuiz";
import AIManager from "../pages/AIManager";
import AIVideoProduction from "../pages/projects/AIVideoProduction";
import UGCAdsForm from "../pages/projects/UGCAdsForm";
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

// Opt into React Router v7 behavior now to silence the two future-flag
// warnings that surface in the dev console. Both are safe to enable
// today on v6.
const ROUTER_FUTURE = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

const AppRoutes = () => {
  return (
    <Router future={ROUTER_FUTURE}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<Authentication />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signup/onboarding" element={<OnboardingFlow />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-password/sent" element={<ForgotPasswordSent />} />

        {/* Public legal pages. Must NOT be wrapped in <ProtectedRoute> —
            Meta and Google reviewers crawl these without logging in. */}
        <Route path="/legal/privacy" element={<PrivacyPolicy />} />
        <Route path="/legal/data-deletion" element={<DataDeletion />} />

        {/* Onboarding-flow create project (keep separate from portal "New Projects") */}
        <Route path="/create-project" element={<CreateProjectSelection />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={withLayout(Home)} />
          <Route path="/dashboard" element={withLayout(Dashboard)} />
          <Route path="/ai-manager" element={withLayout(AIManager)} />

          {/* Portal "New Projects" — service catalog */}
          <Route path="/new-projects" element={withLayout(NewProject)} />
          <Route path="/new-projects/branding-design" element={withLayout(BrandingDesign)} />

          {/* Branding & Design tool agents (placeholders until each is built) */}
          <Route path="/new-projects/branding-design/logo" element={withLayout(LogoDesign)} />
          <Route path="/new-projects/branding-design/logo/strategist" element={withLayout(LogoDesignStrategist)} />
          <Route path="/new-projects/branding-design/logo/quiz" element={withLayout(LogoDesignQuiz)} />
          <Route path="/new-projects/branding-design/brand-guidelines" element={withLayout(BrandGuidelines)} />
          <Route path="/new-projects/branding-design/brand-guidelines/strategist" element={withLayout(BrandGuidelinesStrategist)} />
          <Route path="/new-projects/branding-design/brand-guidelines/quiz" element={withLayout(BrandGuidelinesQuiz)} />
          <Route path="/new-projects/branding-design/printing" element={withLayout(PrintingDesign)} />
          <Route path="/new-projects/branding-design/printing/strategist" element={withLayout(PrintingDesignStrategist)} />
          <Route path="/new-projects/branding-design/printing/quiz" element={withLayout(PrintingDesignQuiz)} />
          <Route path="/new-projects/branding-design/rebranding" element={withLayout(RebrandingForm)} />
          <Route path="/new-projects/branding-design/packaging" element={withLayout(PackagingDesign)} />
          <Route path="/new-projects/branding-design/packaging/strategist" element={withLayout(PackagingDesignStrategist)} />
          <Route path="/new-projects/branding-design/packaging/quiz" element={withLayout(PackagingDesignQuiz)} />
          <Route path="/new-projects/branding-design/ecommerce-mockups" element={withLayout(EcommerceMockups)} />
          <Route path="/new-projects/branding-design/ecommerce-mockups/strategist" element={withLayout(EcommerceMockupsStrategist)} />
          <Route path="/new-projects/branding-design/ecommerce-mockups/quiz" element={withLayout(EcommerceMockupsQuiz)} />

          {/* Other 7 domain expert agents (placeholders) */}
          <Route path="/new-projects/web-solutions" element={withLayout(ComingSoon, { title: "Web Solutions", description: "Website development, e-commerce, landing pages, SEO, web apps and remodels. Coming soon." })} />
          <Route path="/new-projects/marketing" element={withLayout(ComingSoon, { title: "Marketing Consulting", description: "Strategy, positioning and growth playbooks. Coming soon." })} />
          <Route path="/new-projects/social" element={withLayout(SocialMediaHub)} />
          <Route path="/new-projects/social/create" element={withLayout(SocialMediaCreate)} />
          <Route path="/new-projects/social/connections" element={withLayout(SocialConnections)} />
          <Route path="/new-projects/email" element={withLayout(ComingSoon, { title: "Email Marketing", description: "Lifecycle automations, broadcasts and template design. Coming soon." })} />
          <Route path="/new-projects/campaigns" element={withLayout(ComingSoon, { title: "B2B & B2C Campaigns", description: "Multi-channel campaign strategy and creative. Coming soon." })} />
          <Route path="/new-projects/ai-integrations" element={withLayout(AIIntegrations)} />
          <Route path="/new-projects/ai-integrations/shopify-blog" element={withLayout(BlogEngineHub)} />
          <Route path="/new-projects/ai-integrations/shopify-blog/create" element={withLayout(BlogEngineCreate)} />
          <Route path="/new-projects/ai-integrations/shopify-blog/connections" element={withLayout(ShopifyConnections)} />
          <Route path="/new-projects/ai-integrations/wp-blog" element={withLayout(WordPressBlogHub)} />
          <Route path="/new-projects/ai-integrations/wp-blog/create" element={withLayout(WordPressBlogCreate)} />
          <Route path="/new-projects/ai-integrations/wp-blog/connections" element={withLayout(WordPressConnections)} />
          <Route path="/new-projects/video" element={withLayout(AIVideoProduction)} />
          <Route path="/new-projects/video/ugc-ads" element={withLayout(UGCAdsForm)} />

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
