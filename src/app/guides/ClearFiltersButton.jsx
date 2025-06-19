// src/app/guides/ClearFiltersButton.jsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styles from "./guidesPage.module.css"; // Import styles
import { XCircle } from "lucide-react"; // Import a suitable icon

export default function ClearFiltersButton() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Determine if any filter/sort parameters are currently active
  const hasActiveFilters = searchParams.toString().length > 0;

  const handleClearFilters = () => {
    // Navigate back to the base guides URL, which clears all search parameters
    router.push("/guides");
  };

  // Only render the button if there are active filters/sorts
  if (!hasActiveFilters) {
    return null;
  }

  return (
    <button
      onClick={handleClearFilters}
      className={styles.clearFiltersButton}
      title="Clear all filters and reset sorting"
    >
      <XCircle size={18} />
      <span>Clear Filters</span>
    </button>
  );
}
