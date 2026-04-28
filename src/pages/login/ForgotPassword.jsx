import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OnboardingShell from "../../components/auth/OnboardingShell";
import { authAppearance } from "../../config/authAppearance";
import onboardingFormBG from "../../assets/OnboardingFormBG.png";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/forgot-password/sent", { state: { email } });
  };

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
          Having trouble logging in? Enter your email below and we send you a link to reset it.
        </p>

        <form onSubmit={handleSubmit} className="forgot-form">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button type="submit" className="onboard-next-btn">
            Send password reset link
          </button>
        </form>

        <p className="forgot-switch">
          Remembered your password? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </OnboardingShell>
  );
}
