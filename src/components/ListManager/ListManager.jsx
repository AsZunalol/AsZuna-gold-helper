"use client";
import React, { useState } from "react";
import { PlusCircle, Trash2, Link as LinkIcon } from "lucide-react";
import ItemModal from "../ItemModal/ItemModal"; // Use the new ItemModal

export default function ListManager({ title, noun, items, setItems }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // This ensures `items` is always an array, even if null or undefined is passed.
  const safeItems = Array.isArray(items) ? items : [];

  const handleItemSave = (newItem) => {
    // Use the safeItems array to ensure we're adding to a valid array
    setItems([...safeItems, newItem]);
    setIsModalOpen(false);
  };

  const removeItem = (index) => {
    // Use the safeItems array for filtering
    setItems(safeItems.filter((_, i) => i !== index));
  };

  return (
    <div className="list-manager">
      <label>{title}</label>
      <div className="managed-list">
        {safeItems.length === 0 ? (
          <p className="empty-list-text">No {noun.toLowerCase()}s added yet.</p>
        ) : (
          safeItems.map((item, index) => (
            <div key={index} className="managed-list-item">
              <div className="item-content">
                <span className="item-name">{item.name}</span>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="item-link"
                  >
                    <LinkIcon size={14} />
                    <span>{item.url}</span>
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="step-action-button"
                aria-label={`Remove ${noun}`}
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
        <span>Add {noun}</span>
      </button>

      {isModalOpen && (
        <ItemModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleItemSave}
          noun={noun}
        />
      )}
    </div>
  );
}
