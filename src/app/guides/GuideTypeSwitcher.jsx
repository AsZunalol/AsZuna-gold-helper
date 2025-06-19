// src/app/guides/GuideTypeSwitcher.jsx
"use client"; // Mark this file as a client component

import { useRouter } from "next/navigation"; // Import useRouter
import styles from "./guidesPage.module.css"; // Import styles

export default function GuideTypeSwitcher({
  currentType,
  currentSort,
  currentCategory,
}) {
  const router = useRouter();

  const handleTypeChange = (newType) => {
    const params = new URLSearchParams();
    params.set("type", newType);
    params.set("sort", currentSort);
    if (currentCategory) {
      params.set("category", currentCategory);
    }
    router.push(`/guides?${params.toString()}`);
  };

  return (
    <>
      <button
        onClick={() => handleTypeChange("gold")}
        className={
          currentType === "gold" ? styles.activeTypeButton : styles.typeButton
        }
      >
        Gold Guides
      </button>
      <button
        onClick={() => handleTypeChange("transmog")}
        className={
          currentType === "transmog"
            ? styles.activeTypeButton
            : styles.typeButton
        }
      >
        Transmog Guides
      </button>
    </>
  );
}
