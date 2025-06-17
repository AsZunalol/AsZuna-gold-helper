import React from "react";

export default function Spinner({ size = 50, color = "#00ffaa" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      role="presentation"
      style={{
        display: "block",
        margin: "0 auto",
        opacity: 1,
        transition: "opacity 0.3s ease-in",
        animation: "spin 2s linear infinite",
      }}
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="100,140"
        strokeDashoffset="0"
      />
    </svg>
  );
}
