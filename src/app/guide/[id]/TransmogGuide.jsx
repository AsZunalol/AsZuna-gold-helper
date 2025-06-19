// src/app/guide/[id]/TransmogGuide.jsx

import Image from "next/image";
import GoldInput from "@/components/GoldInput/GoldInput";
import TimeInput from "@/components/TimeInput/TimeInput";
import MapImageModal from "@/components/map-image-modal/MapImageModal";
import ItemPrices from "@/components/ItemPrices/ItemPrices";
import { Suspense } from "react";
import Spinner from "@/components/ui/spinner";
import "./transmog-guide.css";
import { WOW_EXPANSIONS } from "@/lib/constants"; // Import for expansion color

export default function TransmogGuide({ guide }) {
  // Helper to safely parse JSON or return empty array/object
  const parseJsonField = (fieldValue, defaultValue = []) => {
    if (typeof fieldValue === "string") {
      try {
        const parsed = JSON.parse(fieldValue);
        return Array.isArray(parsed) ? parsed : defaultValue; // Ensure it's an array if expected
      } catch (e) {
        console.error(`Error parsing JSON field: ${fieldValue}`, e);
        return defaultValue;
      }
    }
    // If it's already an array/object or null, return as is (or default if null)
    return fieldValue || defaultValue;
  };

  const itemsOfNote = parseJsonField(guide.itemsOfNote);
  const steps = parseJsonField(guide.steps);
  const recommendedAddons = parseJsonField(guide.recommended_addons);
  const requiredItems = parseJsonField(guide.required_items);
  const goldSessions = parseJsonField(guide.gold_sessions);
  const sliderImages = parseJsonField(guide.slider_images);

  // Parse route_string for coordinates, and use map_image_url directly
  let mapCoordinates = [];
  try {
    if (guide.route_string) {
      mapCoordinates = JSON.parse(guide.route_string);
      if (!Array.isArray(mapCoordinates)) {
        mapCoordinates = [];
      }
    }
  } catch (e) {
    console.error("Failed to parse route_string coordinates:", e);
    mapCoordinates = [];
  }

  // Calculate average Gold per Hour for display if goldSessions exist
  const averageGph =
    goldSessions.length > 0
      ? Math.round(
          (goldSessions.reduce((sum, s) => sum + s.gold, 0) /
            goldSessions.reduce((sum, s) => sum + s.minutes, 0)) *
            60
        )
      : 0;

  const expansionInfo = WOW_EXPANSIONS.find(
    (exp) => exp.name === guide.expansion
  );

  return (
    // The outermost div now relies on the global .main-content-card-wrapper for background/shadow
    <div className="guide-container-redesigned">
      {/* NEW: Thumbnail as a Header Card, consistent with NormalGuide and Preview */}
      <div className="thumbnail-wrapper">
        <div className="thumbnail-card">
          <Image
            src={guide.thumbnail_url || "/images/default-thumb.jpg"}
            alt="Guide Thumbnail"
            width={1200} // A wide width for initial load, objectFit will handle scaling
            height={300} // A height that creates an aspect ratio, objectFit will cover
            className="thumbnail-img"
            priority // Prioritize loading the main image
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
            </div>
          </div>
        </div>
      </div>
      {/* END NEW Thumbnail as a Header Card */}

      {/* NEW: Author Info below thumbnail header, consistent with NormalGuide */}
      <div
        className="author-info"
        style={{
          padding: "0.5rem 0",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          color: "var(--color-text-secondary)",
        }}
      >
        <Image
          src={guide.author.imageUrl || "/default-avatar.png"}
          alt={guide.author.username || "Author"}
          width={32}
          height={32}
          className="author-avatar"
        />
        <span>
          By <strong>{guide.author.username}</strong> on{" "}
          {new Date(guide.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="guide-layout-redesigned">
        {/* Main Content Area */}
        <div className="main-content-redesigned">
          {guide.youtube_video_id && (
            <div className="guide-video-redesigned">
              <iframe
                src={`https://www.youtube.com/embed/${guide.youtube_video_id}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}

          <div className="content-bg-redesigned">
            <div
              className="guide-content-redesigned"
              dangerouslySetInnerHTML={{ __html: guide.description || "" }}
            />
          </div>

          {/* Display slider images if available (Transmog guides might not use this, but added for completeness) */}
          {sliderImages.length > 0 && (
            <div className="guide-image-slider">
              {sliderImages.map((src, index) => (
                <div key={index} className="slider-image-wrapper">
                  <Image
                    src={src}
                    alt={`Guide image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: "contain" }}
                  />
                </div>
              ))}
            </div>
          )}

          {guide.map_image_url && mapCoordinates.length > 0 && (
            <div className="route-container-redesigned content-bg-redesigned">
              <h2>Farming Route</h2>
              <MapImageModal
                imageUrl={guide.map_image_url}
                coordinates={mapCoordinates}
              />
            </div>
          )}

          {steps && steps.length > 0 && (
            <div className="steps-container-redesigned content-bg-redesigned">
              <h2>Steps</h2>
              {steps.map((step, index) => (
                <div key={index} className="step-card-redesigned">
                  <h3>
                    Step {index + 1}: {step.title || ""}
                  </h3>
                  <p>{step.content || ""}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Area */}
        <div className="sidebar-redesigned">
          <div className="sidebar-widget-redesigned">
            <h2 className="widget-title-redesigned">Guide Details</h2>
            {/* The author-info-redesigned below is now redundant and can be removed or kept for specific sidebar styling */}
            {/* Keeping it for now as it's separate from the main author line above */}
            <div className="author-info-redesigned">
              <Image
                src={guide.author.imageUrl || "/default-avatar.png"}
                alt={guide.author.username || "Author"}
                width={50}
                height={50}
                className="author-avatar-redesigned"
              />
              <div className="author-name-redesigned">
                <span>By</span>
                <strong>{guide.author.username}</strong>
              </div>
            </div>
            <div className="guide-meta-redesigned">
              <div>
                <strong>Category:</strong> {guide.category}
              </div>
              <div>
                <strong>Expansion:</strong> {guide.expansion}
              </div>
              <div>
                <strong>Updated:</strong>{" "}
                {new Date(guide.updatedAt).toLocaleDateString()}
              </div>
              {/* Display average GPH from sessions */}
              {goldSessions.length > 0 && (
                <div>
                  <strong>Avg GPH:</strong> {averageGph.toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {itemsOfNote && itemsOfNote.length > 0 && (
            <div className="sidebar-widget-redesigned">
              <h2 className="widget-title-redesigned">Items of Note</h2>
              <div className="items-of-note-redesigned">
                <Suspense
                  fallback={
                    <div className="flex justify-center">
                      <Spinner />
                    </div>
                  }
                >
                  <ItemPrices items={itemsOfNote} />
                </Suspense>
              </div>
            </div>
          )}

          {recommendedAddons.length > 0 && (
            <div className="sidebar-widget-redesigned">
              <h2 className="widget-title-redesigned">Recommended Addons</h2>
              <ul className="list-text-only">
                {recommendedAddons.map((addon, index) => (
                  <li key={index}>
                    {addon.name}
                    {addon.link && (
                      <a
                        href={addon.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        (Link)
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {requiredItems.length > 0 && ( // Display required items
            <div className="sidebar-widget-redesigned">
              <h2 className="widget-title-redesigned">Required Items</h2>
              <ul className="list-text-only">
                {requiredItems.map((item, index) => (
                  <li key={index}>
                    {item.name}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        (Link)
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {guide.macro_string && (
            <div className="sidebar-widget-redesigned">
              <h2 className="widget-title-redesigned">Helpful Macro</h2>
              <pre className="code-block">{guide.macro_string}</pre>
            </div>
          )}

          {guide.tsm_import_string && (
            <div className="sidebar-widget-redesigned">
              <h2 className="widget-title-redesigned">TSM Import String</h2>
              <pre className="code-block">{guide.tsm_import_string}</pre>
            </div>
          )}

          {guide.tags &&
            guide.tags.length > 0 && ( // Display tags (if not already displayed as filter pills)
              <div className="sidebar-widget-redesigned">
                <h2 className="widget-title-redesigned">Tags</h2>
                <div className="tags-display" style={{ marginTop: "0.5rem" }}>
                  {(typeof guide.tags === "string"
                    ? guide.tags.split(",").map((tag) => tag.trim())
                    : guide.tags || []
                  ).map((tag) => (
                    <span key={tag} className="tag-pill">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

          <div className="sidebar-widget-redesigned">
            <h2 className="widget-title-redesigned">Gold/Hour Calculator</h2>
            <div className="calculator-container-redesigned">
              <GoldInput label="Gold Earned" />
              <TimeInput label="Time Spent (minutes)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
