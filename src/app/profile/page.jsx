"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import RegionRealmSelector from "@/components/RegionRealmSelector";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [region, setRegion] = useState("");
  const [realm, setRealm] = useState("");
  const [initialRegion, setInitialRegion] = useState("");
  const [initialRealm, setInitialRealm] = useState("");
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session) {
      const r = session.user.region || "us";
      const rl = session.user.realm || "stormrage";
      console.log("Session loaded:", r, rl); // 🔍 Debug log
      setRegion(r);
      setRealm(rl);
      setInitialRegion(r);
      setInitialRealm(rl);
      setInitialLoaded(true);
    }
  }, [session]);

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    if (!region || !realm) {
      setMessage("Please select both region and realm.");
      toast.error("Missing region or realm");
      return;
    }
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

      await update({ region, realm });
      setInitialRegion(region);
      setInitialRealm(realm);

      // Force refresh of session data (optional)
      router.refresh();

      toast.success("Settings saved successfully!");
    } catch (error) {
      setMessage(error.message);
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges =
    initialLoaded && (region !== initialRegion || realm !== initialRealm);

  if (status === "loading") return <p>Loading profile...</p>;
  if (status === "unauthenticated") {
    router.push("/");
    console.log("initialLoaded:", initialLoaded);
    console.log("region:", region, "initialRegion:", initialRegion);
    console.log("realm:", realm, "initialRealm:", initialRealm);
    console.log("hasChanges:", hasChanges);
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
        <div className="glass-panel profile-card wow-settings-card">
          <h3 className="section-subtitle">WoW Game Settings</h3>
          <form onSubmit={handleSettingsSubmit}>
            <RegionRealmSelector
              defaultRegion={region}
              defaultRealm={realm}
              onChange={({ region, realm }) => {
                setRegion(region);
                setRealm(realm);
              }}
            />

            <button
              type="submit"
              className="form-button"
              disabled={isLoading /* remove || !hasChanges for testing */}
            >
              {isLoading ? "Saving..." : "Save Settings"}
            </button>
            {message && (
              <p className="form-message success-message">{message}</p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
