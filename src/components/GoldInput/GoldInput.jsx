"use client";

import React from "react";

export default function GoldInput({ value, onChange }) {
  const handleInputChange = (e) => {
    // Get the current input value
    const inputValue = e.target.value;

    // Remove all non-digit characters
    const numericValue = inputValue.replace(/\D/g, "");

    // If the result is an empty string, pass that up to clear the field
    if (numericValue === "") {
      onChange("");
    } else {
      // Otherwise, format the string and pass it to the parent state
      onChange(`${numericValue}k Gold`);
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleInputChange}
      placeholder="e.g., 50k Gold"
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
