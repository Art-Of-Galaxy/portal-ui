import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Sidebar } from "../../components/Sidebar";
import { Header } from "../../components/header";
import { apiServices } from "../../services/apiServices";

export function AuthenticatedLayout({ children }) {
  const [profileVersion, setProfileVersion] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const email = localStorage.getItem("user_email");
    if (!token || !email) return;
    if (localStorage.getItem("profile_photo_url")) return;

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
    </div>
  );
}

AuthenticatedLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
