// src/app/guides/SearchFilter.jsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import debounce from "lodash.debounce"; // Import debounce
import styles from "./guidesPage.module.css"; // Import styles
import { Search } from "lucide-react"; // Assuming you have lucide-react installed for icons

export default function SearchFilter({
  currentSearch,
  currentType,
  currentSort,
  currentCategory,
  currentExpansion,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState(currentSearch);

  // Debounced function to update the URL
  const updateSearchParam = useCallback(
    debounce((newSearchTerm) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newSearchTerm) {
        params.set("search", newSearchTerm);
      } else {
        params.delete("search");
      }

      // Preserve other existing params
      params.set("type", currentType);
      params.set("sort", currentSort);
      if (currentCategory) {
        params.set("category", currentCategory);
      }
      if (currentExpansion) {
        params.set("expansion", currentExpansion);
      }

      router.push(`/guides?${params.toString()}`);
    }, 300), // Debounce for 300ms
    [
      currentType,
      currentSort,
      currentCategory,
      currentExpansion,
      searchParams,
      router,
    ]
  );

  // Handle input change
  const handleChange = (e) => {
    setInputValue(e.target.value);
    updateSearchParam(e.target.value);
  };

  // Keep internal state in sync with external searchParam (e.g., if cleared by another filter)
  useEffect(() => {
    if (currentSearch !== inputValue) {
      setInputValue(currentSearch);
    }
  }, [currentSearch]);

  return (
    <div className={styles.searchInputContainer}>
      <Search size={20} className={styles.searchIcon} />
      <input
        type="text"
        placeholder="Search guides (title, description, tags...)"
        value={inputValue}
        onChange={handleChange}
        className={styles.searchInput}
      />
    </div>
  );
}
