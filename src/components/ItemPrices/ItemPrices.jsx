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

    async function fetchPricesAndIcons() {
      // Renamed for clarity
      setLoading(true);
      const updatedItems = await Promise.all(
        items.map(async (item) => {
          let iconUrl = item.icon;

          // --- START OF FIX ---
          // If the icon URL is missing from the item data, fetch it.
          if (!iconUrl) {
            try {
              const iconResponse = await fetch(
                `/api/blizzard/search?query=${item.id}`
              );
              if (iconResponse.ok) {
                const searchResult = await iconResponse.json();
                // The search returns an array, so we take the first result's icon.
                if (searchResult && searchResult.length > 0) {
                  iconUrl = searchResult[0].icon;
                }
              }
            } catch (error) {
              console.error(
                `Failed to fetch icon for item ID ${item.id}:`,
                error
              );
            }
          }
          // --- END OF FIX ---

          // Fallback if the icon is still missing after the fetch attempt
          const finalIconUrl =
            iconUrl ||
            "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg";

          try {
            const priceRes = await fetch(
              `/api/blizzard/item-price?itemId=${item.id}&region=us&realmSlug=illidan`
            );
            if (!priceRes.ok) throw new Error("Price fetch failed");
            const priceData = await priceRes.json();
            return {
              ...item,
              icon: finalIconUrl, // Use the fetched or fallback icon
              serverPrice: priceData?.serverPrice ?? "N/A",
              regionalAveragePrice: priceData?.regionalAveragePrice ?? "N/A",
            };
          } catch {
            return {
              ...item,
              icon: finalIconUrl, // Also use it in the catch block
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
