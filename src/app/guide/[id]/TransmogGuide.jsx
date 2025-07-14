// src/app/guide/[id]/TransmogGuide.jsx

"use client";

import Image from "next/image";
import ItemPrices from "@/components/ItemPrices/ItemPrices";
import { Suspense, useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Spinner from "@/components/ui/spinner";
import { ClipboardCopy, Check, Eye } from "lucide-react";
import GuideMapImage from "@/components/GuideMapImage/GuideMapImage";
import styles from "./transmog-guide.module.css";

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
      <h1 className={styles.guideTitle}>{guide.title}</h1>
      {guide.youtube_video_id && (
        <div className={styles.videoWrapper}>
          <iframe
            className={styles.youtubeVideo}
            src={`https://www.youtube-nocookie.com/embed/${guide.youtube_video_id}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      <div
        className={styles.guideContent}
        dangerouslySetInnerHTML={{ __html: guide.description || "" }}
      />

      <div className={styles.sidebarGroup}>
        {itemsWithPrices.length > 0 && (
          <div className={styles.sidebarWidget}>
            <h2>Items of Note</h2>
            <Suspense fallback={<Spinner />}>
              <ItemPrices
                items={itemsWithPrices}
                realm={session?.user?.realm}
              />
            </Suspense>
          </div>
        )}

        {guide.map_image_url && (
          <div className={styles.sidebarWidget}>
            <h2>Route Map</h2>
            <GuideMapImage imageUrl={guide.map_image_url} />
          </div>
        )}

        {guide.tsm_import_string && (
          <div className={styles.sidebarWidget}>
            <h2>TSM Group String</h2>
            <textarea
              className={styles.tsmTextarea}
              value={guide.tsm_import_string}
              readOnly
            />
          </div>
        )}

        {recommendedAddons.length > 0 && (
          <div className={styles.sidebarWidget}>
            <h2>Recommended Addons</h2>
            <ul>
              {recommendedAddons.map((addon, idx) => (
                <li key={idx}>
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

        {guide.macro_string && (
          <div className={styles.sidebarWidget}>
            <h2>Helpful Macro</h2>
            <textarea
              className={styles.tsmTextarea}
              value={guide.macro_string}
              readOnly
            />
          </div>
        )}
      </div>

      <div className={styles.footerSection}>
        <div className={styles.authorInfo}>
          <Image
            src={guide.author?.imageUrl || "/images/default-avatar.png"}
            alt="Author Avatar"
            width={48}
            height={48}
            className={styles.authorAvatar}
          />
          <div>
            <p>
              <strong>By:</strong> {guide.author?.username}
            </p>
            <p>
              <strong>Category:</strong> {guide.category}
            </p>
            <p>
              <strong>Expansion:</strong> {guide.expansion}
            </p>
            <p>
              <strong>Updated:</strong>{" "}
              {new Date(guide.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
