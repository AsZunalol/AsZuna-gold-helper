// src/app/guides/CategoryFilter.jsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styles from "./guidesPage.module.css"; // Assuming shared styles

export default function CategoryFilter({
  availableCategories,
  currentCategory,
  currentType,
  currentSort,
  currentExpansion,
  currentSearch,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (newCategory) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newCategory === "all") {
      params.delete("category"); // Remove category param if 'All Categories' is selected
    } else {
      params.set("category", newCategory);
    }

    // Preserve other existing params
    params.set("type", currentType);
    params.set("sort", currentSort);
    if (currentExpansion) {
      params.set("expansion", currentExpansion);
    }
    if (currentSearch) {
      params.set("search", currentSearch);
    }

    router.push(`/guides?${params.toString()}`);
  };

  return (
    <div className={styles.categoryFilterContainer}>
      <button
        onClick={() => handleCategoryChange("all")}
        className={
          currentCategory === null || currentCategory === "all"
            ? styles.activeCategoryButton
            : styles.categoryButton
        }
      >
        All Categories
      </button>
      {availableCategories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryChange(category)}
          className={
            currentCategory === category
              ? styles.activeCategoryButton
              : styles.categoryButton
          }
        >
          {category}
        </button>
      ))}
    </div>
  );
}
