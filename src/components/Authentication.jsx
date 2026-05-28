import { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertTriangle, Loader2, UserPlus, LogIn } from "lucide-react";
import AuthShell from "./auth/AuthShell";
import {
  getOnboardingProgress,
  setCurrentOnboardingUser,
} from "../utils/onboardingProgress";

// Build a Google OAuth start URL with the right intent. We restart the
// OAuth handshake (rather than just navigating to /signup) so the
// callback knows whether to create an account or sign in.
function googleOauthUrl(mode) {
  const API_URL = import.meta.env.VITE_PUBLIC_API_URL;
  return `${API_URL}/authentication/google?mode=${mode === "signup" ? "signup" : "login"}`;
}

// Auth callback landing page. The Google OAuth callback on the backend
// redirects here with `?status=...` plus supporting params. We:
//   1. Read the status from the URL.
//   2. Store the token + user data when present.
//   3. Render a tailored modern UI for each state.
//   4. Auto-redirect into the app for the happy paths.
//
// Statuses we handle:
//   signed_in       existing user logged in via Google
//   new_account     brand-new user, account just created via Google
//   no_account      tried to "Sign in with Google" but no account exists
//   already_exists  tried to "Sign up with Google" but already have one
//   error           anything else (oauth disabled, missing email, etc.)

const REDIRECT_DELAY_MS = 1400;

export default function Authentication() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const status = params.get("status") || "signed_in";
  const token = params.get("token") || "";
  const email = params.get("email") || "";
  const name = params.get("name") || "";
  const photo = params.get("photo") || "";
  const reason = params.get("reason") || "";

  // One-shot persistence for happy paths.
  const persistedKey = useMemo(
    () => `${status}|${token}|${email}`,
    [status, token, email]
  );

  useEffect(() => {
    if (status !== "signed_in" && status !== "new_account") return undefined;
    if (!token) return undefined;

    try {
      localStorage.setItem("accessToken", token);
      if (email) {
        localStorage.setItem("user_email", email);
        setCurrentOnboardingUser(email);
      }
      if (name) localStorage.setItem("user_name", name);
      if (photo) {
        localStorage.setItem("profile_photo_url", photo);
      } else {
        localStorage.removeItem("profile_photo_url");
      }
    } catch {
      /* localStorage may be unavailable in private mode; ignore */
    }

    const timeout = setTimeout(() => {
      if (status === "new_account") {
        // Brand-new account: send straight into the onboarding flow.
        navigate("/signup/onboarding?step=1", { replace: true });
        return;
      }
      // Returning user: respect any in-progress onboarding step.
      const pending = getOnboardingProgress(email);
      if (pending?.step) {
        navigate(`/signup/onboarding?step=${pending.step}`, { replace: true });
        return;
      }
      navigate("/home", { replace: true });
    }, REDIRECT_DELAY_MS);

    return () => clearTimeout(timeout);
    // persistedKey is the change signal we actually want to react to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistedKey]);

  return (
    <AuthShell>
      <div className="auth-form-wrapper">
        <div className="auth-callback-card">
          <CallbackBody
            status={status}
            email={email}
            name={name}
            reason={reason}
            onSignInInstead={() => navigate("/login", { replace: true })}
            onSignUpInstead={() => navigate("/signup", { replace: true })}
          />
        </div>
      </div>
    </AuthShell>
  );
}

function CallbackBody({ status, email, name, reason, onSignInInstead, onSignUpInstead }) {
  if (status === "signed_in") {
    return (
      <StatusCard
        tone="success"
        icon={<CheckCircle2 size={36} />}
        title={name ? `Welcome back, ${friendlyFirstName(name)}` : "Welcome back"}
        body="You're signed in. Taking you to your dashboard..."
        loader
      />
    );
  }

  if (status === "new_account") {
    return (
      <StatusCard
        tone="success"
        icon={<CheckCircle2 size={36} />}
        title="Account created"
        body="Let's set up your profile so we can tailor the portal to your business."
        loader
      />
    );
  }

  if (status === "no_account") {
    return (
      <StatusCard
        tone="warn"
        icon={<UserPlus size={36} />}
        title="We couldn't find an account"
        body={
          email
            ? `${email} isn't registered with AOG yet. Want to sign up with Google instead?`
            : "That Google account isn't registered with AOG yet. Want to sign up first?"
        }
      >
        <div className="auth-callback-actions">
          {/* Restart OAuth in signup mode rather than dropping the user
              on the email/password signup form. Google usually skips
              the account picker on the second hop, so this lands them
              straight in the new-account onboarding flow. */}
          <a className="auth-callback-btn is-primary" href={googleOauthUrl("signup")}>
            <UserPlus size={16} /> Sign up with Google
          </a>
          <button type="button" className="auth-callback-btn is-ghost" onClick={onSignUpInstead}>
            Use email instead
          </button>
          <button type="button" className="auth-callback-btn is-ghost" onClick={onSignInInstead}>
            Back to sign in
          </button>
        </div>
      </StatusCard>
    );
  }

  if (status === "already_exists") {
    return (
      <StatusCard
        tone="info"
        icon={<LogIn size={36} />}
        title="You already have an account"
        body={
          email
            ? `${email} is already registered. Sign in with Google instead to continue.`
            : "An account already exists for that Google email. Sign in with Google to continue."
        }
      >
        <div className="auth-callback-actions">
          {/* Symmetric to the signup case: restart OAuth in login mode
              so the user lands in the app instead of being bounced back
              to the login page to click Google again. */}
          <a className="auth-callback-btn is-primary" href={googleOauthUrl("login")}>
            <LogIn size={16} /> Sign in with Google
          </a>
          <button type="button" className="auth-callback-btn is-ghost" onClick={onSignInInstead}>
            Use email instead
          </button>
          <button type="button" className="auth-callback-btn is-ghost" onClick={onSignUpInstead}>
            Back to sign up
          </button>
        </div>
      </StatusCard>
    );
  }

  // status === "error" (or unknown)
  return (
    <StatusCard
      tone="error"
      icon={<AlertTriangle size={36} />}
      title="Something went wrong"
      body={errorMessageFor(reason)}
    >
      <div className="auth-callback-actions">
        <button type="button" className="auth-callback-btn is-primary" onClick={onSignInInstead}>
          Back to sign in
        </button>
      </div>
    </StatusCard>
  );
}

function StatusCard({ tone, icon, title, body, children, loader }) {
  return (
    <div className={`auth-callback-status is-${tone}`}>
      <span className="auth-callback-icon">{icon}</span>
      <h2 className="auth-callback-title">{title}</h2>
      <p className="auth-callback-body">{body}</p>
      {loader ? (
        <div className="auth-callback-loader">
          <Loader2 size={14} className="auth-callback-spin" /> Redirecting...
        </div>
      ) : null}
      {children}
    </div>
  );
}

function friendlyFirstName(full) {
  return String(full).trim().split(/\s+/)[0] || full;
}

CallbackBody.propTypes = {
  status: PropTypes.string.isRequired,
  email: PropTypes.string,
  name: PropTypes.string,
  reason: PropTypes.string,
  onSignInInstead: PropTypes.func.isRequired,
  onSignUpInstead: PropTypes.func.isRequired,
};

StatusCard.propTypes = {
  tone: PropTypes.oneOf(["success", "warn", "info", "error"]).isRequired,
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  children: PropTypes.node,
  loader: PropTypes.bool,
};

function errorMessageFor(reason) {
  switch (reason) {
    case "oauth_disabled":
      return "Google sign-in isn't configured on this environment yet. Use email and password for now.";
    case "missing_email":
      return "Google didn't share your email address with us, so we can't continue. Please try again or use email sign-in.";
    case "google_failed":
      return "We couldn't complete the Google sign-in. Please try again.";
    case "server_error":
      return "We hit a snag finishing your sign-in. Please try again in a moment.";
    default:
      return "We couldn't finish signing you in. Please try again.";
  }
}
