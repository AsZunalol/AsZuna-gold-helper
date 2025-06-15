// aszunalol/aszuna-gold-helper/AsZuna-gold-helper-e7b64661f52d01644dc7d7dea50098deeb640633/src/app/admin/create-guide/page.jsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import styles from "../Admin.module.css";

const TiptapEditor = dynamic(() => import("@/components/TiptapEditor"), {
  ssr: false,
});
const StepManager = dynamic(() => import("@/components/StepManager"), {
  ssr: false,
});

import TagInput from "@/components/TagInput";
import MultiClassSelect from "@/components/MultiClassSelect";
import ExpansionSelect from "@/components/ExpansionSelect";
import CategorySelect from "@/components/CategorySelect";
import GoldInput from "@/components/GoldInput";
import TimeInput from "@/components/TimeInput";
import ListManager from "@/components/ListManager";
import StringImportManager from "@/components/StringImportManager";
import RouteManager from "@/components/RouteManager";
import ImageUpload from "@/components/ImageUpload";
import ImageSliderManager from "@/components/ImageSliderManager";
import ItemsOfNoteManager from "@/components/ItemsOfNoteManager";

const formInputStyle = {
  width: "100%",
  padding: "0.9rem 1.2rem", // Adjusted padding for consistency with new Admin.module.css inputs
  backgroundColor: "var(--color-background)",
  border: "1px solid var(--color-border)",
  borderRadius: "8px",
  color: "var(--color-text-main)",
  fontSize: "1rem",
  transition: "all 0.25s ease",
  boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.3)",
};

export default function CreateGuidePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);

  // State for all form fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [expansion, setExpansion] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState([{ id: 1, content: "" }]);
  const [youtubeVideoId, setYoutubeVideoId] = useState("");
  const [goldPrHour, setGoldPrHour] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [sliderImages, setSliderImages] = useState([]);
  const [addons, setAddons] = useState([]);
  const [requiredItems, setRequiredItems] = useState([]);
  const [itemsOfNote, setItemsOfNote] = useState([]);
  const [mapImagePath, setMapImagePath] = useState("");
  const [timeToComplete, setTimeToComplete] = useState("");
  const [recommendedClasses, setRecommendedClasses] = useState([]);
  const [tsmImportString, setTsmImportString] = useState("");
  const [gathermate2Strings, setGathermate2Strings] = useState([]);
  const [tags, setTags] = useState([]);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // REMOVED: States for accordion sections - content will always be visible now
  // const [showBasicInfo, setShowBasicInfo] = useState(true);
  // const [showDescription, setShowDescription] = useState(false);
  // const [showSteps, setShowSteps] = useState(false);
  // const [showMedia, setShowMedia] = useState(false);
  // const [showMetadata, setShowMetadata] = useState(false);
  // const [showItemsAddons, setShowItemsAddons] = useState(false);
  // const [showImportStrings, setShowImportStrings] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (status === "authenticated" && session?.user.role !== "ADMIN")
    ) {
      router.push("/");
    }
  }, [status, session, router]);

  if (
    !isClient ||
    status === "loading" ||
    status !== "authenticated" ||
    session?.user.role !== "ADMIN"
  ) {
    return (
      <div className={styles.container}>
        <p style={{ textAlign: "center", marginTop: "5rem" }}>
          Loading & Verifying Access...
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");

    const guideData = {
      title,
      category,
      expansion,
      description,
      steps: JSON.stringify(steps),
      youtube_video_id: youtubeVideoId,
      gold_pr_hour: goldPrHour,
      thumbnail_url: thumbnailUrl,
      slider_images: JSON.stringify(sliderImages),
      addons: JSON.stringify(addons),
      required_items: JSON.stringify(requiredItems),
      itemsOfNote: JSON.stringify(itemsOfNote),
      map_image_path: mapImagePath,
      time_to_complete: timeToComplete,
      recommended_class: recommendedClasses.join(","),
      tsm_import_string: tsmImportString,
      gathermate2_string: JSON.stringify(gathermate2Strings),
      tags: tags.join(","),
      authorId: session.user.id,
    };

    try {
      const response = await fetch("/api/guides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guideData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            "Failed to create guide. Please check all fields."
        );
      }
      const newGuide = await response.json();
      router.push(`/guide/${newGuide.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 style={{ marginBottom: "2rem", textAlign: "left" }}>
        Create New Content
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="admin-page-layout">
          {/* --- Left Column --- */}
          <div className="main-content-col">
            {/* Basic Guide Information - Now always open */}
            <div className="glass-panel admin-content-card">
              {" "}
              {/* Removed collapsible-card class */}
              <div className="collapsible-header-static">
                {" "}
                {/* New class for static header */}
                <h3>Basic Guide Information</h3>
              </div>
              <div className="collapsible-content-static">
                {" "}
                {/* New class for static content */}
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={formInputStyle}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <CategorySelect
                    selectedCategory={category}
                    setSelectedCategory={setCategory}
                  />
                </div>
                <div className="form-group">
                  <label>Expansion</label>
                  <ExpansionSelect
                    selectedExpansion={expansion}
                    setSelectedExpansion={setExpansion}
                  />
                </div>
                <div className="form-group">
                  <label>Tags</label>
                  <TagInput tags={tags} setTags={setTags} />
                </div>
              </div>
            </div>

            {/* Guide Description - Now always open */}
            <div className="glass-panel admin-content-card">
              {" "}
              {/* Removed collapsible-card class */}
              <div className="collapsible-header-static">
                <h3>Guide Description</h3>
              </div>
              <div className="collapsible-content-static">
                <div className="form-group">
                  <label>Description (Overview of the guide)</label>
                  <TiptapEditor value={description} onChange={setDescription} />
                </div>
              </div>
            </div>

            {/* Step-by-Step Instructions - Now always open */}
            <div className="glass-panel admin-content-card">
              {" "}
              {/* Removed collapsible-card class */}
              <div className="collapsible-header-static">
                <h3>Step-by-Step Instructions</h3>
              </div>
              <div className="collapsible-content-static">
                <div className="form-group">
                  <StepManager steps={steps} setSteps={setSteps} />
                </div>
              </div>
            </div>

            {/* Media & Images - Now always open */}
            <div className="glass-panel admin-content-card">
              {" "}
              {/* Removed collapsible-card class */}
              <div className="collapsible-header-static">
                <h3>Media & Images</h3>
              </div>
              <div className="collapsible-content-static">
                <div className="form-group thumbnail-uploader">
                  <label>Guide Thumbnail</label>
                  <ImageUpload
                    imageUrl={thumbnailUrl}
                    setImageUrl={setThumbnailUrl}
                  />
                </div>
                <div className="form-group">
                  <label>Map Image</label>
                  <ImageUpload
                    imageUrl={mapImagePath}
                    setImageUrl={setMapImagePath}
                    label="Map Image"
                  />
                </div>
                <div className="form-group">
                  <label>YouTube Video ID</label>
                  <input
                    type="text"
                    placeholder="e.g., dQw4w9WgXcQ"
                    value={youtubeVideoId}
                    onChange={(e) => setYoutubeVideoId(e.target.value)}
                    style={formInputStyle}
                  />
                </div>
                <div className="form-group">
                  <ImageSliderManager
                    images={sliderImages}
                    setImages={setSliderImages}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* --- Right Column --- */}
          <div className="sidebar-col">
            <div className="sidebar-card">
              <h3>Publish</h3>
              {error && (
                <p className="error-message" style={{ textAlign: "center" }}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="form-button"
                disabled={submitting}
              >
                {submitting ? "Publishing..." : "Publish Content"}
              </button>
            </div>

            {/* Performance Metadata - Now always open */}
            <div className="glass-panel admin-content-card">
              {" "}
              {/* Removed collapsible-card class */}
              <div className="collapsible-header-static">
                <h3>Performance Metadata</h3>
              </div>
              <div className="collapsible-content-static">
                <div className="form-group">
                  <label>Gold Per Hour</label>
                  <GoldInput value={goldPrHour} onChange={setGoldPrHour} />
                </div>
                <div className="form-group">
                  <label>Time to Complete</label>
                  <TimeInput
                    value={timeToComplete}
                    onChange={setTimeToComplete}
                  />
                </div>
                <div className="form-group">
                  <label>Recommended Classes</label>
                  <MultiClassSelect
                    selectedClasses={recommendedClasses}
                    setSelectedClasses={setRecommendedClasses}
                  />
                </div>
              </div>
            </div>

            {/* Items & Addons - Now always open */}
            <div className="glass-panel admin-content-card">
              {" "}
              {/* Removed collapsible-card class */}
              <div className="collapsible-header-static">
                <h3>Items & Addons</h3>
              </div>
              <div className="collapsible-content-static">
                <div className="form-group">
                  <ItemsOfNoteManager
                    items={itemsOfNote}
                    setItems={setItemsOfNote}
                    session={session}
                  />
                </div>
                <div className="form-group">
                  <ListManager
                    title="Recommended Addons"
                    noun="Addon"
                    items={addons}
                    setItems={setAddons}
                  />
                </div>
                <div className="form-group">
                  <ListManager
                    title="Required Items"
                    noun="Item"
                    items={requiredItems}
                    setItems={setRequiredItems}
                  />
                </div>
              </div>
            </div>

            {/* Import Strings - Now always open */}
            <div className="glass-panel admin-content-card">
              {" "}
              {/* Removed collapsible-card class */}
              <div className="collapsible-header-static">
                <h3>Import Strings</h3>
              </div>
              <div className="collapsible-content-static">
                <div className="form-group">
                  <StringImportManager
                    title="TSM Import String"
                    stringValue={tsmImportString}
                    setStringValue={setTsmImportString}
                  />
                </div>
                <div className="form-group">
                  <RouteManager
                    routes={gathermate2Strings}
                    setRoutes={setGathermate2Strings}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="form-button"
          disabled={submitting}
          style={{ marginTop: "3rem", width: "100%", padding: "1rem" }}
        >
          {submitting ? "Publishing..." : "Publish Content"}
        </button>
      </form>
    </div>
  );
}
