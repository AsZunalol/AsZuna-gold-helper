// src/app/guide/[id]/TransmogGuide.jsx

"use client";

import Image from "next/image";
import ItemPrices from "@/components/ItemPrices/ItemPrices";
import { Suspense, useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react"; // Import useSession hook
import Spinner from "@/components/ui/spinner";
import { ClipboardCopy, Check, Eye } from "lucide-react";
import GuideMapImage from "@/components/GuideMapImage/GuideMapImage";
import styles from "./transmog-guide.module.css";

// Helper function to ensure a URL is absolute
const ensureAbsoluteUrl = (url) => {
  if (!url || url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
};

// Reusable modal component for displaying and copying strings
const StringModal = ({ title, stringValue, onClose }) => {
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef(null);

  const handleCopy = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
      try {
        document.execCommand("copy");
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  };

  return (
    <div className={styles.stringModalOverlay} onClick={onClose}>
      <div
        className={styles.stringModalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles.widgetTitleRedesigned}>{title}</h3>
        <textarea
          ref={textareaRef}
          className={styles.stringModalTextarea}
          value={stringValue}
          readOnly
        />
        <div className={styles.stringModalActions}>
          <button onClick={handleCopy} className={styles.copyButton}>
            {isCopied ? (
              <>
                <Check size={16} /> Copied
              </>
            ) : (
              <>
                <ClipboardCopy size={16} /> Copy to Clipboard
              </>
            )}
          </button>
          <button onClick={onClose} className={styles.closeButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function TransmogGuide({ guide }) {
  const { data: session } = useSession();
  const [tsmModalOpen, setTsmModalOpen] = useState(false);
  const [macroModalOpen, setMacroModalOpen] = useState(false);
  const [itemsWithPrices, setItemsWithPrices] = useState([]);

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
  const recommendedAddons = parseJsonField(guide.recommended_addons);

  useEffect(() => {
    async function fetchPrices() {
      const enriched = await Promise.all(
        itemsOfNote.map(async (item) => {
          try {
            const res = await fetch(
              `/api/blizzard/item-price?itemId=${item.id}&region=eu&realmSlug=${session?.user?.realm}`
            );
            const data = await res.json();
            return {
              ...item,
              serverPrice: data.serverPrice || null,
              regionalAveragePrice: data.regionalAveragePrice || null,
            };
          } catch (err) {
            console.error("Failed to fetch item price:", item.id, err);
            return item;
          }
        })
      );
      setItemsWithPrices(enriched);
    }

    if (itemsOfNote.length > 0 && session?.user?.realm) {
      fetchPrices();
    }
  }, [itemsOfNote, session?.user?.realm]);

  return (
    <div className={styles.guidePageWrapper}>
      <div className={styles.guideLayoutGrid}>
        <div className={styles.mainContentRedesigned}>
          <div className={styles.contentBgRedesigned}>
            <div
              className={styles.guideContentRedesigned}
              dangerouslySetInnerHTML={{ __html: guide.description || "" }}
            />
          </div>
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
        </div>

        <div className={styles.sidebarRedesigned}>
          {itemsWithPrices.length > 0 && (
            <div className={styles.sidebarWidgetRedesigned}>
              <h2 className={styles.widgetTitleRedesigned}>Items of Note</h2>
              <Suspense fallback={<Spinner />}>
                <ItemPrices
                  items={itemsWithPrices}
                  realm={session?.user?.realm}
                />
              </Suspense>
            </div>
          )}
          {guide.map_image_url && (
            <div className={styles.sidebarWidgetRedesigned}>
              <h2 className={styles.widgetTitleRedesigned}>Route Map</h2>
              <GuideMapImage imageUrl={guide.map_image_url} />
            </div>
          )}
          {guide.tsm_import_string && (
            <div className={styles.sidebarWidgetRedesigned}>
              <h2 className={styles.widgetTitleRedesigned}>TSM Group String</h2>
              <p className={styles.widgetDescription}>
                Click the button below to view and copy the TSM import string.
              </p>
              <button
                onClick={() => setTsmModalOpen(true)}
                className={styles.viewStringButton}
              >
                <Eye size={16} /> View TSM String
              </button>
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
            <div className={styles.sidebarWidgetRedesigned}>
              <h2 className={styles.widgetTitleRedesigned}>Helpful Macro</h2>
              <p className={styles.widgetDescription}>
                Click the button below to view and copy the helpful macro.
              </p>
              <button
                onClick={() => setMacroModalOpen(true)}
                className={styles.viewStringButton}
              >
                <Eye size={16} /> View Macro
              </button>
            </div>
          )}
        </div>
      </div>

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

      {tsmModalOpen && (
        <StringModal
          title="TSM Import String"
          stringValue={guide.tsm_import_string}
          onClose={() => setTsmModalOpen(false)}
        />
      )}
      {macroModalOpen && (
        <StringModal
          title="Helpful Macro"
          stringValue={guide.macro_string}
          onClose={() => setMacroModalOpen(false)}
        />
      )}
    </div>
  );
}
