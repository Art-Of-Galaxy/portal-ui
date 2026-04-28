import { useSelector } from "react-redux";
import LoginForm from "../../components/LoginForm";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyToken } from "../../helper/AuthHelper";
import { getOnboardingProgress } from "../../utils/onboardingProgress";

const LoginPage = () => {
  const token = useSelector(
    (state) =>
      state.auth.token ||
      state?.user?.token
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      verifyToken(token).then(({ valid }) => {
        if (valid) {
          const pendingOnboarding = getOnboardingProgress(localStorage.getItem("user_email"));
          if (pendingOnboarding?.step) {
            navigate(`/signup/onboarding?step=${pendingOnboarding.step}`, { replace: true });
            return;
          }
          navigate("/home", { replace: true });
        }
      });
    }
  }, [token, navigate]);

  return (
    <>
      <LoginForm />
    </>
  );
};

export default LoginPage;
