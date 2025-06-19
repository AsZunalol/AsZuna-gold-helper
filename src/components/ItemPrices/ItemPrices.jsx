"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Spinner from "@/components/ui/spinner"; // Assuming spinner is available
import "./ItemPrices.css"; // Import the new CSS file

// Helper to format gold from copper values
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

    async function fetchPrices() {
      setLoading(true);
      const updated = await Promise.all(
        items.map(async (item) => {
          // Fallback for item icon if not provided
          const iconUrl =
            item.icon ||
            "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg";
          try {
            const res = await fetch(
              `/api/blizzard/item-price?itemId=${item.id}&region=us&realmSlug=illidan`
            );
            if (!res.ok) throw new Error("Price fetch failed");
            const data = await res.json();
            return {
              ...item,
              icon: iconUrl,
              serverPrice: data?.serverPrice ?? "N/A",
              regionalAveragePrice: data?.regionalAveragePrice ?? "N/A",
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
      setPricedItems(updated);
      setLoading(false);
    }

    fetchPrices();
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
