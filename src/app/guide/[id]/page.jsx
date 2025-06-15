// src/app/guide/[id]/page.jsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import ItemPrices from "@/components/ItemPrices";
import GuideCategory from "@/components/GuideCategory";
import MapImageModal from "@/components/MapImageModal";
import "./guide.css";
import "../../../components/map-image-modal.css";

import { WOW_EXPANSIONS, WOW_CLASSES } from "@/lib/constants";

async function Page({ params }) {
  const safeParse = (value, defaultValue = []) => {
    if (!value || value === "undefined") return defaultValue;
    try {
      return typeof value === "string" ? JSON.parse(value) : value;
    } catch (e) {
      console.error("Error parsing JSON:", e);
      return defaultValue;
    }
  };

  const guide = await prisma.guide.findUnique({
    where: { id: parseInt(params.id) },
    select: {
      id: true,
      title: true,
      category: true,
      expansion: true,
      thumbnail_url: true,
      recommended_class: true,
      gold_pr_hour: true,
      time_to_complete: true,
      description: true,
      youtube_video_id: true,
      tsm_import_string: true,
      route_string: true,
      map_image_path: true,
      steps: true,
      required_items: true,
      addons: true,
      tags: true,
      slider_images: true,
      items_of_note: true,
    },
  });

  if (!guide) notFound();

  console.log("RAW guide.items_of_note:", guide.items_of_note);

  const itemsOfNote = safeParse(guide.items_of_note);
  console.log(
    "DEBUG - itemsOfNote:",
    itemsOfNote,
    "Type:",
    typeof itemsOfNote,
    "Length:",
    itemsOfNote?.length
  );
  const hasVisibleItems =
    Array.isArray(itemsOfNote) &&
    itemsOfNote.some((item) => typeof item === "string" && item.trim() !== "");

  const steps = safeParse(guide.steps);
  const requiredItems = safeParse(guide.required_items);
  const addons = safeParse(guide.addons);
  const tags = guide.tags ? guide.tags.split(",").map((tag) => tag.trim()) : [];
  const sliderImages = safeParse(guide.slider_images);

  return (
    <>
      <div className="guide-outer">
        <div className="guide-container">
          <div className="thumbnail-wrapper">
            <div className="thumbnail-card">
              <GuideCategory category={guide.category} />
              {guide.thumbnail_url && (
                <Image
                  src={guide.thumbnail_url}
                  alt="Guide Thumbnail"
                  width={1200}
                  height={300}
                  className="thumbnail-img"
                />
              )}
              <div className="thumbnail-overlay-box">
                <div className="thumbnail-overlay-content">
                  <h1 className="guide-title-overlay">{guide.title}</h1>
                  {(() => {
                    const exp = WOW_EXPANSIONS.find(
                      (e) => e.name === guide.expansion
                    );
                    const color = exp?.color || "#fff";
                    return (
                      <p className="guide-expansion" style={{ color }}>
                        Expansion – {guide.expansion}
                      </p>
                    );
                  })()}
                  {tags.length > 0 && (
                    <div className="guide-tags-container">
                      <div className="guide-tags-inline">
                        {tags.map((tag, i) => (
                          <span
                            key={`${tag}-${i}`}
                            className={`guide-tag-pill ${
                              i > 0 ? "guide-tag-hidden" : ""
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="recommended-classes-button">
                <button className="dropdown-toggle">
                  🎯 Recommended Classes
                </button>
                <div className="recommended-classes-dropdown">
                  <div className="class-badges">
                    {guide.recommended_class.split(",").map((cls, i) => {
                      const classColor =
                        WOW_CLASSES[cls.trim()]?.color || "#ccc";
                      return (
                        <span
                          key={`class-${i}`}
                          className="class-pill"
                          style={{ backgroundColor: classColor }}
                        >
                          {cls.trim()}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="thumbnail-bottomright">
                <div className="info-box">
                  <span className="label">💰 Gold/hr:</span>
                  <span className="value">{guide.gold_pr_hour}</span>
                </div>
                <div className="info-box">
                  <span className="label">⏱️ Time:</span>
                  <span className="value">{guide.time_to_complete}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="guide-layout">
            <div className="guide-content">
              {guide.description && (
                <p className="guide-description">{guide.description}</p>
              )}

              {guide.youtube_video_id && (
                <div className="video-wrapper">
                  <iframe
                    width="100%"
                    height="400"
                    src={`https://www.youtube.com/embed/${guide.youtube_video_id}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              {sliderImages.length > 0 && (
                <div className="image-slider">
                  <h3>Gallery</h3>
                  <div className="slider-grid">
                    {sliderImages.map((img, idx) => (
                      <Image
                        key={`slide-${idx}`}
                        src={img}
                        alt={`Slide ${idx + 1}`}
                        width={400}
                        height={250}
                      />
                    ))}
                  </div>
                </div>
              )}

              {guide.tsm_import_string && (
                <div className="tsm-string">
                  <h3>TSM Import String</h3>
                  <pre>{guide.tsm_import_string}</pre>
                </div>
              )}

              {guide.route_string && (
                <div className="route-string">
                  <h3>GatherMate2 Route String</h3>
                  <pre>{guide.route_string}</pre>
                </div>
              )}

              {requiredItems.length > 0 && (
                <div className="required-items">
                  <h3>Required Items</h3>
                  <ul>
                    {requiredItems.map((item, i) => (
                      <li key={`req-${i}`}>
                        {typeof item === "string" ? item : JSON.stringify(item)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {addons.length > 0 && (
                <div className="addons">
                  <h3>Recommended Addons</h3>
                  <ul>
                    {addons.map((addon, i) => (
                      <li key={`addon-${i}`}>
                        {typeof addon === "string"
                          ? addon
                          : JSON.stringify(addon)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {steps.length > 0 && (
                <div className="guide-steps">
                  <h2>Steps</h2>
                  <ol>
                    {steps.map((step, index) => (
                      <li
                        key={`step-${index}`}
                        dangerouslySetInnerHTML={{ __html: step.content }}
                      ></li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            <aside className="guide-right-panel">
              <div className="map-section">
                <h3>Map Image</h3>
                <MapImageModal src={guide.map_image_path} />
              </div>

              {hasVisibleItems && (
                <div className="map-notes-box">
                  <h4>Items of Note</h4>
                  <ul>
                    {itemsOfNote.map((item, index) => (
                      <li key={`item-${index}`}>
                        {typeof item === "string" ? item : JSON.stringify(item)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

export default Page;
