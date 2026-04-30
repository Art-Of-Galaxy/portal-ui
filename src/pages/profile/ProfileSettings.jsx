import { useEffect, useMemo, useState } from "react";
import { Camera, KeyRound, Save, User } from "lucide-react";
import { apiServices } from "../../services/apiServices";

const initialProfile = {
  name: "",
  email: "",
  phone: "",
  dob: "",
  profile_photo_url: "",
};

function getInitials(name, email) {
  const source = String(name || email || "User");
  return source
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";
}

function normalizeProfile(rawProfile = {}) {
  return {
    ...initialProfile,
    ...rawProfile,
    name: rawProfile.name || "",
    email: rawProfile.email || "",
    phone: rawProfile.phone || "",
    dob: rawProfile.dob ? String(rawProfile.dob).slice(0, 10) : "",
    profile_photo_url: rawProfile.profile_photo_url || "",
  };
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export default function ProfileSettings() {
  const [profile, setProfile] = useState(initialProfile);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const initials = useMemo(() => getInitials(profile.name, profile.email), [profile]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiServices.get_profile();
        if (cancelled) return;
        const nextProfile = res?.profile || {};
        setProfile(normalizeProfile(nextProfile));
      } catch (err) {
        if (!cancelled) setError(err?.message || "Unable to load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (key, value) => {
    setProfile((previous) => ({ ...previous, [key]: value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      update("profile_photo_url", String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        name: cleanString(profile.name),
        phone: cleanString(profile.phone) || null,
        dob: profile.dob || null,
        profile_photo_url: profile.profile_photo_url || null,
      };
      const res = await apiServices.update_profile(payload);
      const updated = res?.profile || {};
      setProfile(normalizeProfile(updated));
      if (updated.name) localStorage.setItem("user_name", updated.name);
      if (updated.profile_photo_url) {
        localStorage.setItem("profile_photo_url", updated.profile_photo_url);
      } else {
        localStorage.removeItem("profile_photo_url");
      }
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err?.message || "Unable to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setSavingPassword(true);
    setError("");
    setMessage("");
    try {
      if (newPassword !== confirmPassword) {
        throw new Error("New password and confirmation do not match.");
      }
      if (newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters.");
      }
      await apiServices.update_password({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password updated successfully.");
    } catch (err) {
      setError(err?.message || "Unable to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="portal-page">
        <p className="portal-card-copy">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <div>
          <h1 className="portal-page-title">Profile Settings</h1>
          <p className="portal-card-copy" style={{ marginTop: 4 }}>
            Manage your account details, profile photo, and password.
          </p>
        </div>
      </div>

      {message ? <div className="profile-alert profile-alert-success">{message}</div> : null}
      {error ? <div className="profile-alert profile-alert-error">{error}</div> : null}

      <div className="profile-settings-grid">
        <form className="portal-card profile-settings-card" onSubmit={saveProfile}>
          <div className="profile-settings-section-head">
            <User size={18} />
            <h2>Basic Details</h2>
          </div>

          <div className="profile-photo-row">
            <div className="profile-photo-preview">
              {profile.profile_photo_url ? (
                <img src={profile.profile_photo_url} alt="Profile" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <label className="profile-photo-upload">
              <Camera size={14} />
              Update photo
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
            </label>
          </div>

          <label className="profile-field">
            <span>Name</span>
            <input value={profile.name || ""} onChange={(e) => update("name", e.target.value)} required />
          </label>

          <label className="profile-field">
            <span>Email</span>
            <input value={profile.email || ""} disabled />
          </label>

          <label className="profile-field">
            <span>Phone</span>
            <input value={profile.phone || ""} onChange={(e) => update("phone", e.target.value)} />
          </label>

          <label className="profile-field">
            <span>Date of birth</span>
            <input type="date" value={profile.dob || ""} onChange={(e) => update("dob", e.target.value)} />
          </label>

          <button type="submit" className="portal-cta" disabled={savingProfile}>
            <Save size={16} />
            {savingProfile ? "Saving..." : "Save profile"}
          </button>
        </form>

        <form className="portal-card profile-settings-card" onSubmit={savePassword}>
          <div className="profile-settings-section-head">
            <KeyRound size={18} />
            <h2>Password</h2>
          </div>

          <label className="profile-field">
            <span>Current password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          <label className="profile-field">
            <span>New password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>

          <label className="profile-field">
            <span>Confirm new password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>

          <button type="submit" className="portal-cta" disabled={savingPassword}>
            <KeyRound size={16} />
            {savingPassword ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
