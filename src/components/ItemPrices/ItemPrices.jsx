// src/components/ItemPrices/ItemPrices.jsx

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Spinner from "@/components/ui/spinner";
import "./ItemPrices.css";

function formatGold(copper) {
  if (copper === null || copper === undefined || copper === "N/A") return "N/A";
  const gold = Math.floor(copper / 10000);
  const silver = Math.floor((copper % 10000) / 100);
  const copperCoins = copper % 100;
  return `${gold.toLocaleString()}g ${silver}s ${copperCoins}c`;
}

export default function ItemPrices({ items }) {
  const [pricedItems, setPricedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!items || items.length === 0) {
      setLoading(false);
      return;
    }

    async function fetchPricesAndIcons() {
      setLoading(true);
      const updatedItems = await Promise.all(
        items.map(async (item) => {
          let iconUrl = item.icon;
          // --- START OF FIX ---
          // If the icon is missing, fetch it from the search API.
          if (!iconUrl) {
            try {
              const iconRes = await fetch(
                `/api/blizzard/search?query=${item.id}`
              );
              if (iconRes.ok) {
                const iconData = await iconRes.json();
                if (iconData.length > 0) {
                  iconUrl = iconData[0].icon;
                }
              }
            } catch (iconError) {
              console.error("Failed to fetch icon:", iconError);
            }
          }
          // Fallback if the fetch fails
          if (!iconUrl) {
            iconUrl =
              "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg";
          }
          // --- END OF FIX ---

          try {
            const priceRes = await fetch(
              `/api/blizzard/item-price?itemId=${item.id}&region=us&realmSlug=illidan`
            );
            if (!priceRes.ok) throw new Error("Price fetch failed");
            const priceData = await priceRes.json();
            return {
              ...item,
              icon: iconUrl,
              serverPrice: priceData?.serverPrice ?? "N/A",
              regionalAveragePrice: priceData?.regionalAveragePrice ?? "N/A",
            };
          } catch {
            return {
              ...item,
              icon: iconUrl,
              serverPrice: "N/A",
              regionalAveragePrice: "N/A",
            };
          }
        })
      );
      setPricedItems(updatedItems);
      setLoading(false);
    }

    fetchPricesAndIcons();
  }, [items]);

  if (loading) {
    return (
      <div className="item-prices-loading">
        <Spinner size={30} />
        <span>Loading Prices...</span>
      </div>
    );
  }

  return (
    <div className="item-prices-container">
      <ul className="item-prices-list">
        {pricedItems.map((item) => (
          <li key={item.id} className="item-price-row">
            <div className="item-info">
              <Image
                src={item.icon}
                alt={item.name}
                width={40}
                height={40}
                className="item-icon"
              />
              <span className="item-name">{item.name}</span>
            </div>
            <div className="item-values">
              <div className="price-detail">
                <span className="price-label">Server</span>
                <span className="price-value">
                  {formatGold(item.serverPrice)}
                </span>
              </div>
              <div className="price-detail">
                <span className="price-label">Region Avg.</span>
                <span className="price-value">
                  {formatGold(item.regionalAveragePrice)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
