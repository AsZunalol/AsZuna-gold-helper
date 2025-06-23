// src/app/guide/[id]/NormalGuide.jsx

"use client";

import { Suspense } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react"; // Import useSession hook
import MapImageModal from "@/components/map-image-modal/MapImageModal";
import ItemPrices from "@/components/ItemPrices/ItemPrices";
import Spinner from "@/components/ui/spinner";
import styles from "./transmog-guide.module.css"; // Use the same modern stylesheet

export default function NormalGuide({ guide }) {
  const { data: session } = useSession(); // Get the session data

  const parseJsonField = (fieldValue, defaultValue = []) => {
    if (typeof fieldValue === "string") {
      try {
        const parsed = JSON.parse(fieldValue);
        return parsed || defaultValue;
      } catch (e) {
        return defaultValue;
      }
    }
    return fieldValue || defaultValue;
  };

  const itemsOfNote = parseJsonField(guide.items_of_note, []);
  const steps = parseJsonField(guide.steps, []);
  const recommendedAddons = parseJsonField(guide.recommended_addons, []);
  const sliderImages = parseJsonField(guide.slider_images, []);
  const mapCoordinates = parseJsonField(guide.route_string, []);
  const requiredItems = parseJsonField(guide.required_items, []);
  const recommendedClasses = guide.recommended_class
    ? guide.recommended_class.split(",")
    : [];

  return (
    <div className={styles.guidePageWrapper}>
      <div className={styles.guideLayoutGrid}>
        {/* Main Content Area */}
        <div className={styles.mainContentRedesigned}>
          <div className={styles.contentBgRedesigned}>
            <h2 className={styles.widgetTitleRedesigned}>Description</h2>
            <div
              className={styles.guideContentRedesigned}
              dangerouslySetInnerHTML={{ __html: guide.description || "" }}
            />
          </div>

          {steps.length > 0 && (
            <div className={styles.contentBgRedesigned}>
              <h2 className={styles.widgetTitleRedesigned}>Steps</h2>
              <ol className="list-decimal pl-5 mt-4 space-y-4">
                {steps.map((step, index) => (
                  <li
                    key={index}
                    className="pl-2"
                    dangerouslySetInnerHTML={{ __html: step.content || "" }}
                  />
                ))}
              </ol>
            </div>
          )}

          {guide.youtube_video_id && (
            <div className={styles.guideVideoRedesigned}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${guide.youtube_video_id}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}

          {sliderImages.length > 0 && (
            <div className={styles.contentBgRedesigned}>
              <h2 className={styles.widgetTitleRedesigned}>Gallery</h2>
              <div className="flex overflow-x-auto gap-4 pb-4">
                {sliderImages.map((src, index) => (
                  <div
                    key={index}
                    className="relative flex-shrink-0 w-80 h-48 rounded-lg overflow-hidden"
                  >
                    <Image
                      src={src}
                      alt={`Guide image ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 320px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebarRedesigned}>
          {guide.map_image_url && mapCoordinates.length > 0 && (
            <div className={styles.sidebarWidgetRedesigned}>
              <h2 className={styles.widgetTitleRedesigned}>Farming Route</h2>
              <MapImageModal
                imageUrl={guide.map_image_url}
                coordinates={mapCoordinates}
              />
            </div>
          )}

          {itemsOfNote.length > 0 && (
            <div className={styles.sidebarWidgetRedesigned}>
              <h2 className={styles.widgetTitleRedesigned}>Items of Note</h2>
              <Suspense fallback={<Spinner />}>
                <ItemPrices items={itemsOfNote} realm={session?.user?.realm} />
              </Suspense>
            </div>
          )}

          {requiredItems.length > 0 && (
            <div className={styles.sidebarWidgetRedesigned}>
              <h2 className={styles.widgetTitleRedesigned}>Required Items</h2>
              <ul className={styles.listTextOnly}>
                {requiredItems.map((item, index) => (
                  <li key={index}>{item.name}</li>
                ))}
              </ul>
            </div>
          )}

          {recommendedAddons.length > 0 && (
            <div className={styles.sidebarWidgetRedesigned}>
              <h2 className={styles.widgetTitleRedesigned}>
                Recommended Addons
              </h2>
              <ul className={styles.listTextOnly}>
                {recommendedAddons.map((addon, index) => (
                  <li key={index}>
                    {addon.url ? (
                      <a
                        href={addon.url}
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

          {guide.tsm_import_string && (
            <div className={styles.sidebarWidgetRedesigned}>
              <h2 className={styles.widgetTitleRedesigned}>TSM Group String</h2>
              <pre className="whitespace-pre-wrap break-all bg-gray-900 p-2 rounded-md text-sm">
                {guide.tsm_import_string}
              </pre>
            </div>
          )}
        </aside>
      </div>

      {/* Footer Section */}
      <div className={styles.footerContent}>
        <h2 className={styles.widgetTitleRedesigned}>Guide Details</h2>
        <div className={styles.authorInfoRedesigned}>
          <Image
            src={guide.author?.imageUrl || "/images/default-avatar.png"}
            alt={guide.author?.username || "Author"}
            width={50}
            height={50}
            className={styles.authorAvatarRedesigned}
          />
          <div className={styles.authorNameRedesigned}>
            <span>By</span>
            <strong>{guide.author?.username}</strong>
          </div>
        </div>
        <div className={styles.guideMetaRedesigned}>
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
  );
}
