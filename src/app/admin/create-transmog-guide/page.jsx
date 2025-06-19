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

// Gold Per Hour Calculator Component
const GoldSessionManager = ({ sessions, setSessions }) => {
  const [gold, setGold] = useState("");
  const [minutes, setMinutes] = useState("");

  const addSession = () => {
    const goldAmount = parseInt(gold);
    const timeAmount = parseInt(minutes);
    if (goldAmount > 0 && timeAmount > 0) {
      setSessions([...sessions, { gold: goldAmount, minutes: timeAmount }]);
      setGold("");
      setMinutes("");
    }
  };

  const removeSession = (index) => {
    setSessions(sessions.filter((_, i) => i !== index));
  };

  const averageGph = useMemo(() => {
    if (sessions.length === 0) return 0;
    const totalGold = sessions.reduce((sum, s) => sum + s.gold, 0);
    const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
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
      {sessions.length > 0 && (
        <div className="managed-list" style={{ marginTop: "1rem" }}>
          {sessions.map((session, index) => (
            <div key={index} className="managed-list-item">
              <div
                className="item-content"
                style={{ flexDirection: "row", gap: "1.5rem" }}
              >
                <span className="item-name">
                  <Hash size={14} /> Session {index + 1}
                </span>
                <span className="item-link">
                  <DollarSign size={14} /> {session.gold.toLocaleString()} gold
                </span>
                <span className="item-link">
                  <Clock size={14} /> {session.minutes} minutes
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

// --- START OF CHANGES ---
// This is the new, more complete GuidePreview component
const GuidePreview = ({ guide, onClose, averageGph }) => {
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
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="close-modal-button">
          &times;
        </button>
        <div className="guide-outer">
          <div className="thumbnail-wrapper">
            <div className="thumbnail-card">
              <Image
                src={guide.thumbnailUrl || "/images/default-thumb.jpg"}
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
          <div className="guide-layout">
            <div className="guide-content">
              <div
                className="prose-mirror-editor"
                dangerouslySetInnerHTML={{
                  __html:
                    guide.description || "<p>No description provided.</p>",
                }}
              ></div>
            </div>
            <aside className="guide-right-panel">
              <div className="map-notes-box">
                <h4>Items of Note</h4>
                {guide.itemsOfNote && guide.itemsOfNote.length > 0 ? (
                  <ul className="item-list">
                    {guide.itemsOfNote.map((item, index) => (
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
                ) : (
                  <p>No items added.</p>
                )}
              </div>
              {guide.recommendedAddons &&
                guide.recommendedAddons.length > 0 && (
                  <div className="map-notes-box">
                    <h4>Recommended Addons</h4>
                    <ul className="list-text-only">
                      {guide.recommendedAddons.map((addon, index) => (
                        <li key={`addon-${index}`}>{addon.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              {guide.macroString && (
                <div className="map-notes-box">
                  <h4>Helpful Macro</h4>
                  <pre className="code-block">{guide.macroString}</pre>
                </div>
              )}
              <div className="map-notes-box">
                <h4>Details</h4>
                <p>
                  <strong>Gold/Hour:</strong> {averageGph.toLocaleString()} g/hr
                </p>
                <div style={{ marginTop: "1rem" }}>
                  <strong>Tags:</strong>
                  {/* Tags in sidebar are not truncated in preview */}
                  <div className="tags-display" style={{ marginTop: "0.5rem" }}>
                    {guide.tags.map((tag) => (
                      <span key={tag} className="tag-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};
// --- END OF CHANGES ---

// --- MAIN PAGE COMPONENT ---
export default function CreateTransmogGuidePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [expansion, setExpansion] = useState("");
  const [guideType, setGuideType] = useState("Raid");
  const [description, setDescription] = useState("");
  const [goldSessions, setGoldSessions] = useState([]);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [mapImageUrl, setMapImageUrl] = useState("");
  const [recommendedAddons, setRecommendedAddons] = useState([]);
  const [itemsOfNote, setItemsOfNote] = useState([]);
  const [macroString, setMacroString] = useState("");
  const [tags, setTags] = useState(["transmog"]);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (
      status === "authenticated" &&
      !["ADMIN", "OWNER"].includes(session.user.role)
    ) {
      router.push("/");
    }
  }, [status, session, router]);

  const averageGph = useMemo(() => {
    if (goldSessions.length === 0) return 0;
    const totalGold = goldSessions.reduce((sum, s) => sum + s.gold, 0);
    const totalMinutes = goldSessions.reduce((sum, s) => sum + s.minutes, 0);
    return totalMinutes > 0 ? Math.round((totalGold / totalMinutes) * 60) : 0;
  }, [goldSessions]);

  const handleSave = async (guideStatus) => {
    if (!title) {
      setError("A title is required to save a draft.");
      return;
    }
    setSubmitting(true);
    setError("");

    const guideData = {
      title,
      category: "Transmog",
      status: guideStatus,
      expansion,
      guide_type: guideType,
      description,
      is_transmog: true,
      gold_sessions: JSON.stringify(goldSessions),
      gold_pr_hour: `${averageGph.toLocaleString()} g/hr`,
      thumbnail_url: thumbnailUrl,
      map_image_url: mapImageUrl,
      recommended_addons: JSON.stringify(recommendedAddons),
      items_of_note: JSON.stringify(itemsOfNote),
      macro_string: macroString,
      tags: tags.join(","),
      authorId: session.user.id,
      steps: "[]",
      youtube_video_id: "",
      time_to_complete: "",
      required_items: "[]",
      tsm_import_string: "",
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
      if (guideStatus === "PUBLISHED") {
        router.push(`/guide/${newGuide.id}`);
      } else {
        router.push("/admin/guides-list");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isClient || status === "loading") return <p>Loading...</p>;

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
          <h1>Create New Transmog Guide</h1>
          <div className={styles.headerActions}>
            <button
              type="button"
              onClick={() => setIsPreviewing(true)}
              className={styles.previewButton}
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

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.mainLayout}>
          <div className={styles.mainColumn}>
            <h3 className={styles.sectionHeader}>Basic Information</h3>
            <div className="form-group">
              <label>Set Name / Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <TiptapEditor value={description} onChange={setDescription} />
            </div>

            <h3 className={styles.sectionHeader}>Farming Tools</h3>
            <div className={styles.detailsGrid}>
              <div className="form-group">
                <label>Recommended Addons</label>
                <ListManager
                  title=""
                  noun="Addon"
                  items={recommendedAddons}
                  setItems={setRecommendedAddons}
                />
              </div>
              <div className="form-group">
                <label>Helpful Macro</label>
                <StringImportManager
                  title=""
                  stringValue={macroString}
                  setStringValue={setMacroString}
                />
              </div>
            </div>

            <h3 className={styles.sectionHeader}>Media</h3>
            <div className={styles.formGrid}>
              <div className="form-group">
                <label>Thumbnail (16:9)</label>
                <ImageUpload
                  imageUrl={thumbnailUrl}
                  setImageUrl={setThumbnailUrl}
                />
              </div>
              <div className="form-group">
                <label>Map/Location Image</label>
                <ImageUpload
                  imageUrl={mapImageUrl}
                  setImageUrl={setMapImageUrl}
                />
              </div>
            </div>
          </div>

          <div className={styles.sidebarColumn}>
            <h3 className={styles.sectionHeader}>Details</h3>
            <div className="form-group">
              <label>Expansion</label>
              <ExpansionSelect
                selectedExpansion={expansion}
                setSelectedExpansion={setExpansion}
              />
            </div>
            <div className="form-group">
              <label>Content Type</label>
              <select
                value={guideType}
                onChange={(e) => setGuideType(e.target.value)}
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
              <TagInput tags={tags} setTags={setTags} />
            </div>

            <h3 className={styles.sectionHeader}>Items of Note</h3>
            <div className="form-group">
              <ItemsOfNoteManager
                items={itemsOfNote}
                setItems={setItemsOfNote}
                region={session?.user?.region || "us"}
                realm={session?.user?.realm || "stormrage"}
              />
            </div>

            <h3 className={styles.sectionHeader}>Gold Per Hour</h3>
            <div className="form-group">
              <GoldSessionManager
                sessions={goldSessions}
                setSessions={setGoldSessions}
              />
            </div>
          </div>
        </div>
      </form>
      {isPreviewing && (
        <GuidePreview
          guide={{
            title,
            expansion,
            description,
            thumbnailUrl,
            itemsOfNote,
            tags,
            recommendedAddons,
            macroString,
          }}
          averageGph={averageGph}
          onClose={() => setIsPreviewing(false)}
        />
      )}
    </div>
  );
}
