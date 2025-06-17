"use client";
import React from "react";
import PriceHistoryChart from "./PriceHistoryChart";

export default function PriceHistoryCardWrapper() {
  return (
    <div style={{ width: "100%", padding: "1rem" }}>
      <h3
        style={{
          fontSize: "1.125rem",
          fontWeight: "600",
          marginBottom: "1rem",
        }}
      >
        Item Price History (Chart)
      </h3>
      <PriceHistoryChart itemId={19019} region="eu" realmSlug="kazzak" />
    </div>
  );
}
