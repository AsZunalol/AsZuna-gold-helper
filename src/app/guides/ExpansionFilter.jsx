// src/app/guides/ExpansionFilter.jsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { WOW_EXPANSIONS } from "@/lib/constants"; // Import WOW_EXPANSIONS
import styles from "./guidesPage.module.css"; // Import styles

export default function ExpansionFilter({
  currentExpansion,
  currentType,
  currentSort,
  currentCategory,
}) {
  const router = useRouter();
  const searchParams = useSearchParams(); // Use useSearchParams to get current params

  const handleChange = (e) => {
    const newExpansion = e.target.value;
    const params = new URLSearchParams(searchParams.toString()); // Start with current params

    if (newExpansion === "all") {
      params.delete("expansion"); // Remove expansion param if 'All' is selected
    } else {
      params.set("expansion", newExpansion);
    }

    // Preserve other existing params
    params.set("type", currentType);
    params.set("sort", currentSort);
    if (currentCategory) {
      params.set("category", currentCategory);
    }

    router.push(`/guides?${params.toString()}`);
  };

  return (
    <select
      value={currentExpansion || "all"} // Set default or current selected expansion
      onChange={handleChange}
      className={styles.sortRowSelect} // Reusing the select style from sortRow
      suppressHydrationWarning // Suppress warning for initial mismatch
    >
      <option value="all">All Expansions</option>
      {WOW_EXPANSIONS.map((exp) => (
        <option key={exp.name} value={exp.name}>
          {exp.name}
        </option>
      ))}
    </select>
  );
}
