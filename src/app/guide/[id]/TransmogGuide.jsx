"use client";
// src/app/guide/[id]/TransmogGuide.jsx

import Image from "next/image";
import MapImageModal from "@/components/map-image-modal/MapImageModal";
import ItemPrices from "@/components/ItemPrices/ItemPrices";
import { Suspense, useState } from "react";
import Spinner from "@/components/ui/spinner";
import "./transmog-guide.css";
import { WOW_EXPANSIONS } from "@/lib/constants";

export default function TransmogGuide({ guide }) {
  const [showAllTags, setShowAllTags] = useState(false);

  const parseJsonField = (fieldValue, defaultValue = []) => {
    if (typeof fieldValue === "string") {
      try {
        const parsed = JSON.parse(fieldValue);
        return Array.isArray(parsed) ? parsed : defaultValue;
      } catch (e) {
        console.error(`Error parsing JSON field: ${fieldValue}`, e);
        return defaultValue;
      }
    }
    return fieldValue || defaultValue;
  };

  const itemsOfNote = parseJsonField(guide.itemsOfNote);
  const steps = parseJsonField(guide.steps);
  const recommendedAddons = parseJsonField(guide.recommended_addons);
  const requiredItems = parseJsonField(guide.required_items);
  const goldSessions = parseJsonField(guide.gold_sessions, []);
  const sliderImages = parseJsonField(guide.slider_images);
  const mapCoordinates = parseJsonField(guide.route_string);

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

  const allTags =
    typeof guide.tags === "string"
      ? guide.tags.split(",").map((tag) => tag.trim())
      : guide.tags || [];
  const displayedTags = showAllTags ? allTags : allTags.slice(0, 3);

  return (
    <div className="guide-container-redesigned">
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
            <span>{averageGph.toLocaleString()} GPH</span>
          </div>
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

          {sliderImages.length > 0 && (
            <div className="content-bg-redesigned">
              <h2 className="widget-title-redesigned">Gallery</h2>
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

          {guide.map_image_url && mapCoordinates.length > 0 && (
            <div className="route-container-redesigned content-bg-redesigned">
              <h2>Farming Route</h2>
              <MapImageModal
                imageUrl={guide.map_image_url}
                coordinates={mapCoordinates}
              />
            </div>
          )}
        </div>

        {/* Sidebar Area */}
        <div className="sidebar-redesigned">
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
                    {/* THIS IS THE FIX: The addon name is now a clickable link */}
                    {addon.link ? (
                      <a
                        href={addon.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {addon.name}
                      </a>
                    ) : (
                      addon.name
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {requiredItems.length > 0 && (
            <div className="sidebar-widget-redesigned">
              <h2 className="widget-title-redesigned">Required Items</h2>
              <ul className="list-text-only">
                {requiredItems.map((item, index) => (
                  <li key={index}>
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.name}
                      </a>
                    ) : (
                      item.name
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
        </div>
      </div>

      {/* Guide Footer Section */}
      <div className="guide-footer-redesigned">
        <div className="sidebar-widget-redesigned">
          <h2 className="widget-title-redesigned">Guide Details</h2>
          <div className="author-info-redesigned">
            <Image
              src={guide.author.imageUrl || "/images/default-avatar.png"}
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
          </div>
        </div>
      </div>
    </div>
  );
}
