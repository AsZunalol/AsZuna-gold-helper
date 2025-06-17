"use client";

import { useState, useEffect } from "react";
import styles from "./ApiHealthStatus.module.css";

export default function ApiHealthStatus() {
  const [status, setStatus] = useState("loading"); // 'loading', 'ok', 'error'
  const [message, setMessage] = useState("Checking API status...");

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/admin/health-check");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "An unknown error occurred");
        }

        setStatus(data.status);
        setMessage(data.message);
      } catch (error) {
        setStatus("error");
        setMessage(error.message);
      }
    };

    checkStatus();
  }, []);

  return (
    <div className={styles.healthCard}>
      <h3 className={styles.title}>Blizzard API Status</h3>
      <div className={styles.statusContainer}>
        {status === "loading" && (
          <div className={`${styles.indicator} ${styles.loading}`}></div>
        )}
        {status === "ok" && (
          <div className={`${styles.indicator} ${styles.ok}`}></div>
        )}
        {status === "error" && (
          <div className={`${styles.indicator} ${styles.error}`}></div>
        )}
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}
