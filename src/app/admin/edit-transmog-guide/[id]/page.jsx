// src/app/admin/edit-transmog-guide/[id]/page.jsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import styles from "../../create-transmog-guide/transmogGuide.module.css"; // Reuse the same styles
import {
  PlusCircle,
  Trash2,
  DollarSign,
  Clock,
  Hash,
  Save,
  Eye,
} from "lucide-react";

// Dynamically import client-side components
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

// Gold Per Hour Calculator Component (reused from create page)
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
  const removeSession = (index) =>
    setSessions(sessions.filter((_, i) => i !== index));
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

// --- MAIN EDIT PAGE COMPONENT ---
export default function EditTransmogGuidePage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: session, status: sessionStatus } = useSession();

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
  const [tags, setTags] = useState([]);
  const [guideStatus, setGuideStatus] = useState("DRAFT");

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

          setTitle(data.title || "");
          setExpansion(data.expansion || "");
          setGuideType(data.guide_type || "Raid");
          setDescription(data.description || "");
          setGoldSessions(
            data.gold_sessions ? JSON.parse(data.gold_sessions) : []
          );
          setThumbnailUrl(data.thumbnail_url || "");
          setMapImageUrl(data.map_image_url || "");
          setRecommendedAddons(
            data.recommended_addons ? JSON.parse(data.recommended_addons) : []
          );
          setItemsOfNote(
            data.items_of_note ? JSON.parse(data.items_of_note) : []
          );
          setMacroString(data.macro_string || "");
          setTags(data.tags ? data.tags.split(",") : []);
          setGuideStatus(data.status || "DRAFT");
        } catch (err) {
          setError("Could not load guide data. " + err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchGuideData();
    }
  }, [id]);

  const averageGph = useMemo(() => {
    if (goldSessions.length === 0) return 0;
    const totalGold = goldSessions.reduce((sum, s) => sum + s.gold, 0);
    const totalMinutes = goldSessions.reduce((sum, s) => sum + s.minutes, 0);
    return totalMinutes > 0 ? Math.round((totalGold / totalMinutes) * 60) : 0;
  }, [goldSessions]);

  const handleSave = async (newStatus) => {
    if (!title) {
      setError("A title is required.");
      return;
    }
    setSubmitting(true);
    setError("");

    const guideData = {
      title,
      category: "Transmog",
      status: newStatus,
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

      if (newStatus === "PUBLISHED") {
        router.push(`/guide/${id}`);
      } else {
        router.push("/admin/guides-list");
      }
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
    </div>
  );
}
