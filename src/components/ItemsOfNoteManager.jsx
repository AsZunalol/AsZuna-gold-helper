"use client";
import React, { useState } from "react";
import { Trash2, LoaderCircle, Server, Globe } from "lucide-react";
import ItemSearch from "./ItemSearch";

function formatGold(copper) {
  if (copper === null || copper === undefined) return "N/A";
  const gold = Math.floor(copper / 10000);
  const silver = Math.floor((copper % 10000) / 100);
  return `${gold.toLocaleString()}g ${silver}s`;
}

export default function ItemsOfNoteManager({ items, setItems, session }) {
  const [loadingPrices, setLoadingPrices] = useState({});

  const handleItemSelected = async (newItem) => {
    if (!session?.user?.region || !session?.user?.realm) {
      alert(
        "Please set your region and realm in your profile before adding items."
      );
      return;
    }

    if (!items.some((item) => item.id === newItem.id)) {
      setLoadingPrices((prev) => ({ ...prev, [newItem.id]: true }));

      let serverPrice = null;
      let regionalAveragePrice = null;

      try {
        const { region, realm } = session.user;
        const response = await fetch(
          `/api/blizzard/item-price?itemId=${newItem.id}&region=${region}&realmSlug=${realm}`
        );
        if (response.ok) {
          const data = await response.json();
          serverPrice = data.serverPrice;
          regionalAveragePrice = data.regionalAveragePrice;
        }
      } catch (error) {
        console.error("Failed to fetch price for item", newItem.id, error);
      } finally {
        setItems((prevItems) => [
          ...prevItems,
          { ...newItem, serverPrice, regionalAveragePrice },
        ]);
        setLoadingPrices((prev) => ({ ...prev, [newItem.id]: false }));
      }
    }
  };

  const removeItem = (idToRemove) => {
    setItems(items.filter((item) => item.id !== idToRemove));
  };

  return (
    <div className="list-manager">
      <ItemSearch onItemSelected={handleItemSelected} />
      <div className="managed-list" style={{ marginTop: "1rem" }}>
        {items.length === 0 ? (
          <p className="empty-list-text">No items added yet.</p>
        ) : (
          items.map((item) => (
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
                  src={`https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg`}
                  data-wowhead={`item=${item.id}&domain=www`}
                  alt={item.name}
                  className="item-icon-small"
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
