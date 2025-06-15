"use client";
import React, { useState } from "react";

export default function ImportStringModal({
  onSave,
  onClose,
  initialValue = "",
  title = "Import String",
}) {
  const [stringValue, setStringValue] = useState(initialValue);

  const handleSave = () => {
    onSave(stringValue);
    onClose();
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
        <h3 style={{ marginTop: 0 }}>{title}</h3>

        <div className="form-group">
          <label htmlFor="import-string">Paste your string below:</label>
          <textarea
            id="import-string"
            value={stringValue}
            onChange={(e) => setStringValue(e.target.value)}
            className="modal-textarea"
            rows={10}
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
            Save String
          </button>
        </div>
      </div>
    </div>
  );
}
