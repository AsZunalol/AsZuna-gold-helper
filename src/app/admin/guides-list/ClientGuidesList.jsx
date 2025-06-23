// src/app/admin/guides-list/ClientGuidesList.jsx

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { FilePenLine, Trash2, User, Calendar, PlusCircle } from "lucide-react";
import styles from "./guides-list.module.css";
import AddGoldSessionModal from "@/components/AddGoldSessionModal/AddGoldSessionModal"; // Import the new modal

const GuideCard = ({ guide, onSelectDelete, onAddSession }) => {
  const isTransmogGuide = guide.is_transmog || guide.category === "Transmog";
  const editLink = isTransmogGuide
    ? `/admin/edit-transmog-guide/${guide.id}`
    : `/admin/edit-guide/${guide.id}`;

  return (
    <div className={styles.guideCard}>
      <div className={styles.thumbnailContainer}>
        <Image
          src={guide.thumbnail_url || "/images/default-thumb.jpg"}
          alt={guide.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.cardHeader}>
          <h2>{guide.title}</h2>
          <span
            className={`${styles.statusPill} ${
              guide.status === "PUBLISHED" ? styles.published : styles.draft
            }`}
          >
            {guide.status}
          </span>
        </div>
        <div className={styles.cardMeta}>
          <span>{guide.category}</span>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <User size={12} /> {guide.author?.username || "N/A"}
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <Calendar size={12} />{" "}
            {new Date(guide.updatedAt).toLocaleDateString()}
          </div>
        </div>
        <div className={styles.cardFooter}>
          {isTransmogGuide && (
            <button
              onClick={() => onAddSession(guide)}
              className={styles.addSessionButton}
            >
              <PlusCircle size={16} /> Add Session
            </button>
          )}
          <Link href={editLink} className={styles.actionButton}>
            <FilePenLine size={16} /> Edit
          </Link>
          <button
            onClick={() => onSelectDelete(guide.id)}
            className={`${styles.actionButton} ${styles.deleteButton}`}
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ClientGuidesList({ initialPublished, initialDrafts }) {
  const [activeTab, setActiveTab] = useState("published");
  const [guideTypeFilter, setGuideTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [isPending, startTransition] = useTransition();

  const [allGuides, setAllGuides] = useState(() => [
    ...initialPublished,
    ...initialDrafts,
  ]);

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);

  const handleOpenSessionModal = (guide) => {
    setSelectedGuide(guide);
    setIsSessionModalOpen(true);
  };

  const handleUpdateGuideInList = (updatedGuide) => {
    setAllGuides((currentGuides) =>
      currentGuides.map((g) => (g.id === updatedGuide.id ? updatedGuide : g))
    );
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/guides/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.message || "Failed to delete guide.");
      }
      startTransition(() => {
        setAllGuides((prev) => prev.filter((g) => g.id !== id));
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setPendingDeleteId(null);
    }
  };

  const statusFilteredGuides = allGuides.filter((guide) => {
    if (activeTab === "published") return guide.status === "PUBLISHED";
    if (activeTab === "drafts") return guide.status === "DRAFT";
    return true;
  });

  const typeFilteredGuides = statusFilteredGuides.filter((guide) => {
    const isTransmog = guide.is_transmog || guide.category === "Transmog";

    if (guideTypeFilter === "all") return true;
    if (guideTypeFilter === "farming") return !isTransmog;
    if (guideTypeFilter === "transmog") return isTransmog;
    return true;
  });

  const displayedGuides = typeFilteredGuides.filter(
    (g) =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      (g.author?.username || "").toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Manage Guides</h1>
        <div className={styles.filterContainer}>
          <button
            onClick={() => setGuideTypeFilter("all")}
            className={
              guideTypeFilter === "all"
                ? styles.activeFilter
                : styles.filterButton
            }
          >
            All
          </button>
          <button
            onClick={() => setGuideTypeFilter("farming")}
            className={
              guideTypeFilter === "farming"
                ? styles.activeFilter
                : styles.filterButton
            }
          >
            Farming
          </button>
          <button
            onClick={() => setGuideTypeFilter("transmog")}
            className={
              guideTypeFilter === "transmog"
                ? styles.activeFilter
                : styles.filterButton
            }
          >
            Transmog
          </button>
        </div>
        <input
          type="text"
          placeholder="Search guides..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.tabContainer}>
        <button
          onClick={() => setActiveTab("published")}
          className={`${styles.tabButton} ${
            activeTab === "published" ? styles.activeTab : ""
          }`}
        >
          Published ({allGuides.filter((g) => g.status === "PUBLISHED").length})
        </button>
        <button
          onClick={() => setActiveTab("drafts")}
          className={`${styles.tabButton} ${
            activeTab === "drafts" ? styles.activeTab : ""
          }`}
        >
          Drafts ({allGuides.filter((g) => g.status === "DRAFT").length})
        </button>
      </div>

      <div className={styles.tabContent}>
        {displayedGuides.length > 0 ? (
          <div
            className={styles.guidesGrid}
            style={{ opacity: isPending ? 0.6 : 1 }}
          >
            {displayedGuides.map((guide) => (
              <GuideCard
                key={guide.id}
                guide={guide}
                onSelectDelete={setPendingDeleteId}
                onAddSession={handleOpenSessionModal}
              />
            ))}
          </div>
        ) : (
          <p>No {activeTab} guides found for the selected filter.</p>
        )}
      </div>

      {pendingDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-800 text-white p-6 rounded-2xl shadow-xl max-w-md w-full border border-gray-600">
            <h2 className="text-2xl font-bold mb-2">Delete this guide?</h2>
            <p className="text-gray-300 mb-6">
              This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setPendingDeleteId(null)}
                className="px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(pendingDeleteId)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isSessionModalOpen && (
        <AddGoldSessionModal
          guide={selectedGuide}
          onClose={() => setIsSessionModalOpen(false)}
          onUpdate={handleUpdateGuideInList}
        />
      )}
    </div>
  );
}
