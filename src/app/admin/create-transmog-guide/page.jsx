// src/app/admin/create-transmog-guide/page.jsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import styles from "./transmogGuide.module.css";
import {
  PlusCircle,
  Trash2,
  DollarSign,
  Clock,
  Hash,
  Save,
  Eye,
} from "lucide-react";
import { WOW_EXPANSIONS } from "@/lib/constants";

// Dynamically import client-side components to prevent SSR issues
const TiptapEditor = dynamic(
  () => import("@/components/TiptapEditor/TiptapEditor"),
  { ssr: false }
);
import TagInput from "@/components/TagInput/TagInput";
import ExpansionSelect from "@/components/ExpansionSelect/ExpansionSelect";
import ImageUpload from "@/components/ImageUpload/ImageUpload";
import ItemsOfNoteManager from "@/components/ItemsOfNoteManager/ItemsOfNoteManager";
import StringImportManager from "@/components/StringImportManager/StringImportManager";
import ListManager from "@/components/ListManager/ListManager";
import GoldSessionManager from "@/components/GoldSessionManager/GoldSessionManager";
import MapImageUploader from "@/components/MapImageUploader/MapImageUploader";

// --- Main Page Component ---
export default function CreateTransmogGuidePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [formState, setFormState] = useState({
    title: "",
    expansion: "",
    guide_type: "Raid",
    description: "",
    gold_sessions: [],
    thumbnail_url: "",
    map_image_url: "",
    youtube_video_id: "", // Added for the video
    recommended_addons: [],
    items_of_note: [],
    macro_string: "",
    tsm_import_string: "", // Added TSM string state
    tags: ["transmog"],
    status: "DRAFT",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (
      status === "authenticated" &&
      !["ADMIN", "OWNER"].includes(session.user.role)
    ) {
      router.push("/");
    }
  }, [status, session, router]);

  const handleStateChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: typeof value === "function" ? value(prev[field]) : value,
    }));
  };

  const averageGph = useMemo(() => {
    const sessions = formState.gold_sessions || [];
    if (sessions.length === 0) return 0;
    const totalGold = sessions.reduce((sum, s) => sum + (s.gold || 0), 0);
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
    return totalMinutes > 0 ? Math.round((totalGold / totalMinutes) * 60) : 0;
  }, [formState.gold_sessions]);

  const handleSave = async (guideStatus) => {
    if (!formState.title) {
      setError("A title is required to save a draft.");
      return;
    }
    setSubmitting(true);
    setError("");

    const guideData = {
      ...formState,
      category: "Transmog",
      status: guideStatus,
      is_transmog: true,
      gold_pr_hour: `${averageGph.toLocaleString()} g/hr`,
      authorId: session.user.id,
      items_of_note: JSON.stringify(formState.items_of_note),
      gold_sessions: JSON.stringify(formState.gold_sessions),
      recommended_addons: JSON.stringify(formState.recommended_addons),
      tags: formState.tags.join(","),
      // Ensure default empty values for other guide types
      steps: "[]",
      time_to_complete: "",
      required_items: "[]",
      route_string: "",
      slider_images: "[]",
    };

    try {
      const response = await fetch("/api/guides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guideData),
      });
      if (!response.ok)
        throw new Error(
          (await response.json()).message || "Failed to save guide."
        );
      const newGuide = await response.json();
      router.push("/admin/guides-list");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading")
    return (
      <div className={styles.pageWrapper}>
        <p>Loading...</p>
      </div>
    );

  return (
    <div className={styles.pageWrapper}>
      {error && <p className={styles.error}>{error}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave("PUBLISHED");
        }}
        className={styles.formContainer}
      >
        <div className={styles.header}>
          <h1>Create New Transmog Guide</h1>
          <div className={styles.headerActions}>
            <button
              type="button"
              onClick={() => handleSave("DRAFT")}
              className={styles.draftButton}
              disabled={submitting}
            >
              <Save size={16} /> Save as Draft
            </button>
            <button
              type="submit"
              className={styles.publishButton}
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Publish Guide"}
            </button>
          </div>
        </div>

        <div className={styles.editorHero}>
          <div className={styles.editorHeroBackground}>
            <ImageUpload
              imageUrl={formState.thumbnail_url}
              setImageUrl={(val) => handleStateChange("thumbnail_url", val)}
            />
          </div>
          <div className={styles.editorHeroContent}>
            <div className="form-group">
              <label>Guide Title</label>
              <input
                type="text"
                className={styles.editorTitleInput}
                value={formState.title}
                onChange={(e) => handleStateChange("title", e.target.value)}
                required
              />
            </div>
            <div className={styles.editorMetaGrid}>
              <div className="form-group">
                <label>Expansion</label>
                <ExpansionSelect
                  selectedExpansion={formState.expansion}
                  setSelectedExpansion={(val) =>
                    handleStateChange("expansion", val)
                  }
                />
              </div>
              <div className="form-group">
                <label>Content Type</label>
                <select
                  value={formState.guide_type}
                  onChange={(e) =>
                    handleStateChange("guide_type", e.target.value)
                  }
                  className="select-field"
                >
                  <option>Raid</option>
                  <option>Dungeon</option>
                  <option>Open World</option>
                  <option>Crafting</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.mainLayout}>
          <div className={styles.mainContent}>
            <div className={styles.formSection}>
              <h3 className={styles.sectionHeader}>Guide Description</h3>
              <TiptapEditor
                value={formState.description}
                onChange={(val) => handleStateChange("description", val)}
              />
            </div>
            {/* YouTube Video Section */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionHeader}>Media</h3>
              <div className="form-group">
                <label>YouTube Video ID</label>
                <input
                  type="text"
                  placeholder="e.g., dQw4w9WgXcQ"
                  value={formState.youtube_video_id}
                  onChange={(e) =>
                    handleStateChange("youtube_video_id", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
          <div className={styles.sidebar}>
            <div className={styles.formSection}>
              <h3 className={styles.sectionHeader}>Valuable Items</h3>
              <ItemsOfNoteManager
                items={formState.items_of_note}
                setItems={(val) => handleStateChange("items_of_note", val)}
                region={session?.user?.region || "us"}
                realm={session?.user?.realm || "stormrage"}
              />
            </div>
            <div className={styles.formSection}>
              <h3 className={styles.sectionHeader}>Route Map</h3>
              <MapImageUploader
                imageUrl={formState.map_image_url}
                setImageUrl={(val) => handleStateChange("map_image_url", val)}
              />
            </div>
            <div className={styles.formSection}>
              <h3 className={styles.sectionHeader}>Farming Tools</h3>
              <div className="form-group">
                <label>Recommended Addons</label>
                <ListManager
                  title=""
                  noun="Addon"
                  items={formState.recommended_addons}
                  setItems={(val) =>
                    handleStateChange("recommended_addons", val)
                  }
                />
              </div>
              <div className="form-group">
                <label>Helpful Macro</label>
                <StringImportManager
                  title=""
                  stringValue={formState.macro_string}
                  setStringValue={(val) =>
                    handleStateChange("macro_string", val)
                  }
                />
              </div>
              <div className="form-group" style={{ marginTop: "1.5rem" }}>
                <label>TSM Group String</label>
                <StringImportManager
                  title=""
                  stringValue={formState.tsm_import_string}
                  setStringValue={(val) =>
                    handleStateChange("tsm_import_string", val)
                  }
                />
              </div>
            </div>
            <div className={styles.formSection}>
              <h3 className={styles.sectionHeader}>Tags</h3>
              <TagInput
                tags={formState.tags}
                setTags={(val) => handleStateChange("tags", val)}
              />
            </div>
            <div className={styles.formSection}>
              <h3 className={styles.sectionHeader}>Gold Per Hour</h3>
              <GoldSessionManager
                sessions={formState.gold_sessions}
                setSessions={(val) => handleStateChange("gold_sessions", val)}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
