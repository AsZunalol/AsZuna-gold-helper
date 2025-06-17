// src/app/admin/edit-guide/[id]/page.jsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import styles from "../../Admin.module.css"; // Corrected path based on previous turn

const TiptapEditor = dynamic(
  () => import("@/components/TiptapEditor/TiptapEditor"),
  {
    ssr: false,
  }
);
const StepManager = dynamic(
  () => import("@/components/StepManager/StepManager"),
  {
    ssr: false,
  }
);

import TagInput from "@/components/TagInput/TagInput";
import MultiClassSelect from "@/components/MultiClassSelect/MultiClassSelect";
import ExpansionSelect from "@/components/ExpansionSelect/ExpansionSelect";
import CategorySelect from "@/components/CategorySelect/CategorySelect";
import GoldInput from "@/components/GoldInput/GoldInput";
import TimeInput from "@/components/TimeInput/TimeInput";
import ListManager from "@/components/ListManager/ListManager";
import StringImportManager from "@/components/StringImportManager/StringImportManager";
import RouteManager from "@/components/RouteManager/RouteManager";
import ImageUpload from "@/components/ImageUpload/ImageUpload";
import ImageSliderManager from "@/components/ImageSliderManager/ImageSliderManager";
import ItemsOfNoteManager from "@/components/ItemsOfNoteManager/ItemsOfNoteManager";

// Consistent form input style using CSS variables
const formInputStyle = {
  width: "100%",
  padding: "0.9rem 1.2rem",
  backgroundColor: "var(--color-background)",
  border: "1px solid var(--color-border)",
  borderRadius: "8px",
  color: "var(--color-text-main)",
  fontSize: "1rem",
  transition: "all 0.25s ease",
  boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.3)",
};

export default function EditGuidePage() {
  // Renamed from CreateGuidePage
  const router = useRouter();
  const { id } = useParams(); // Get the ID from the URL
  const guideId = parseInt(id, 10); // Parse it to an integer
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [loadingGuide, setLoadingGuide] = useState(true); // New loading state for guide data

  // State for all form fields, initialized to empty strings/arrays
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [expansion, setExpansion] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState([{ id: Date.now(), content: "" }]); // Ensure unique ID for new steps
  const [youtubeVideoId, setYoutubeVideoId] = useState("");
  const [goldPrHour, setGoldPrHour] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [sliderImages, setSliderImages] = useState([]);
  const [addons, setAddons] = useState([]);
  const [requiredItems, setRequiredItems] = useState([]);
  const [itemsOfNote, setItemsOfNote] = useState([]);
  const [mapImagePath, setMapImagePath] = useState(""); // Correctly defined state variable
  const [timeToComplete, setTimeToComplete] = useState("");
  const [recommendedClasses, setRecommendedClasses] = useState([]);
  const [tsmImportString, setTsmImportString] = useState("");
  const [routeStrings, setrouteStrings] = useState([]);
  const [tags, setTags] = useState([]);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Removed accordion states, as content will always be visible
  // const [showBasicInfo, setShowBasicInfo] = useState(true);
  // ... (rest of accordion states removed)

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

  // New useEffect to fetch guide data and pre-populate the form
  useEffect(() => {
    if (
      isClient &&
      status === "authenticated" &&
      session?.user.role === "ADMIN" &&
      guideId &&
      !isNaN(guideId)
    ) {
      const fetchGuide = async () => {
        try {
          const response = await fetch(`/api/guides/${guideId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch guide data.");
          }
          const data = await response.json();

          // Pre-populate form fields with fetched data
          setTitle(data.title || "");
          setCategory(data.category || "");
          setExpansion(data.expansion || "");
          setDescription(data.description || "");
          // Parse JSON strings back to arrays/objects
          setSteps(
            data.steps
              ? JSON.parse(data.steps).map((content, idx) => ({
                  id: idx,
                  content,
                }))
              : [{ id: 1, content: "" }]
          );
          setYoutubeVideoId(data.youtube_video_id || "");
          setGoldPrHour(data.gold_pr_hour || "");
          setThumbnailUrl(data.thumbnail_url || "");
          setSliderImages(
            data.slider_images ? JSON.parse(data.slider_images) : []
          );
          setAddons(data.addons ? JSON.parse(data.addons) : []);
          setRequiredItems(
            data.required_items ? JSON.parse(data.required_items) : []
          );
          setItemsOfNote(
            data.items_of_note ? JSON.parse(data.items_of_note) : []
          );
          setMapImagePath(data.map_image_path || "");
          setTimeToComplete(data.time_to_complete || "");
          // Split comma-separated strings back to arrays
          setRecommendedClasses(
            data.recommended_class
              ? data.recommended_class.split(",").map((s) => s.trim())
              : []
          );
          setTsmImportString(data.tsm_import_string || "");
          setrouteStrings(
            data.route_string ? JSON.parse(data.route_string) : []
          );
          setTags(data.tags ? data.tags.split(",").map((s) => s.trim()) : []);
        } catch (err) {
          console.error("Error fetching guide:", err);
          setError("Failed to load guide data: " + err.message);
        } finally {
          setLoadingGuide(false);
        }
      };

      fetchGuide();
    } else if (guideId && isNaN(guideId)) {
      setLoadingGuide(false); // Stop loading if ID is invalid
    }
  }, [isClient, status, session, guideId]); // Depend on guideId to refetch if route param changes

  // Update the loading condition for initial render
  if (
    !isClient ||
    status === "loading" ||
    loadingGuide || // Show loading until guide data is fetched
    status !== "authenticated" ||
    session?.user.role !== "ADMIN" ||
    isNaN(guideId) // Handle invalid IDs early
  ) {
    return (
      <div className={styles.container}>
        <p style={{ textAlign: "center", marginTop: "5rem" }}>
          {isNaN(guideId)
            ? "Invalid Guide ID."
            : "Loading & Verifying Access..."}
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
      items_of_note: JSON.stringify(itemsOfNote),
      map_image_path: mapImagePath, // FIXED: Changed from map_image_path to mapImagePath
      time_to_complete: timeToComplete,
      recommended_class: recommendedClasses.join(","),
      tsm_import_string: tsmImportString,
      route_string: JSON.stringify(routeStrings),
      tags: tags.join(","),
      authorId: session.user.id, // Ensure authorId is sent for verification/update
    };

    try {
      const response = await fetch(`/api/guides/${guideId}`, {
        // Changed URL to include ID
        method: "PUT", // Changed method to PUT
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guideData),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update guide.");
      }

      setError(""); // Clear any previous error
      router.push(`/guide/${guideId}`); // Redirect to the updated guide page
    } catch (err) {
      console.error("Error updating guide:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 style={{ marginBottom: "2rem", textAlign: "left" }}>Edit Guide</h2>
      <form onSubmit={handleSubmit}>
        <div className="admin-page-layout">
          {/* --- Left Column --- */}
          <div className="main-content-col">
            {/* Basic Guide Information - Always open */}
            <div className="glass-panel admin-content-card">
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

            {/* Guide Description - Always open */}
            <div className="glass-panel admin-content-card">
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

            {/* Step-by-Step Instructions - Always open */}
            <div className="glass-panel admin-content-card">
              <div className="collapsible-header-static">
                <h3>Step-by-Step Instructions</h3>
              </div>
              <div className="collapsible-content-static">
                <div className="form-group">
                  <StepManager steps={steps} setSteps={setSteps} />
                </div>
              </div>
            </div>

            {/* Media & Images - Always open */}
            <div className="glass-panel admin-content-card">
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
                {submitting ? "Updating..." : "Update Guide"}{" "}
                {/* Changed text */}
              </button>
            </div>

            {/* Performance Metadata - Always open */}
            <div className="glass-panel admin-content-card">
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

            {/* Items & Addons - Always open */}
            <div className="glass-panel admin-content-card">
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

            {/* Import Strings - Always open */}
            <div className="glass-panel admin-content-card">
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
                    routes={routeStrings}
                    setRoutes={setrouteStrings}
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
          {submitting ? "Updating..." : "Update Guide"}
        </button>
      </form>
    </div>
  );
}
