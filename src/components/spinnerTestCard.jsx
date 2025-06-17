import React from "react";
import Spinner from "@/components/ui/Spinner";

export default function SpinnerTestCard() {
  return (
    <div
      style={{
        height: "200px",
        backgroundColor: "#1a1a2a",
        borderRadius: "1rem",
        boxShadow: "0 0 12px #00ffaa33",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "1rem",
        flexDirection: "column",
      }}
    >
      <div role="status" aria-label="Loading...">
        <Spinner size={50} />
        <span
          style={{
            marginTop: "0.75rem",
            display: "block",
            fontSize: "0.875rem",
            color: "rgba(128, 128, 128, 0.3)",
          }}
        >
          Loading...
        </span>
      </div>
    </div>
  );
}
