"use client";
import React, { useState } from "react";

export default function ItemModal({ onSave, onClose, noun = "Item" }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const handleSave = () => {
    if (name && url) {
      onSave({ name, url });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "500px" }}
      >
        <button onClick={onClose} className="close-modal-button">
          &times;
        </button>
        <h3 style={{ marginTop: 0 }}>Add {noun}</h3>

        <div className="form-group">
          <label htmlFor="item-name">{noun} Name</label>
          <input
            type="text"
            id="item-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`e.g., Potion of Speed`}
            className="modal-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="item-url">URL (Wowhead Link)</label>
          <input
            type="url"
            id="item-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.wowhead.com/item=..."
            className="modal-input"
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
          <button
            type="button"
            onClick={onClose}
            className="form-button secondary"
          >
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="form-button">
            Save {noun}
          </button>
        </div>
      </div>
    </div>
  );
}
