"use client";

import React, { useState } from "react";
import styles from "./ImageURLModal.module.css";

export default function ImageURLModal({ onSave, onClose }) {
  const [url, setUrl] = useState("");

  const handleSave = () => {
    if (url) {
      onSave(url);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Add Image from URL</h3>
        <div className="form-group">
          <label htmlFor="image-url-input">Image URL</label>
          <input
            id="image-url-input"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className={styles.modalInput}
            placeholder="https://example.com/image.png"
            autoFocus
          />
        </div>
        <div className={styles.modalActions}>
          <button
            type="button"
            onClick={onClose}
            className="form-button secondary"
          >
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="form-button">
            Add Image
          </button>
        </div>
      </div>
    </div>
  );
}
