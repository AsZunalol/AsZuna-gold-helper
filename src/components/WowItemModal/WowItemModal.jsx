"use client";

import React, { useState } from "react";
import styles from "./WowItemModal.module.css";

export default function WowItemModal({ onSave, onClose }) {
  const [itemName, setItemName] = useState("");
  const [itemId, setItemId] = useState("");

  const handleSave = () => {
    if (itemName && itemId) {
      // Pass the necessary data back to the editor component.
      onSave({
        text: itemName,
        href: `https://www.wowhead.com/item=${itemId}`,
        "data-wowhead": `item=${itemId}`,
      });
    }
  };

  // Allow submitting with the Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Add WoW Item Link</h3>
        <div className="form-group">
          <label htmlFor="item-name-input">Item Name</label>
          <input
            id="item-name-input"
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            onKeyDown={handleKeyDown}
            className={styles.modalInput}
            placeholder="e.g., Thunderfury, Blessed Blade..."
            autoFocus
          />
        </div>
        <div className="form-group">
          <label htmlFor="item-id-input">Item ID</label>
          <input
            id="item-id-input"
            type="number"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            onKeyDown={handleKeyDown}
            className={styles.modalInput}
            placeholder="e.g., 19019"
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
            Add Item Link
          </button>
        </div>
      </div>
    </div>
  );
}
