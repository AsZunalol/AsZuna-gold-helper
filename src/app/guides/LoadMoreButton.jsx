// src/app/guides/LoadMoreButton.jsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styles from "./guidesPage.module.css"; // Import styles

export default function LoadMoreButton({
  currentPage,
  hasMore,
  currentType,
  currentSort,
  currentCategory,
  currentExpansion,
  currentSearch,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", nextPage.toString());

    // Preserve all existing filter/sort params
    params.set("type", currentType);
    params.set("sort", currentSort);
    if (currentCategory) {
      params.set("category", currentCategory);
    }
    if (currentExpansion) {
      params.set("expansion", currentExpansion);
    }
    if (currentSearch) {
      params.set("search", currentSearch);
    }

    router.push(`/guides?${params.toString()}`);
  };

  if (!hasMore) {
    return null; // Don't render the button if there are no more guides
  }

  return (
    <div className={styles.loadMoreContainer}>
      <button
        onClick={handleLoadMore}
        className={styles.loadMoreButton}
        disabled={!hasMore}
      >
        Load More Guides
      </button>
    </div>
  );
}
