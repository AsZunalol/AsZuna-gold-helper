"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import RegionRealmSelector from "@/components/RegionRealmSelector/RegionRealmSelector";
import ChangePasswordModal from "@/components/ChangePasswordModal/ChangePasswordModal";
import { toast } from "react-hot-toast";
import { Eye, KeyRound } from "lucide-react";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [formState, setFormState] = useState({ region: "", realm: "" });
  const [initialState, setInitialState] = useState({ region: "", realm: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("settings");
  const [isEmailVisible, setIsEmailVisible] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);

  const favoriteGuides = []; // Placeholder

  useEffect(() => {
    if (session?.user) {
      const initialData = {
        region: session.user.region || "us",
        realm: session.user.realm || "stormrage",
      };
      setFormState(initialData);
      setInitialState(initialData);
    }
  }, [session]);

  const handleRegionChange = useCallback((newRegion) => {
    setFormState({ region: newRegion, realm: "" });
  }, []);

  const handleRealmChange = useCallback((newRealm) => {
    setFormState((prevState) => ({ ...prevState, realm: newRealm }));
  }, []);

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    if (!formState.region || !formState.realm) {
      toast.error("Please select a region and realm.");
      return;
    }

    const previousInitialState = { ...initialState };

    // **Optimistic UI Update:**
    // Update the UI state immediately, assuming success.
    setInitialState(formState);
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save settings.");
      }

      // Update the session in the background
      await update(formState);

      toast.success("Settings saved successfully!", { duration: 4000 });
    } catch (error) {
      // If the save fails, revert the UI state and show an error.
      setInitialState(previousInitialState);
      toast.error("Failed to save settings: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges =
    formState.region !== initialState.region ||
    formState.realm !== initialState.realm;

  if (status === "loading") return <p>Loading profile...</p>;
  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  return (
    <main className="page-container">
      <div className={styles.profileGrid}>
        <div className={styles.leftColumn}>
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>
              <Image
                src={session.user.imageUrl || "/images/default-avatar.png"}
                alt="User Avatar"
                width={100}
                height={100}
              />
            </div>
            <h2 className={styles.username}>{session.user.name}</h2>
            <div className={styles.userStats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {favoriteGuides.length}
                </span>
                <span className={styles.statLabel}>Favorite Guides</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tabButton} ${
                activeTab === "favorites" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("favorites")}
            >
              Favorite Guides
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "settings" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("settings")}
            >
              Settings
            </button>
          </div>
          <div className={styles.tabContent}>
            {activeTab === "favorites" && (
              <div className={styles.favoritesGrid}>
                <p>Your favorite guides will appear here.</p>
              </div>
            )}
            {activeTab === "settings" && (
              <div className={styles.settingsGrid}>
                <div className={styles.settingsColumn}>
                  <h3 className={styles.sectionSubtitle}>Account Settings</h3>
                  <div className={styles.settingItem}>
                    <div className={styles.settingLabel}>Email Address</div>
                    <div className={styles.settingValue}>
                      {isEmailVisible ? session.user.email : "••••••••••••••"}
                    </div>
                    <button
                      className={styles.settingButton}
                      onClick={() => setIsEmailVisible(!isEmailVisible)}
                    >
                      <Eye size={18} />
                      <span>{isEmailVisible ? "Hide" : "Show"}</span>
                    </button>
                  </div>
                  <div className={styles.settingItem}>
                    <div className={styles.settingLabel}>Password</div>
                    <div className={styles.settingValue}>••••••••</div>
                    <button
                      className={styles.settingButton}
                      onClick={() => setIsChangePasswordModalOpen(true)}
                    >
                      <KeyRound size={18} />
                      <span>Change</span>
                    </button>
                  </div>
                </div>
                <div className={styles.settingsColumn}>
                  <h3 className={styles.sectionSubtitle}>WoW Game Settings</h3>
                  <form onSubmit={handleSettingsSubmit}>
                    <RegionRealmSelector
                      region={formState.region}
                      realm={formState.realm}
                      onRegionChange={handleRegionChange}
                      onRealmChange={handleRealmChange}
                    />
                    <button
                      type="submit"
                      className="form-button"
                      disabled={isLoading || !hasChanges}
                    >
                      {isLoading ? "Saving..." : "Save Settings"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isChangePasswordModalOpen && (
        <ChangePasswordModal
          onClose={() => setIsChangePasswordModalOpen(false)}
        />
      )}
    </main>
  );
}
