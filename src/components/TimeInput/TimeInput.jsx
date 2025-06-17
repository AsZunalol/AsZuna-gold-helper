"use client";

import React from "react";

export default function TimeInput({ value, onChange }) {
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/\D/g, "");

    if (numericValue === "") {
      onChange("");
    } else {
      const plural = parseInt(numericValue, 10) === 1 ? "minute" : "minutes";
      onChange(`${numericValue} ${plural}`);
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleInputChange}
      placeholder="e.g., 30 minutes"
      style={{
        width: "100%",
        padding: "0.85rem 1rem",
        backgroundColor: "var(--color-background)",
        border: "1px solid #333",
        borderRadius: "5px",
        color: "var(--color-text-main)",
        fontSize: "1rem",
      }}
    />
  );
}
