// aszunalol/aszuna-gold-helper/AsZuna-gold-helper-e7b64661f52d01644dc7d7dea50098deeb640633/src/app/profile/page.jsx

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [region, setRegion] = useState("");
  const [realm, setRealm] = useState("");
  const [realmsList, setRealmsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Pre-fill the form with user's saved settings
  useEffect(() => {
    if (session) {
      setRegion(session.user.region || "us");
      setRealm(session.user.realm || "");
    }
  }, [session]);

  // Fetch a new list of realms whenever the selected region changes
  useEffect(() => {
    if (!region) return;

    const fetchRealms = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/blizzard/realms?region=${region}`);
        if (!response.ok) {
          throw new Error("Failed to fetch realms list.");
        }
        const data = await response.json();
        setRealmsList(data);
      } catch (error) {
        console.error("Failed to fetch realms list", error);
        setMessage("Error loading realms. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealms();
  }, [region]);

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, realm }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save settings.");
      }

      // This updates the session object with the new data
      await update({ region, realm });
      setMessage("Settings saved successfully!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordLoading(true);

    if (newPassword.length <= 6) {
      setPasswordMessage("Password must be longer than 6 characters.");
      setPasswordLoading(false);
      return;
    }

    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharRegex.test(newPassword)) {
      setPasswordMessage(
        "Password must contain at least one special character."
      );
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage("New passwords do not match.");
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password.");
      }

      setPasswordMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      setPasswordMessage(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (status === "loading") {
    return <p>Loading profile...</p>;
  }

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  return (
    <main className="page-container">
      <h2 className="profile-main-title">Your Profile</h2>

      {session?.user && (
        <div className="glass-panel profile-card profile-header-card">
          <h3 className="section-subtitle">Account Information</h3>
          <p>
            <strong>Username:</strong> {session.user.name}
          </p>
          <p>
            <strong>Email:</strong> {session.user.email}
          </p>
          <p>
            <strong>Role:</strong> {session.user.role}
          </p>
        </div>
      )}

      <div className="profile-body-grid">
        {" "}
        {/* New grid for WoW settings & Password Change */}
        <div className="glass-panel profile-card wow-settings-card">
          <h3 className="section-subtitle">WoW Game Settings</h3>
          <form onSubmit={handleSettingsSubmit}>
            <div className="form-group">
              <label htmlFor="region-select">Region</label>
              <select
                id="region-select"
                className="select-field"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="us">North America</option>
                <option value="eu">Europe</option>
                <option value="kr">Korea</option>
                <option value="tw">Taiwan</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="realm-select">Realm</label>
              <select
                id="realm-select"
                className="select-field"
                value={realm}
                onChange={(e) => setRealm(e.target.value)}
                disabled={isLoading || realmsList.length === 0}
              >
                <option value="">
                  {isLoading ? "Loading realms..." : "Select a realm"}
                </option>
                {realmsList.map((r) => (
                  <option key={r.slug} value={r.slug}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="form-button" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Settings"}
            </button>

            {message && (
              <p className="form-message success-message">{message}</p>
            )}
          </form>
        </div>
        <div className="glass-panel profile-card password-change-card">
          <h3 className="section-subtitle">Change Password</h3>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label htmlFor="current-password">Current Password</label>
              <input
                type="password"
                id="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-new-password">Confirm New Password</label>
              <input
                type="password"
                id="confirm-new-password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="form-button secondary"
              disabled={passwordLoading}
            >
              {passwordLoading ? "Changing..." : "Change Password"}
            </button>

            {passwordMessage && (
              <p className="error-message">{passwordMessage}</p>
            )}
          </form>
        </div>
      </div>

      <div className="glass-panel profile-card favorites-card">
        <h3 className="section-subtitle">Favorite Routes/Guides</h3>
        <p className="empty-favorites-message">
          You haven't marked any favorite routes or guides yet.
        </p>
        {/* Future: Add logic to display favorite routes/guides here */}
      </div>
    </main>
  );
}
