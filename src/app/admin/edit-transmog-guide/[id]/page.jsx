// src/app/admin/edit-transmog-guide/[id]/page.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import styles from "../../create-transmog-guide/transmogGuide.module.css";
import { Save } from "lucide-react";

// Dynamic imports
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

export default function EditTransmogGuidePage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: session, status: sessionStatus } = useSession();
  const [formState, setFormState] = useState({
    title: "",
    expansion: "",
    guide_type: "Raid",
    description: "",
    gold_sessions: [],
    thumbnail_url: "",
    recommended_addons: [],
    items_of_note: [],
    macro_string: "",
    tags: ["transmog"],
    status: "DRAFT",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchGuideData = async () => {
        try {
          const response = await fetch(`/api/guides/${id}`);
          if (!response.ok) throw new Error("Failed to fetch guide data.");
          const data = await response.json();
          const parseJSON = (jsonString, defaultValue = []) => {
            try {
              return jsonString ? JSON.parse(jsonString) : defaultValue;
            } catch {
              return defaultValue;
            }
          };
          setFormState({
            ...data,
            gold_sessions: parseJSON(data.gold_sessions),
            recommended_addons: parseJSON(data.recommended_addons),
            items_of_note: parseJSON(data.items_of_note),
            tags: data.tags ? data.tags.split(",") : ["transmog"],
          });
        } catch (err) {
          setError("Could not load guide data: " + err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchGuideData();
    }
  }, [id]);

  const handleStateChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const averageGph = useMemo(() => {
    const sessions = formState.gold_sessions || [];
    if (sessions.length === 0) return 0;
    const totalGold = sessions.reduce((sum, s) => sum + (s.gold || 0), 0);
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
    return totalMinutes > 0 ? Math.round((totalGold / totalMinutes) * 60) : 0;
  }, [formState.gold_sessions]);

  const handleSave = async (newStatus) => {
    if (!formState.title) {
      setError("A title is required.");
      return;
    }
    setSubmitting(true);
    setError("");
    const guideData = {
      ...formState,
      status: newStatus,
      gold_pr_hour: `${averageGph.toLocaleString()} g/hr`,
      items_of_note: JSON.stringify(formState.items_of_note),
      gold_sessions: JSON.stringify(formState.gold_sessions),
      recommended_addons: JSON.stringify(formState.recommended_addons),
      tags: formState.tags.join(","),
    };
    try {
      const response = await fetch(`/api/guides/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guideData),
      });
      if (!response.ok)
        throw new Error(
          (await response.json()).message || "Failed to update guide."
        );
      router.push("/admin/guides-list");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || sessionStatus === "loading")
    return (
      <div className={styles.pageWrapper}>
        <p>Loading editor...</p>
      </div>
    );

  return (
    <div className={styles.pageWrapper}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave("PUBLISHED");
        }}
        className={styles.formContainer}
      >
        <div className={styles.header}>
          <h1>
            Editing Guide:{" "}
            <span className={styles.headerTitle}>
              {formState.title || "..."}
            </span>
          </h1>
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
              {submitting ? "Saving..." : "Publish Changes"}
            </button>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {/* --- Hero Section --- */}
        <div className={styles.heroSection}>
          <div className={styles.heroImageUpload}>
            <label>Guide Thumbnail (16:9)</label>
            <ImageUpload
              imageUrl={formState.thumbnail_url}
              setImageUrl={(val) => handleStateChange("thumbnail_url", val)}
            />
          </div>
          <div className={styles.heroDetails}>
            <div className="form-group">
              <label>Guide Title</label>
              <input
                type="text"
                className={styles.titleInput}
                value={formState.title}
                onChange={(e) => handleStateChange("title", e.target.value)}
                required
              />
            </div>
            <div className={styles.heroMetaGrid}>
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

        {/* --- Main Content Layout --- */}
        <div className={styles.mainLayout}>
          <div className={styles.mainContent}>
            <div className={styles.formSection}>
              <h3 className={styles.sectionHeader}>Guide Description</h3>
              <TiptapEditor
                value={formState.description}
                onChange={(val) => handleStateChange("description", val)}
              />
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
