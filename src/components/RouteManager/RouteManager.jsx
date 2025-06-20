"use client";
import React, { useState } from "react";
import { PlusCircle, Trash2, Clipboard } from "lucide-react";
import RouteImportModal from "../RouteImportModal/RouteImportModal";

export default function RouteManager({ routes, setRoutes }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // This ensures `routes` is always an array, even if null or undefined is passed.
  const safeRoutes = Array.isArray(routes) ? routes : [];

  const handleRouteSave = (newRoute) => {
    // Use the safeRoutes array to ensure we're adding to a valid array
    setRoutes([...safeRoutes, newRoute]);
    setIsModalOpen(false);
  };

  const removeRoute = (index) => {
    // Use the safeRoutes array for filtering
    setRoutes(safeRoutes.filter((_, i) => i !== index));
  };

  return (
    <div className="list-manager">
      <label>Route Import Strings</label>
      <div className="managed-list">
        {safeRoutes.length === 0 ? (
          <p className="empty-list-text">No route strings added yet.</p>
        ) : (
          safeRoutes.map((route, index) => (
            <div key={index} className="managed-list-item">
              <div className="item-content">
                <span className="item-name">{route.name}</span>
                <div className="item-link">
                  <Clipboard size={14} />
                  <span>String set ({route.importString.length} chars)</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeRoute(index)}
                className="step-action-button"
                aria-label="Remove route"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="add-step-button"
      >
        <PlusCircle size={16} />
        <span>Add Route String</span>
      </button>

      {isModalOpen && (
        <RouteImportModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleRouteSave}
        />
      )}
    </div>
  );
}
