// src/app/guide/[id]/NormalGuide.jsx

"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import MapImageModal from "@/components/map-image-modal/MapImageModal";
import ItemPrices from "@/components/ItemPrices/ItemPrices";
import Spinner from "@/components/ui/spinner";
import { WOW_EXPANSIONS } from "@/lib/constants";
import "./guide.css"; // Styles have been updated for this layout

export default function NormalGuide({ guide }) {
  const [showAllTags, setShowAllTags] = useState(false);

  const parseJsonField = (fieldValue, defaultValue = []) => {
    if (typeof fieldValue === "string") {
      try {
        const parsed = JSON.parse(fieldValue);
        return Array.isArray(parsed) ? parsed : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    }
    return fieldValue || defaultValue;
  };

  const itemsOfNote = parseJsonField(guide.items_of_note);
  const steps = parseJsonField(guide.steps);
  const recommendedAddons = parseJsonField(guide.recommended_addons);
  const sliderImages = parseJsonField(guide.slider_images);
  const mapCoordinates = parseJsonField(guide.route_string);
  const expansionInfo = WOW_EXPANSIONS.find(
    (exp) => exp.name === guide.expansion
  );

  const allTags =
    typeof guide.tags === "string"
      ? guide.tags.split(",").map((tag) => tag.trim())
      : guide.tags || [];
  const displayedTags = showAllTags ? allTags : allTags.slice(0, 3);

  return (
    <div className="guide-container">
      <div className="thumbnail-wrapper">
        <div className="thumbnail-card">
          <Image
            src={guide.thumbnail_url || "/images/default-thumb.jpg"}
            alt="Guide Thumbnail"
            width={1200}
            height={300}
            className="thumbnail-img"
            priority
          />
          <div className="thumbnail-topleft">
            <span>{guide.category}</span>
          </div>
          <div className="thumbnail-bottomright">
            <span>{guide.gold_pr_hour || "N/A"}</span>
          </div>
          <div className="thumbnail-overlay-box">
            <div className="thumbnail-overlay-content">
              <h1 className="guide-title-overlay">{guide.title}</h1>
              {expansionInfo && (
                <p
                  className="guide-expansion"
                  style={{ color: expansionInfo.color }}
                >
                  Expansion – {guide.expansion}
                </p>
              )}
              {allTags.length > 0 && (
                <div
                  className={`tag-list-wrapper ${
                    showAllTags ? "expanded" : ""
                  }`}
                >
                  <div className="tags-display">
                    {displayedTags.map((tag) => (
                      <span key={tag} className="tag-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {!showAllTags && allTags.length > 3 && (
                    <div className="tags-fade-overlay"></div>
                  )}
                </div>
              )}
              {allTags.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="tags-toggle-button"
                >
                  {showAllTags
                    ? "Show Less Tags"
                    : `Show All ${allTags.length} Tags`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="author-info">
        <Image
          src={guide.author.imageUrl || "/images/default-avatar.png"}
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

      <div className="guide-layout">
        <div className="guide-main-col">
          <div
            className="guide-section"
            dangerouslySetInnerHTML={{ __html: guide.description || "" }}
          />

          {guide.youtube_video_id && (
            <div className="guide-section">
              <h2>Video Guide</h2>
              <div className="guide-video">
                <iframe
                  src={`https://www.youtube.com/embed/${guide.youtube_video_id}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {steps.length > 0 && (
            <div className="guide-section">
              <h2>Steps</h2>
              <ol className="guide-steps">
                {steps.map((step, index) => (
                  <li
                    key={index}
                    dangerouslySetInnerHTML={{ __html: step.content || "" }}
                  />
                ))}
              </ol>
            </div>
          )}

          {sliderImages.length > 0 && (
            <div className="guide-section">
              <h2>Gallery</h2>
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
            </div>
          )}
        </div>

        <aside className="guide-sidebar-col">
          {guide.map_image_url && mapCoordinates.length > 0 && (
            <div className="sidebar-card">
              <h3>Farming Route</h3>
              <MapImageModal
                imageUrl={guide.map_image_url}
                coordinates={mapCoordinates}
              />
            </div>
          )}

          {itemsOfNote.length > 0 && (
            <div className="sidebar-card">
              <h3>Items of Note</h3>
              <Suspense fallback={<Spinner />}>
                <ItemPrices items={itemsOfNote} />
              </Suspense>
            </div>
          )}

          {recommendedAddons.length > 0 && (
            <div className="sidebar-card">
              <h3>Recommended Addons</h3>
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

          {guide.macro_string && (
            <div className="sidebar-card">
              <h3>Helpful Macro</h3>
              <pre className="code-block">{guide.macro_string}</pre>
            </div>
          )}

          {guide.tsm_import_string && (
            <div className="sidebar-card">
              <h3>TSM Import String</h3>
              <pre className="code-block">{guide.tsm_import_string}</pre>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
