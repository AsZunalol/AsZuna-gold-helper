// src/components/AddGoldSessionModal/AddGoldSessionModal.jsx

"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import styles from "./AddGoldSessionModal.module.css";
import { PlusCircle } from "lucide-react";

export default function AddGoldSessionModal({ guide, onClose, onUpdate }) {
  const [gold, setGold] = useState("");
  const [minutes, setMinutes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    const goldAmount = parseInt(gold);
    const timeAmount = parseInt(minutes);

    if (!goldAmount || !timeAmount || goldAmount <= 0 || timeAmount <= 0) {
      setError("Please enter valid, positive numbers for gold and minutes.");
      return;
    }

    setSubmitting(true);

    try {
      const existingSessions = guide.gold_sessions
        ? JSON.parse(guide.gold_sessions)
        : [];
      const newSessions = [
        ...existingSessions,
        { gold: goldAmount, minutes: timeAmount },
      ];

      const totalGold = newSessions.reduce((sum, s) => sum + s.gold, 0);
      const totalMinutes = newSessions.reduce((sum, s) => sum + s.minutes, 0);
      const averageGph =
        totalMinutes > 0 ? Math.round((totalGold / totalMinutes) * 60) : 0;

      const response = await fetch(`/api/guides/${guide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gold_sessions: JSON.stringify(newSessions),
          gold_pr_hour: `${averageGph.toLocaleString()} g/hr`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update the guide.");
      }

      const updatedGuide = await response.json();
      toast.success("New session added successfully!");
      onUpdate(updatedGuide.guide); // Pass the updated guide back to the list
      onClose(); // Close the modal
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Add New Gold Session</h3>
        <p className={styles.modalSubtitle}>For: {guide.title}</p>
        <div className={styles.formGroup}>
          <label htmlFor="gold-earned">Gold Earned</label>
          <input
            id="gold-earned"
            type="number"
            value={gold}
            onChange={(e) => setGold(e.target.value)}
            placeholder="e.g., 50000"
            className={styles.modalInput}
            autoFocus
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="minutes-farmed">Minutes Farmed</label>
          <input
            id="minutes-farmed"
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="e.g., 60"
            className={styles.modalInput}
          />
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <div className={styles.modalActions}>
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={styles.saveButton}
            disabled={submitting}
          >
            <PlusCircle size={18} />
            {submitting ? "Saving..." : "Add Session"}
          </button>
        </div>
      </div>
    </div>
  );
}
