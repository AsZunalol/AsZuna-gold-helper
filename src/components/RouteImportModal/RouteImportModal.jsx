"use client";
import React, { useState } from "react";

export default function RouteImportModal({ onSave, onClose }) {
  const [name, setName] = useState("");
  const [importString, setImportString] = useState("");

  const handleSave = () => {
    if (name && importString) {
      onSave({ name, importString });
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "600px" }}
      >
        <button onClick={onClose} className="close-modal-button">
          &times;
        </button>
        <h3 style={{ marginTop: 0 }}>Add Route String</h3>

        <div className="form-group">
          <label htmlFor="route-name">Route Name</label>
          <input
            type="text"
            id="route-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Dragonflight Herb Route"
            className="modal-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="route-import-string">Import String</label>
          <textarea
            id="route-import-string"
            value={importString}
            onChange={(e) => setImportString(e.target.value)}
            className="modal-textarea"
            rows={10}
            placeholder="Paste the string from your addon here..."
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
            Save Route
          </button>
        </div>
      </div>
    </div>
  );
}
