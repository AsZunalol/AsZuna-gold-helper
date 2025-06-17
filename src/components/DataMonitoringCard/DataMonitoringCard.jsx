import React from "react";
import styles from "../MonitoringGrid/MonitoringGrid.module.css";

export default function DataMonitoringCard({ lastUpdate, nextUpdate }) {
  return (
    <div className={`${styles.cardData} ${styles.cardStyled}`}>
      <h3
        style={{
          fontSize: "1.125rem",
          fontWeight: "600",
          marginBottom: "0.5rem",
        }}
      >
        Price Update Status
      </h3>
      <div style={{ fontSize: "0.875rem", lineHeight: "1.5", color: "#ccc" }}>
        <p>
          <strong>Last Update:</strong> {lastUpdate}
        </p>
        <p>
          <strong>Next Update:</strong> {nextUpdate}
        </p>
      </div>
    </div>
  );
}
