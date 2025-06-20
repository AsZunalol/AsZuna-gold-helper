"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import styles from "@/app/admin/create-transmog-guide/transmogGuide.module.css";
import { Save } from "lucide-react";

// Dynamic imports for client-side components to prevent SSR issues
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

export default function TransmogGuideForm({
  initialData,
  onSave,
  isEditing,
  submitting,
}) {
  const { data: session } = useSession();
  const [formState, setFormState] = useState(initialData);

  // Effect to update the form's state if the initial data from the parent page changes
  useEffect(() => {
    setFormState(initialData);
  }, [initialData]);

  // A single, reliable function to update any field in the form's state
  const handleStateChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: typeof value === "function" ? value(prev[field]) : value,
    }));
  };

  // Calculate the average gold per hour based on logged sessions
  const averageGph = useMemo(() => {
    const sessions = formState.gold_sessions || [];
    if (sessions.length === 0) return 0;
    const totalGold = sessions.reduce((sum, s) => sum + (s.gold || 0), 0);
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
    return totalMinutes > 0 ? Math.round((totalGold / totalMinutes) * 60) : 0;
  }, [formState.gold_sessions]);

  // Handle the main form submission (for publishing)
  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSave(formState, averageGph, "PUBLISHED");
  };

  // Handle saving the guide as a draft
  const handleDraftSave = () => {
    onSave(formState, averageGph, "DRAFT");
  };

  return (
    <form onSubmit={handleFormSubmit} className={styles.formContainer}>
      <div className={styles.header}>
        <h1>
          {isEditing ? "Editing Guide: " : "Create New Transmog Guide"}
          {isEditing && (
            <span className={styles.headerTitle}>
              {formState.title || "..."}
            </span>
          )}
        </h1>
        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={handleDraftSave}
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
            {submitting
              ? "Saving..."
              : isEditing
              ? "Publish Changes"
              : "Publish Guide"}
          </button>
        </div>
      </div>

      {/* Hero Section: Visually represents the final guide header */}
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

      {/* Two-Column Layout for Main Content and Sidebar */}
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
                setItems={(val) => handleStateChange("recommended_addons", val)}
              />
            </div>
            <div className="form-group">
              <label>Helpful Macro</label>
              <StringImportManager
                title=""
                stringValue={formState.macro_string}
                setStringValue={(val) => handleStateChange("macro_string", val)}
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
  );
}
