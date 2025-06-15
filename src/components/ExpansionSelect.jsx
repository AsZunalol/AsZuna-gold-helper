"use client";
import { WOW_EXPANSIONS } from "@/lib/constants";

export default function ExpansionSelect({
  selectedExpansion,
  setSelectedExpansion,
}) {
  const selectedColor =
    WOW_EXPANSIONS.find((exp) => exp.name === selectedExpansion)?.color ||
    "var(--color-text-main)";

  return (
    <select
      value={selectedExpansion}
      onChange={(e) => setSelectedExpansion(e.target.value)}
      className="select-field"
      style={{
        color: selectedColor,
        fontWeight: "bold",
        borderColor:
          selectedColor !== "var(--color-text-main)" ? selectedColor : "#333",
      }}
    >
      <option value="" disabled>
        Select an expansion...
      </option>
      {WOW_EXPANSIONS.map((exp) => (
        <option
          key={exp.name}
          value={exp.name}
          style={{
            color: exp.color,
            backgroundColor: "var(--color-background)",
            fontWeight: "bold",
          }}
        >
          {exp.name}
        </option>
      ))}
    </select>
  );
}
