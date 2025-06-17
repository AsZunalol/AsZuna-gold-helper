"use client";

import { WOW_CLASSES } from "@/lib/constants";

export default function ClassSelect({ selectedClass, setSelectedClass }) {
  const selectedColor = WOW_CLASSES[selectedClass]?.color || "#A0A0A0";

  return (
    <select
      value={selectedClass}
      onChange={(e) => setSelectedClass(e.target.value)}
      style={{
        backgroundColor: "var(--color-background)",
        border: "1px solid #333",
        borderRadius: "5px",
        padding: "0.85rem 1rem",
        color: selectedColor,
        width: "100%",
        fontSize: "1rem",
        fontWeight: "bold",
      }}
    >
      <option value="" disabled>
        Select a class...
      </option>
      {Object.values(WOW_CLASSES).map((cls) => (
        <option
          key={cls.name}
          value={cls.name}
          style={{
            color: cls.color,
            backgroundColor: "var(--color-background)",
          }}
        >
          {cls.name}
        </option>
      ))}
    </select>
  );
}
