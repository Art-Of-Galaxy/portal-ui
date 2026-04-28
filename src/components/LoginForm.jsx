import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "./auth/AuthShell";
import { authAppearance } from "../config/authAppearance";
import { loginUser } from "../redux/authSlice";
import {
  getOnboardingProgress,
  setCurrentOnboardingUser,
} from "../utils/onboardingProgress";

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      const pendingOnboarding = getOnboardingProgress(localStorage.getItem("user_email"));
      if (pendingOnboarding?.step) {
        navigate(`/signup/onboarding?step=${pendingOnboarding.step}`, { replace: true });
        return;
      }
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const response = await dispatch(loginUser({ email, password })).unwrap();
      if (response?.status && response?.token) {
        const resolvedEmail = response?.user?.email || email;
        setCurrentOnboardingUser(resolvedEmail);
        const pendingOnboarding = getOnboardingProgress(resolvedEmail);

        if (pendingOnboarding?.step) {
          navigate(`/signup/onboarding?step=${pendingOnboarding.step}`);
        } else {
          navigate("/home");
        }
      } else {
        setError("Invalid credentials. Please check your email and password.");
      }
    } catch (err) {
      setError(typeof err === "string" ? err : err?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRedirect = () => {
    const API_URL = import.meta.env.VITE_PUBLIC_API_URL;
    window.location.href = `${API_URL}/authentication/google`;
  };

  return (
    <AuthShell>
      <div className="auth-form-wrapper">
        <h1 className="auth-title">Sign in</h1>

        <button
          type="button"
          className="auth-google-btn"
          onClick={handleGoogleRedirect}
          disabled={loading}
        >
          <img
            src={authAppearance.icons.google}
            alt="Google"
            className="auth-google-icon"
          />
          <span>Continue with Google</span>
        </button>

        <div className="auth-separator">or</div>

        <form className="auth-form-wrapper" onSubmit={handleSubmit}>
          {error ? <p className="auth-error">{error}</p> : null}

          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Enter your email"
            className="auth-field"
            disabled={loading}
          />

          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            className="auth-field"
            disabled={loading}
          />

          <Link to="/forgot-password" className="auth-link-btn">
            Forgot your password
          </Link>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="auth-switch">
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </div>
    </AuthShell>
  );
};

export default LoginForm;
