import { Link, useLocation } from "react-router-dom";
import OnboardingShell from "../../components/auth/OnboardingShell";
import { authAppearance } from "../../config/authAppearance";
import onboardingFormBG from "../../assets/OnboardingFormBG.png";

export default function ForgotPasswordSent() {
  const location = useLocation();
  const email = location.state?.email || "your email address";

  return (
    <OnboardingShell
      backgroundImageSrc={onboardingFormBG}
      backgroundImageAlt="Onboarding form background"
    >
      <section className="forgot-card">
        {authAppearance.logoSrc ? (
          <img src={authAppearance.logoSrc} alt={authAppearance.brandName} className="forgot-logo" />
        ) : null}
        <h1>Reset password</h1>
        <p>
          We sent a password reset link to <strong>{email}</strong>. Check your inbox and click the
          link to reset your password.
        </p>
        <div className="forgot-divider" />
        <p className="forgot-switch">
          Didn&apos;t get a link? <Link to="/forgot-password">Send again</Link>
        </p>
      </section>
    </OnboardingShell>
  );
}
