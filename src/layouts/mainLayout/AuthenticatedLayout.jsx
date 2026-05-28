import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Sidebar } from "../../components/Sidebar";
import { Header } from "../../components/header";
import GlobalStrategistDock from "../../components/strategist/GlobalStrategistDock";
import { apiServices } from "../../services/apiServices";

export function AuthenticatedLayout({ children }) {
  const [profileVersion, setProfileVersion] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const email = localStorage.getItem("user_email");
    if (!token || !email) return undefined;

    // Skip the fetch only when we already have every cached field the
    // shell consumes (avatar, name, AND the admin flag). Older sessions
    // were caching photo+name but never is_admin, which is why the
    // Sidebar fell back to a hardcoded "Admin" badge for normal users.
    const hasAll =
      localStorage.getItem("profile_photo_url") !== null &&
      localStorage.getItem("user_name") &&
      localStorage.getItem("user_is_admin") !== null;
    if (hasAll) return undefined;

    let cancelled = false;
    (async () => {
      try {
        const res = await apiServices.get_profile();
        if (cancelled) return;
        const profile = res?.profile;
        if (!profile) return;
        if (profile.profile_photo_url) {
          localStorage.setItem("profile_photo_url", profile.profile_photo_url);
        }
        if (profile.name) {
          localStorage.setItem("user_name", profile.name);
        }
        // Persist is_admin so the Sidebar role badge reflects real state
        // (default false when the backend doesn't return the flag).
        localStorage.setItem("user_is_admin", profile.is_admin ? "true" : "false");
        setProfileVersion((v) => v + 1);
      } catch {
        /* silent — header/sidebar fall back to initials */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="portal-shell" data-profile-version={profileVersion}>
      <Sidebar />
      <div className="portal-main-area">
        <Header />
        <main className="portal-main-content">{children}</main>
      </div>
      <GlobalStrategistDock />
    </div>
  );
}

AuthenticatedLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
