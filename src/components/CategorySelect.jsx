"use client";
import { GUIDE_CATEGORIES } from "@/lib/constants";

export default function CategorySelect({
  selectedCategory,
  setSelectedCategory,
}) {
  return (
    <select
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
      className="select-field"
    >
      <option value="" disabled>
        Select a category...
      </option>
      {GUIDE_CATEGORIES.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  );
}
