import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthShell from "../../components/auth/AuthShell";
import PasswordField from "../../components/auth/PasswordField";
import { authAppearance } from "../../config/authAppearance";
import { signUpUser } from "../../redux/signUpSlice";

const SignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromURL = searchParams.get("email");
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Mirror of LoginForm: only show Google CTA when the backend confirms
  // OAuth is configured.
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [providerCheckDone, setProviderCheckDone] = useState(false);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_PUBLIC_API_URL;
    if (!API_URL) { setProviderCheckDone(true); return; }
    let cancelled = false;
    fetch(`${API_URL}/authentication/status`, { credentials: "omit" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (cancelled) return;
        setGoogleEnabled(Boolean(data?.providers?.google));
      })
      .catch(() => { /* keep button hidden on failure */ })
      .finally(() => { if (!cancelled) setProviderCheckDone(true); });
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email") || emailFromURL;
    const password = formData.get("password");

    try {
      const response = await dispatch(signUpUser({ name, email, password })).unwrap();
      if (response?.login?.status) {
        navigate("/signup/onboarding");
      }
    } catch (err) {
      setError(typeof err === "string" ? err : err?.message || "Unable to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRedirect = () => {
    const API_URL = import.meta.env.VITE_PUBLIC_API_URL;
    // mode=signup tells the backend callback to refuse existing emails
    // (we send them to a "you already have an account, sign in?" screen
    // instead of treating it as a silent login).
    window.location.href = `${API_URL}/authentication/google?mode=signup`;
  };

  return (
    <AuthShell>
      <div className="auth-form-wrapper">
        <h1 className="auth-title">Sign up</h1>

        {providerCheckDone && googleEnabled ? (
          <>
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
          </>
        ) : null}

        <form className="auth-form-wrapper" onSubmit={handleSubmit}>
          {error ? <p className="auth-error">{error}</p> : null}

          <input
            name="name"
            type="text"
            required
            placeholder="Enter your full name"
            className="auth-field"
            disabled={loading}
          />

          <input
            name="email"
            type="email"
            required
            placeholder="Enter your email"
            defaultValue={emailFromURL || ""}
            autoComplete="email"
            className="auth-field"
            disabled={loading}
          />

          <PasswordField
            name="password"
            autoComplete="new-password"
            placeholder="Create your password"
            disabled={loading}
          />

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </AuthShell>
  );
};

export default SignUp;
