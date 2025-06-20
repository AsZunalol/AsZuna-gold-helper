"use client";

import { useState, useMemo } from "react";
import { PlusCircle, Trash2, DollarSign, Clock, Hash } from "lucide-react";
import styles from "@/app/admin/create-transmog-guide/transmogGuide.module.css";

export default function GoldSessionManager({ sessions, setSessions }) {
  const [gold, setGold] = useState("");
  const [minutes, setMinutes] = useState("");

  const addSession = () => {
    const goldAmount = parseInt(gold);
    const timeAmount = parseInt(minutes);
    if (goldAmount > 0 && timeAmount > 0) {
      setSessions([
        ...(sessions || []),
        { gold: goldAmount, minutes: timeAmount },
      ]);
      setGold("");
      setMinutes("");
    }
  };

  const removeSession = (index) =>
    setSessions(sessions.filter((_, i) => i !== index));

  const averageGph = useMemo(() => {
    if (!sessions || sessions.length === 0) return 0;
    const totalGold = sessions.reduce((sum, s) => sum + s.gold, 0);
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
    return totalMinutes > 0 ? Math.round((totalGold / totalMinutes) * 60) : 0;
  }, [sessions]);

  return (
    <div className="list-manager">
      <div className={styles.gphInputs}>
        <input
          type="number"
          placeholder="Gold Earned"
          value={gold}
          onChange={(e) => setGold(e.target.value)}
        />
        <input
          type="number"
          placeholder="Minutes Farmed"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
        />
        <button
          type="button"
          onClick={addSession}
          className={styles.addSessionButton}
        >
          <PlusCircle size={16} /> Add
        </button>
      </div>
      {sessions && sessions.length > 0 && (
        <div className="managed-list" style={{ marginTop: "1rem" }}>
          {sessions.map((session, index) => (
            <div key={index} className="managed-list-item">
              <div
                className="item-content"
                style={{ flexDirection: "row", gap: "1.5rem" }}
              >
                <span>
                  <Hash size={14} /> Session {index + 1}:{" "}
                  {session.gold.toLocaleString()}g in {session.minutes}m
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeSession(index)}
                className="step-action-button"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className={styles.gphDisplay}>
        Calculated GPH: <span>{averageGph.toLocaleString()}</span>
      </div>
    </div>
  );
}
