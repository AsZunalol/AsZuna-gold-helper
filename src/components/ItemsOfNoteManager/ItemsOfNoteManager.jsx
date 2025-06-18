// src/components/ItemsOfNoteManager/ItemsOfNoteManager.jsx

"use client";
import React, { useState } from "react";
import { Trash2, LoaderCircle, Server, Globe } from "lucide-react";
import ItemSearch from "../ItemSearch/ItemSearch";

function formatGold(copper) {
  if (copper === null || copper === undefined) return "N/A";
  const gold = Math.floor(copper / 10000);
  const silver = Math.floor((copper % 10000) / 100);
  return `${gold.toLocaleString()}g ${silver}s`;
}

export default function ItemsOfNoteManager({ items, setItems, region, realm }) {
  const [loadingPrices, setLoadingPrices] = useState({});

  // Ensure `items` is always an array to prevent crashes.
  const safeItems = Array.isArray(items) ? items : [];

  const handleItemSelected = async (newItem) => {
    if (!region || !realm) {
      alert(
        "Please set your region and realm in your profile before adding items."
      );
      return;
    }

    if (!safeItems.some((item) => item.id === newItem.id)) {
      setLoadingPrices((prev) => ({ ...prev, [newItem.id]: true }));

      let serverPrice = null;
      let regionalAveragePrice = null;

      try {
        const response = await fetch(
          `/api/blizzard/item-price?itemId=${
            newItem.id
          }&region=${region}&realmSlug=${realm}&itemName=${encodeURIComponent(
            newItem.name
          )}`
        );
        if (response.ok) {
          const data = await response.json();
          serverPrice = data.serverPrice;
          regionalAveragePrice = data.regionalAveragePrice;
        }
      } catch (error) {
        console.error("Failed to fetch price for item", newItem.id, error);
      } finally {
        // --- THIS IS THE FIX ---
        // Construct the new array first, then pass it to the state setter.
        const newItems = [
          ...safeItems,
          { ...newItem, serverPrice, regionalAveragePrice },
        ];
        setItems(newItems);
        // -----------------------
        setLoadingPrices((prev) => ({ ...prev, [newItem.id]: false }));
      }
    }
  };

  const removeItem = (idToRemove) => {
    const updatedItems = safeItems.filter((item) => item.id !== idToRemove);
    setItems(updatedItems);
  };

  return (
    <div className="list-manager">
      <ItemSearch onItemSelected={handleItemSelected} />
      <div className="managed-list" style={{ marginTop: "1rem" }}>
        {safeItems.length === 0 ? (
          <p className="empty-list-text">No items added yet.</p>
        ) : (
          safeItems.map((item) => (
            <div key={item.id} className="managed-list-item">
              <div
                className="item-content"
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <img
                  src={item.icon}
                  alt={item.name}
                  className="item-icon-small"
                  width="24"
                  height="24"
                />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span className="item-name">{item.name}</span>
                  {loadingPrices[item.id] ? (
                    <LoaderCircle size={14} className="spinner" />
                  ) : (
                    <div className="item-price-container">
                      <div title="Your Server Price">
                        <Server size={12} />
                        <span>{formatGold(item.serverPrice)}</span>
                      </div>
                      <div title="Regional Market Price">
                        <Globe size={12} />
                        <span>{formatGold(item.regionalAveragePrice)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="step-action-button"
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
