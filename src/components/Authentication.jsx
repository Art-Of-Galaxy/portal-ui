import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  getOnboardingProgress,
  setCurrentOnboardingUser,
} from "../utils/onboardingProgress";

const Authentication = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      setLoading(false);
      setStatus("No token provided.");
      return;
    }

    const verifyAuthToken = async () => {
      try {
        const API_URL = import.meta.env.VITE_PUBLIC_API_URL;
        const redirecturl = `${API_URL}/authentication/authenticate`;
        const response = await axios.post(redirecturl, { token });

        if (response.data?.status) {
          setStatus("Login successful! Redirecting...");
          localStorage.setItem("accessToken", token);

          if (response.data?.user?.name) {
            localStorage.setItem("user_name", response.data.user.name);
          }

          const resolvedEmail = response.data?.user?.email;
          if (resolvedEmail) {
            localStorage.setItem("user_email", resolvedEmail);
            setCurrentOnboardingUser(resolvedEmail);
          }

          setTimeout(() => {
            const pendingOnboarding = getOnboardingProgress(resolvedEmail);
            if (pendingOnboarding?.step) {
              navigate(`/signup/onboarding?step=${pendingOnboarding.step}`);
              return;
            }

            navigate("/home");
          }, 1500);
        } else {
          setStatus("Token is invalid.");
        }
      } catch (error) {
        console.error("Auth error:", error);
        setStatus("Error verifying token.");
      } finally {
        setLoading(false);
      }
    };

    verifyAuthToken();
  }, [navigate]);

  return (
    <div style={styles.container}>
      {loading ? (
        <div style={styles.loaderWrapper}>
          <div style={styles.loader} />
          <p style={styles.loadingText}>Authenticating...</p>
        </div>
      ) : (
        <p>{status}</p>
      )}
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f9f9f9",
  },
  loaderWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  loader: {
    border: "6px solid #f3f3f3",
    borderTop: "6px solid #3498db",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "20px",
    fontSize: "16px",
    color: "#333",
  },
};

const styleSheet = document.styleSheets[0];
const keyframes =
  `@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }`;
styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

export default Authentication;
