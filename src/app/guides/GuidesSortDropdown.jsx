// src/app/guides/GuidesSortDropdown.jsx

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styles from "./guidesPage.module.css"; // Import styles for consistency

export default function GuidesSortDropdown({ type, category, sort }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    // These lines are already implicitly handled by searchParams.toString(),
    // but keeping them explicit for clarity if you were to modify how params are built.
    // if (type) params.set("type", type);
    // if (category) params.set("category", category);
    router.push(`/guides?${params.toString()}`);
  };

  return (
    <select
      defaultValue={sort}
      onChange={handleChange}
      className={styles.sortRowSelect} // Apply consistent styling
      suppressHydrationWarning
    >
      <option value="latest">Latest</option>
      <option value="title">Title A-Z</option>
      <option value="gph_desc">Gold per Hour (High to Low)</option>{" "}
      {/* New option */}
      <option value="gph_asc">Gold per Hour (Low to High)</option>{" "}
      {/* New option */}
    </select>
  );
}
