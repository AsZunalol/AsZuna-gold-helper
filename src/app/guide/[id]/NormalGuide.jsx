// src/app/guide/[id]/NormalGuide.jsx

import Image from "next/image";
import GoldInput from "@/components/GoldInput/GoldInput";
import TimeInput from "@/components/TimeInput/TimeInput";
import MapImageModal from "@/components/map-image-modal/MapImageModal";
import ItemPrices from "@/components/ItemPrices/ItemPrices";
import { Suspense } from "react";
import Spinner from "@/components/ui/spinner";
import "./guide.css"; // Imports the original CSS for normal guides
import { WOW_EXPANSIONS } from "@/lib/constants"; // Import for expansion color

export default function NormalGuide({ guide }) {
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
    <div className="guide-container">
      {" "}
      {/* This is the .guide-container from guide.css, which holds layout within the main card wrapper */}
      {/* NEW: Thumbnail as a Header Card */}
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
      {/* Removed: Original H1 title and author info from here, as they are now in the header card */}
      {/*
      <h1 className="guide-title">{guide.title}</h1>
      <div className="author-info">
        <Image
          src={guide.author.imageUrl || "/default-avatar.png"}
          alt={guide.author.username || "Author"}
          width={40}
          height={40}
          className="author-avatar"
        />
        <span>By {guide.author.username}</span>
      </div>
      */}
      {/* NEW: Author Info below thumbnail header but before main content */}
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
      {guide.youtube_video_id && (
        <div className="guide-video">
          <iframe
            src={`https://www.youtube.com/embed/${guide.youtube_video_id}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-embed; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
      <div
        className="guide-content"
        dangerouslySetInnerHTML={{ __html: guide.description || "" }}
      />
      {/* Display slider images if available */}
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
        <div className="route-container">
          <h3>Farming Route</h3>
          <MapImageModal
            imageUrl={guide.map_image_url}
            coordinates={mapCoordinates}
          />
        </div>
      )}
      {steps && steps.length > 0 && (
        <div className="steps-container">
          <h3>Steps</h3>
          {steps.map((step, index) => (
            <div key={index} className="step">
              <h4>
                Step {index + 1}: {step.title || ""}
              </h4>
              <p>{step.content || ""}</p>
            </div>
          ))}
        </div>
      )}
      {itemsOfNote && itemsOfNote.length > 0 && (
        <div className="items-of-note">
          <h3>Items of Note</h3>
          <Suspense fallback={<Spinner />}>
            <ItemPrices items={itemsOfNote} />
          </Suspense>
        </div>
      )}
      {recommendedAddons.length > 0 && (
        <div className="addons-list">
          {" "}
          {/* New container for addons */}
          <h3>Recommended Addons</h3>
          <ul>
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
      {guide.macro_string && (
        <div className="macro-section">
          {" "}
          {/* New container for macros */}
          <h3>Helpful Macro</h3>
          <pre className="code-block">{guide.macro_string}</pre>
        </div>
      )}
      {guide.tsm_import_string && (
        <div className="tsm-section">
          {" "}
          {/* New container for TSM string */}
          <h3>TSM Import String</h3>
          <pre className="code-block">{guide.tsm_import_string}</pre>
        </div>
      )}
      <div className="calculator-container">
        <h3>Gold/Hour Calculator</h3>
        <GoldInput label="Gold Earned" />
        <TimeInput label="Time Spent (minutes)" />
        {/* Display calculated average GPH if goldSessions available */}
        {goldSessions.length > 0 && (
          <p>
            Estimated GPH from sessions:{" "}
            <strong>{averageGph.toLocaleString()} GPH</strong>
          </p>
        )}
      </div>
    </div>
  );
}
