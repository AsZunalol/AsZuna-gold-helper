// src/app/guide/[id]/page.jsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import ItemPrices from "@/components/ItemPrices";
import "./guide.css";
import { WOW_EXPANSIONS, WOW_CLASSES } from "@/lib/constants";

async function getGuideById(id) {
  try {
    const guide = await prisma.guide.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          select: {
            username: true,
            email: true,
            id: true,
          },
        },
      },
    });
    return guide;
  } catch (error) {
    console.error(`Failed to fetch guide with ID ${id}:`, error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const guide = await getGuideById((await params).id);

  if (!guide) {
    return {
      title: "Guide Not Found",
      description: "The requested gold guide does not exist.",
    };
  }

  return {
    title: `${guide.title} - AsZuna's Gold Helper`,
    description:
      guide.description?.substring(0, 150) ||
      "Learn gold making strategies for World of Warcraft.",
  };
}

export default async function SingleGuidePage({ params }) {
  const guide = await getGuideById((await params).id);

  if (!guide) {
    notFound();
  }

  let steps = [];
  let itemsOfNote = [];
  let requiredItems = [];
  let addons = [];
  let tags = [];
  let sliderImages = [];

  try {
    steps = guide.steps ? JSON.parse(guide.steps) : [];
    itemsOfNote = guide.itemsOfNote ? JSON.parse(guide.itemsOfNote) : [];
    requiredItems = guide.required_items
      ? JSON.parse(guide.required_items)
      : [];
    addons = guide.addons ? JSON.parse(guide.addons) : [];
    tags = guide.tags ? guide.tags.split(",") : [];
    sliderImages = guide.slider_images ? JSON.parse(guide.slider_images) : [];
  } catch (e) {
    console.error("Error parsing guide content:", e);
  }

  return (
    <>
      <div className="guide-outer">
        <div className="guide-container">
          <div className="thumbnail-wrapper">
            <div className="thumbnail-card">
              {" "}
              {/* This was the main missing/misplaced div */}
              {guide.thumbnail_url && (
                <Image
                  src={guide.thumbnail_url}
                  alt="Guide Thumbnail"
                  width={1200}
                  height={300}
                  className="thumbnail-img"
                />
              )}
              <div className="thumbnail-overlay">
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
                  <div className="guide-tags-inline">
                    {tags.map((tag, i) => (
                      <span key={`${tag}-${i}`} className="guide-tag-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="thumbnail-topright">{guide.category}</div>
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
            </div>{" "}
            {/* end of .thumbnail-card */}
            <div className="recommended-classes-box enhanced-box">
              <p>
                <strong>Recommended Classes:</strong>
              </p>
              <div className="class-badges">
                {guide.recommended_class.split(",").map((cls, i) => {
                  const classColor = WOW_CLASSES[cls.trim()]?.color || "#ccc";
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
          </div>{" "}
          {/* end of .recommended-classes-box */}
          <div className="guide-layout">
            <div className="guide-content">
              {guide.map_image_path && (
                <div className="map-image">
                  <Image
                    src={guide.map_image_path}
                    alt="Map Image"
                    width={800}
                    height={400}
                  />
                </div>
              )}

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

              {itemsOfNote.length > 0 && <ItemPrices items={itemsOfNote} />}
            </div>{" "}
            {/* end of .guide-content */}
          </div>{" "}
          {/* end of .guide-layout */}
        </div>{" "}
        {/* end of .guide-container */}
      </div>{" "}
      {/* end of .guide-outer */}
    </>
  );
}
