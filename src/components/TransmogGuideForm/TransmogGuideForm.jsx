"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import styles from "@/app/admin/create-transmog-guide/transmogGuide.module.css";
import { Save } from "lucide-react";

// Dynamic imports
const TiptapEditor = dynamic(
  () => import("@/components/TiptapEditor/TiptapEditor"),
  { ssr: false }
);
const StepManager = dynamic(
  () => import("@/components/StepManager/StepManager"),
  { ssr: false }
);
import TagInput from "@/components/TagInput/TagInput";
import ExpansionSelect from "@/components/ExpansionSelect/ExpansionSelect";
import CategorySelect from "@/components/CategorySelect/CategorySelect";
import GoldInput from "@/components/GoldInput/GoldInput";
import TimeInput from "@/components/TimeInput/TimeInput";
import ImageUpload from "@/components/ImageUpload/ImageUpload";
import ImageSliderManager from "@/components/ImageSliderManager/ImageSliderManager";
import ListManager from "@/components/ListManager/ListManager";
import ItemsOfNoteManager from "@/components/ItemsOfNoteManager/ItemsOfNoteManager";
import StringImportManager from "@/components/StringImportManager/StringImportManager";
import RouteManager from "@/components/RouteManager/RouteManager";

export default function GuideForm({
  initialData,
  onSave,
  isEditing,
  submitting,
}) {
  const { data: session } = useSession();
  const [formState, setFormState] = useState(initialData);

  useEffect(() => {
    setFormState(initialData);
  }, [initialData]);

  const handleStateChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: typeof value === "function" ? value(prev[field]) : value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSave(formState, "PUBLISHED");
  };

  const handleDraftSave = () => {
    onSave(formState, "DRAFT");
  };

  return (
    <form onSubmit={handleFormSubmit} className={styles.formContainer}>
      <div className={styles.header}>
        <h1>
          {isEditing ? "Editing Guide: " : "Create New Farming/Gold Guide"}
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

      <div className={styles.mainLayout}>
        <div className={styles.mainContent}>
          <div className={styles.formSection}>
            <h3 className={styles.sectionHeader}>Basic Information</h3>
            <div className="form-group">
              <label>Guide Title</label>
              <input
                type="text"
                value={formState.title}
                onChange={(e) => handleStateChange("title", e.target.value)}
                required
              />
            </div>
            <div
              className={styles.heroMetaGrid}
              style={{ maxWidth: "100%", marginTop: "1.5rem" }}
            >
              <div className="form-group">
                <label>Category</label>
                <CategorySelect
                  selectedCategory={formState.category}
                  setSelectedCategory={(val) =>
                    handleStateChange("category", val)
                  }
                />
              </div>
              <div className="form-group">
                <label>Expansion</label>
                <ExpansionSelect
                  selectedExpansion={formState.expansion}
                  setSelectedExpansion={(val) =>
                    handleStateChange("expansion", val)
                  }
                />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: "1.5rem" }}>
              <label>Tags</label>
              <TagInput
                tags={formState.tags}
                setTags={(val) => handleStateChange("tags", val)}
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <h3 className={styles.sectionHeader}>Guide Content</h3>
            <div className="form-group">
              <label>Description</label>
              <TiptapEditor
                value={formState.description}
                onChange={(val) => handleStateChange("description", val)}
              />
            </div>
            <div className="form-group" style={{ marginTop: "1.5rem" }}>
              <label>Guide Steps</label>
              <StepManager
                steps={formState.steps}
                setSteps={(val) => handleStateChange("steps", val)}
              />
            </div>
          </div>
          <div className={styles.formSection}>
            <h3 className={styles.sectionHeader}>Media</h3>
            <div className={styles.heroMetaGrid}>
              <div className="form-group">
                <label>Guide Thumbnail</label>
                <ImageUpload
                  imageUrl={formState.thumbnail_url}
                  setImageUrl={(val) => handleStateChange("thumbnail_url", val)}
                />
              </div>
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
            <div className="form-group" style={{ marginTop: "1.5rem" }}>
              <label>Image Slider</label>
              <ImageSliderManager
                images={formState.slider_images}
                setImages={(val) => handleStateChange("slider_images", val)}
              />
            </div>
          </div>
        </div>
        <div className={styles.sidebar}>
          <div className={styles.formSection}>
            <h3 className={styles.sectionHeader}>Performance</h3>
            <div className="form-group">
              <label>Gold Per Hour</label>
              <GoldInput
                value={formState.gold_pr_hour}
                onChange={(val) => handleStateChange("gold_pr_hour", val)}
              />
            </div>
            <div className="form-group" style={{ marginTop: "1.5rem" }}>
              <label>Time to Complete</label>
              <TimeInput
                value={formState.time_to_complete}
                onChange={(val) => handleStateChange("time_to_complete", val)}
              />
            </div>
          </div>
          <div className={styles.formSection}>
            <h3 className={styles.sectionHeader}>Items & Addons</h3>
            <div className="form-group">
              <label>Items of Note</label>
              <ItemsOfNoteManager
                items={formState.items_of_note}
                setItems={(val) => handleStateChange("items_of_note", val)}
                region={session?.user?.region || "us"}
                realm={session?.user?.realm || "stormrage"}
              />
            </div>
            <div className="form-group" style={{ marginTop: "1.5rem" }}>
              <label>Required Items</label>
              <ListManager
                title=""
                noun="Item"
                items={formState.required_items}
                setItems={(val) => handleStateChange("required_items", val)}
              />
            </div>
            <div className="form-group" style={{ marginTop: "1.5rem" }}>
              <label>Recommended Addons</label>
              <ListManager
                title=""
                noun="Addon"
                items={formState.recommended_addons}
                setItems={(val) => handleStateChange("recommended_addons", val)}
              />
            </div>
          </div>
          <div className={styles.formSection}>
            <h3 className={styles.sectionHeader}>Import Strings</h3>
            <div className="form-group">
              <label>Routes (Routes Addon)</label>
              <RouteManager
                routes={formState.route_strings}
                setRoutes={(val) => handleStateChange("route_strings", val)}
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
        </div>
      </div>
    </form>
  );
}
