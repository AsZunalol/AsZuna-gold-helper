// src/components/ItemsOfNoteManager/ItemsOfNoteManager.jsx

"use client";
import React, { useState } from "react";
import { Trash2, LoaderCircle, Server, Globe } from "lucide-react";
import ItemSearch from "../ItemSearch/ItemSearch";
import Image from "next/image"; // Import the Next.js Image component

function formatGold(copper) {
  if (copper === null || copper === undefined) return "N/A";
  const gold = Math.floor(copper / 10000);
  return `${gold.toLocaleString()}g`;
}

export default function ItemsOfNoteManager({ items, setItems, region, realm }) {
  const [loadingPrices, setLoadingPrices] = useState({});
  const safeItems = Array.isArray(items) ? items : [];

  const handleItemSelected = async (newItem) => {
    if (!region || !realm) {
      alert(
        "Please set your region and realm in your profile before adding items."
      );
      return;
    }
    if (safeItems.some((item) => item.id === newItem.id)) {
      return; // Item already in the list
    }

    // Immediately add the new item with its icon to the UI
    setItems((prevItems) => [
      ...prevItems,
      { ...newItem, serverPrice: null, regionalAveragePrice: null },
    ]);
    setLoadingPrices((prev) => ({ ...prev, [newItem.id]: true }));

    // Fetch prices in the background
    try {
      const response = await fetch(
        `/api/blizzard/item-price?itemId=${
          newItem.id
        }&region=${region}&realmSlug=${realm}&itemName=${encodeURIComponent(
          newItem.name
        )}`
      );
      let priceData = { serverPrice: null, regionalAveragePrice: null };
      if (response.ok) {
        priceData = await response.json();
      }

      // Update the item with the fetched prices
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === newItem.id
            ? {
                ...item,
                serverPrice: priceData.serverPrice,
                regionalAveragePrice: priceData.regionalAveragePrice,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Failed to fetch price for item", newItem.id, error);
    } finally {
      setLoadingPrices((prev) => {
        const newLoading = { ...prev };
        delete newLoading[newItem.id];
        return newLoading;
      });
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
        {safeItems.map((item) => (
          <div key={item.id} className="managed-list-item">
            <div
              className="item-content"
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              {/* FIX: Using Next/Image and providing a fallback src */}
              <Image
                src={item.icon || "/images/default-avatar.png"}
                alt={item.name}
                className="item-icon-small"
                width={24}
                height={24}
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
        ))}
      </div>
    </div>
  );
}
