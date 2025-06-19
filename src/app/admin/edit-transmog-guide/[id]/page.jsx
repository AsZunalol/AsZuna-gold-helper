// src/app/admin/edit-transmog-guide/[id]/page.jsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import styles from "../../create-transmog-guide/transmogGuide.module.css";
import { Save, PlusCircle, Trash2, Eye } from "lucide-react";
import { WOW_EXPANSIONS } from "@/lib/constants";

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

// Reusable Gold Per Hour Calculator Component
const GoldSessionManager = ({ sessions, setSessions }) => {
  const [gold, setGold] = useState("");
  const [minutes, setMinutes] = useState("");

  const addSession = () => {
    const goldAmount = parseInt(gold);
    const timeAmount = parseInt(minutes);
    if (goldAmount > 0 && timeAmount > 0) {
      setSessions([
        ...(sessions || []),
        { gold: goldAmount, minutes: timeAmount },
      ]);
      setGold("");
      setMinutes("");
    }
  };

  const removeSession = (index) =>
    setSessions(sessions.filter((_, i) => i !== index));

  const averageGph = useMemo(() => {
    if (!sessions || sessions.length === 0) return 0;
    const totalGold = sessions.reduce((sum, s) => sum + s.gold, 0);
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
    return totalMinutes > 0 ? Math.round((totalGold / totalMinutes) * 60) : 0;
  }, [sessions]);

  return (
    <div className="list-manager">
      <div className={styles.gphInputs}>
        <input
          type="number"
          placeholder="Gold Earned"
          value={gold}
          onChange={(e) => setGold(e.target.value)}
        />
        <input
          type="number"
          placeholder="Minutes Farmed"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
        />
        <button
          type="button"
          onClick={addSession}
          className={styles.addSessionButton}
        >
          <PlusCircle size={16} /> Add Session
        </button>
      </div>
      {sessions && sessions.length > 0 && (
        <div className="managed-list" style={{ marginTop: "1rem" }}>
          {sessions.map((session, index) => (
            <div key={index} className="managed-list-item">
              <div
                className="item-content"
                style={{ flexDirection: "row", gap: "1.5rem" }}
              >
                <span>
                  Session {index + 1}: {session.gold.toLocaleString()} gold in{" "}
                  {session.minutes} mins
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeSession(index)}
                className="step-action-button"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className={styles.gphDisplay}>
        Calculated Average: <span>{averageGph.toLocaleString()} GPH</span>
      </div>
    </div>
  );
};

// --- GUIDE PREVIEW COMPONENT ---
const GuidePreview = ({ guide, averageGph, onClose }) => {
  const expansionInfo = WOW_EXPANSIONS.find(
    (exp) => exp.name === guide.expansion
  );

  // Added state for tag visibility in preview
  const [showAllPreviewTags, setShowAllPreviewTags] = useState(false);
  const allPreviewTags = guide.tags || [];
  const displayedPreviewTags = showAllPreviewTags
    ? allPreviewTags
    : allPreviewTags.slice(0, 3);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: "1200px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--color-background)",
          padding: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="close-modal-button"
          style={{ zIndex: 100, color: "white" }}
        >
          &times;
        </button>
        <div
          className="guide-outer"
          style={{ marginTop: 0, boxShadow: "none", padding: "1rem" }}
        >
          <div className="thumbnail-wrapper" style={{ marginBottom: "1rem" }}>
            <div className="thumbnail-card">
              <Image
                src={guide.thumbnail_url || "/images/default-thumb.jpg"}
                alt="Guide Thumbnail"
                width={1200}
                height={300}
                className="thumbnail-img"
              />
              <div className="thumbnail-overlay-box">
                <div className="thumbnail-overlay-content">
                  <h1 className="guide-title-overlay">
                    {guide.title || "Untitled Guide"}
                  </h1>
                  {expansionInfo && (
                    <p
                      className="guide-expansion"
                      style={{ color: expansionInfo.color }}
                    >
                      Expansion – {guide.expansion}
                    </p>
                  )}
                  {/* Tags with drop-out in preview thumbnail */}
                  {allPreviewTags.length > 0 && (
                    <div
                      className={`tag-list-wrapper ${
                        showAllPreviewTags ? "expanded" : ""
                      }`}
                    >
                      <div className="tags-display">
                        {displayedPreviewTags.map((tag) => (
                          <span key={tag} className="tag-pill">
                            {tag}
                          </span>
                        ))}
                      </div>
                      {!showAllPreviewTags && allPreviewTags.length > 3 && (
                        <div className="tags-fade-overlay"></div>
                      )}
                    </div>
                  )}
                  {allPreviewTags.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setShowAllPreviewTags(!showAllPreviewTags)}
                      className="tags-toggle-button"
                    >
                      {showAllPreviewTags
                        ? "Show Less Tags"
                        : `Show All ${allPreviewTags.length} Tags`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="guide-layout" style={{ padding: "1rem" }}>
            <div className="guide-content">
              <h3>Description</h3>
              <div
                className="prose-mirror-editor"
                dangerouslySetInnerHTML={{
                  __html:
                    guide.description || "<p>No description provided.</p>",
                }}
              />
            </div>
            <aside className="guide-right-panel" style={{ position: "static" }}>
              <div className="map-notes-box">
                <h4>Details</h4>
                <p>
                  <strong>Gold/Hour:</strong> {averageGph.toLocaleString()} g/hr
                </p>
                <p>
                  <strong>Content Type:</strong> {guide.guide_type}
                </p>
                <div style={{ marginTop: "1rem" }}>
                  <strong>Tags:</strong>
                  {/* Tags in sidebar are not truncated in preview */}
                  <div className="tags-display" style={{ marginTop: "0.5rem" }}>
                    {(guide.tags || []).map((tag) => (
                      <span key={tag} className="tag-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {guide.items_of_note && guide.items_of_note.length > 0 && (
                <div className="map-notes-box">
                  <h4>Items of Note</h4>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {guide.items_of_note.map((item, index) => (
                      <li key={`item-${index}`} className="item-list-item">
                        <Image
                          src={
                            item.icon ||
                            "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg"
                          }
                          alt={item.name}
                          width={24}
                          height={24}
                          className="item-icon-small"
                        />
                        <span>{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {guide.recommended_addons &&
                guide.recommended_addons.length > 0 && (
                  <div className="map-notes-box">
                    <h4>Recommended Addons</h4>
                    <ul
                      className="list-text-only"
                      style={{ listStyle: "none", padding: 0 }}
                    >
                      {guide.recommended_addons.map((addon, index) => (
                        <li key={`addon-${index}`}>{addon.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              {guide.macro_string && (
                <div className="map-notes-box">
                  <h4>Helpful Macro</h4>
                  <pre
                    className="code-block"
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}
                  >
                    {guide.macro_string}
                  </pre>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN EDIT PAGE COMPONENT ---
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
    map_image_url: "",
    recommended_addons: [],
    items_of_note: [],
    macro_string: "",
    tags: ["transmog"],
    status: "DRAFT",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false); // State for preview modal

  useEffect(() => {
    if (id) {
      const fetchGuideData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/guides/${id}`);
          if (!response.ok) throw new Error("Failed to fetch guide data.");
          const data = await response.json();

          const parseJSON = (jsonString, defaultValue = []) => {
            if (!jsonString) return defaultValue;
            try {
              if (typeof jsonString === "object") return jsonString;
              return JSON.parse(jsonString);
            } catch {
              return defaultValue;
            }
          };

          setFormState({
            title: data.title || "",
            expansion: data.expansion || "",
            guide_type: data.guide_type || "Raid",
            description: data.description || "",
            gold_sessions: parseJSON(data.gold_sessions),
            thumbnail_url: data.thumbnail_url || "",
            map_image_url: data.map_image_url || "",
            recommended_addons: parseJSON(data.recommended_addons),
            items_of_note: parseJSON(data.items_of_note),
            macro_string: data.macro_string || "",
            tags: data.tags
              ? data.tags.split(",").filter(Boolean)
              : ["transmog"],
            status: data.status || "DRAFT",
          });
        } catch (err) {
          setError("Could not load guide data. " + err.message);
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
      title: formState.title,
      expansion: formState.expansion,
      guide_type: formState.guide_type,
      description: formState.description,
      gold_sessions: JSON.stringify(formState.gold_sessions),
      thumbnail_url: formState.thumbnail_url,
      map_image_url: formState.map_image_url,
      recommended_addons: JSON.stringify(formState.recommended_addons),
      items_of_note: JSON.stringify(formState.items_of_note),
      macro_string: formState.macro_string,
      tags: formState.tags.join(","),
      status: newStatus,
      is_transmog: true,
      category: "Transmog",
      gold_pr_hour: `${averageGph.toLocaleString()} g/hr`,
      authorId: session.user.id,
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

  if (isLoading || sessionStatus === "loading") return <p>Loading editor...</p>;

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
          <h1>Edit Transmog Guide</h1>
          <div className={styles.headerActions}>
            <button
              type="button"
              onClick={() => setIsPreviewing(true)}
              className={styles.draftButton}
              disabled={submitting}
            >
              <Eye size={16} /> Preview
            </button>
            <button
              type="button"
              onClick={() => handleSave("DRAFT")}
              className={styles.draftButton}
              disabled={submitting}
            >
              <Save size={16} /> Save Draft
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

        <div className={styles.mainLayout}>
          <div className={styles.mainColumn}>
            <h3 className={styles.sectionHeader}>Basic Information</h3>
            <div className="form-group">
              <label>Set Name / Title</label>
              <input
                type="text"
                value={formState.title}
                onChange={(e) => handleStateChange("title", e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <TiptapEditor
                value={formState.description}
                onChange={(val) => handleStateChange("description", val)}
              />
            </div>

            <h3 className={styles.sectionHeader}>Farming Tools</h3>
            <div className={styles.detailsGrid}>
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

            <h3 className={styles.sectionHeader}>Media</h3>
            <div className={styles.formGrid}>
              <div className="form-group">
                <label>Thumbnail (16:9)</label>
                <ImageUpload
                  imageUrl={formState.thumbnail_url}
                  setImageUrl={(val) => handleStateChange("thumbnail_url", val)}
                />
              </div>
              <div className="form-group">
                <label>Map/Location Image</label>
                <ImageUpload
                  imageUrl={formState.map_image_url}
                  setImageUrl={(val) => handleStateChange("map_image_url", val)}
                />
              </div>
            </div>
          </div>

          <div className={styles.sidebarColumn}>
            <h3 className={styles.sectionHeader}>Details</h3>
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
            <div className="form-group">
              <label>Tags</label>
              <TagInput
                tags={formState.tags}
                setTags={(val) => handleStateChange("tags", val)}
              />
            </div>

            <h3 className={styles.sectionHeader}>Items of Note</h3>
            <div className="form-group">
              <ItemsOfNoteManager
                items={formState.items_of_note}
                setItems={(val) => handleStateChange("items_of_note", val)}
                region={session?.user?.region || "us"}
                realm={session?.user?.realm || "stormrage"}
              />
            </div>

            <h3 className={styles.sectionHeader}>Gold Per Hour</h3>
            <div className="form-group">
              <GoldSessionManager
                sessions={formState.gold_sessions}
                setSessions={(val) => handleStateChange("gold_sessions", val)}
              />
            </div>
          </div>
        </div>
      </form>

      {isPreviewing && (
        <GuidePreview
          guide={formState}
          averageGph={averageGph}
          onClose={() => setIsPreviewing(false)}
        />
      )}
    </div>
  );
}
