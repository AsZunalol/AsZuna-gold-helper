import React, { useEffect, useState } from "react";
import DataMonitoringCard from "@/components/DataMonitoringCard/DataMonitoringCard";
import ApiLogsCard from "@/components/ApiLogsCard/ApiLogsCard";
import PriceHistoryCardWrapper from "@/components/Charts/PriceHistoryCardWrapper";
import styles from "./MonitoringGrid.module.css";

export default function MonitoringGrid({ lastUpdate, nextUpdate }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("/api/logs")
      .then((res) => res.json())
      .then((data) => setLogs(data));
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "1.5rem",
        alignItems: "flex-start",
      }}
    >
      <div className={styles.cardWrapper}>
        <DataMonitoringCard lastUpdate={lastUpdate} nextUpdate={nextUpdate} />
      </div>
      <div className={styles.cardWrapper}>
        <ApiLogsCard logs={logs} />
      </div>
      <div className={styles.cardWrapper}>
        <PriceHistoryCardWrapper />
      </div>
    </div>
  );
}
