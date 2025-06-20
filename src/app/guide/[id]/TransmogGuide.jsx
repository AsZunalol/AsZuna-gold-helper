"use client";

import Image from "next/image";
import ItemPrices from "@/components/ItemPrices/ItemPrices";
import { Suspense, useState } from "react";
import Spinner from "@/components/ui/spinner";
import { WOW_EXPANSIONS } from "@/lib/constants";
import { ClipboardCopy, Check } from "lucide-react";
import GuideMapImage from "@/components/GuideMapImage/GuideMapImage";
import styles from "./transmog-guide.module.css";

// Helper function to ensure a URL is absolute
const ensureAbsoluteUrl = (url) => {
  if (!url || url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
};

export default function TransmogGuide({ guide }) {
  const [showAllTags, setShowAllTags] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Helper to safely parse JSON or return empty array/object
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

  const handleCopyMacro = () => {
    if (guide.macro_string && !isCopied) {
      navigator.clipboard
        .writeText(guide.macro_string)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy macro: ", err);
        });
    }
  };

  const itemsOfNote = parseJsonField(guide.items_of_note);
  const recommendedAddons = parseJsonField(guide.recommended_addons);
  const goldSessions = parseJsonField(guide.gold_sessions, []);

  const averageGph =
    goldSessions.length > 0
      ? Math.round(
          (goldSessions.reduce((sum, s) => sum + (s.gold || 0), 0) /
            goldSessions.reduce((sum, s) => sum + (s.minutes || 0), 0)) *
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
    <div className={styles.guideContainerRedesigned}>
      <div className={styles.thumbnailWrapper}>
        <div className={styles.thumbnailCard}>
          <Image
            src={guide.thumbnail_url || "/images/default-thumb.jpg"}
            alt="Guide Thumbnail"
            width={1200}
            height={300}
            className={styles.thumbnailImg}
            priority
          />
          <div className={styles.thumbnailTopleft}>
            <span>{guide.category}</span>
          </div>
          <div className={styles.thumbnailBottomright}>
            <span>{averageGph.toLocaleString()} GPH</span>
          </div>
          <div className={styles.thumbnailOverlayBox}>
            <div className={styles.thumbnailOverlayContent}>
              <h1 className={styles.guideTitleOverlay}>
                {guide.title || "Untitled Guide"}
              </h1>
              {expansionInfo && (
                <p
                  className={styles.guideExpansion}
                  style={{ color: expansionInfo.color }}
                >
                  Expansion – {guide.expansion}
                </p>
              )}
              {allTags.length > 0 && (
                <div
                  className={`${styles.tagListWrapper} ${
                    showAllTags ? styles.expanded : ""
                  }`}
                >
                  <div className={styles.tagsDisplay}>
                    {displayedTags.map((tag) => (
                      <span key={tag} className={styles.tagPill}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  {!showAllTags && allTags.length > 3 && (
                    <div className={styles.tagsFadeOverlay}></div>
                  )}
                </div>
              )}
              {allTags.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllTags(!showAllTags)}
                  className={styles.tagsToggleButton}
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

      <div className={styles.guideLayoutRedesigned}>
        <div className={styles.mainContentRedesigned}>
          {guide.youtube_video_id && (
            <div className={styles.guideVideoRedesigned}>
              <iframe
                src={`https://www.youtube.com/embed/${guide.youtube_video_id}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}

          <div className={styles.contentBgRedesigned}>
            <div
              className={styles.guideContentRedesigned}
              dangerouslySetInnerHTML={{ __html: guide.description || "" }}
            />
          </div>
        </div>

        <div className={styles.sidebarRedesigned}>
          {itemsOfNote && itemsOfNote.length > 0 && (
            <div className={styles.sidebarWidgetRedesigned}>
              <h2 className={styles.widgetTitleRedesigned}>Items of Note</h2>
              <div className={styles.itemsOfNoteRedesigned}>
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

          {guide.map_image_url && (
            <div className={styles.sidebarWidgetRedesigned}>
              <h2 className={styles.widgetTitleRedesigned}>Route Map</h2>
              <GuideMapImage imageUrl={guide.map_image_url} />
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
                        href={ensureAbsoluteUrl(addon.url)}
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

          {guide.macro_string && (
            <div
              className={styles.sidebarWidgetRedesigned}
              style={{ position: "relative" }}
            >
              <h2 className={styles.widgetTitleRedesigned}>Helpful Macro</h2>
              <button
                onClick={handleCopyMacro}
                className={`${styles.copyMacroButton} ${
                  isCopied ? styles.copied : ""
                }`}
                title={isCopied ? "Copied!" : "Copy macro"}
                disabled={isCopied}
              >
                {isCopied ? <Check size={16} /> : <ClipboardCopy size={16} />}
              </button>
              <pre className={styles.codeBlock}>{guide.macro_string}</pre>
            </div>
          )}
        </div>
      </div>

      <div className={styles.guideFooterRedesigned}>
        <div className={styles.sidebarWidgetRedesigned}>
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
    </div>
  );
}
