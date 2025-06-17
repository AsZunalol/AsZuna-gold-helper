import React from "react";
import styles from "../MonitoringGrid/MonitoringGrid.module.css";

export default function ApiLogsCard({ logs }) {
  const filteredLogs = logs.filter(
    (log) =>
      log.message.includes("Fetched price for") ||
      log.message.includes("Failed to fetch price for")
  );

  return (
    <div className={`${styles.cardData} ${styles.cardStyled}`}>
      <h3 className={styles.cardTitle}>API Logs</h3>
      <ul
        className={styles.cardBody}
        style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}
      >
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log, index) => (
            <li key={index} style={{ marginBottom: "0.5rem" }}>
              <strong>{log.time}</strong>: {log.message}
            </li>
          ))
        ) : (
          <li style={{ opacity: 0.6 }}>No pricing logs available.</li>
        )}
      </ul>
    </div>
  );
}
