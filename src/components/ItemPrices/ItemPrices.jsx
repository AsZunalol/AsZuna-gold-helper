"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Spinner from "@/components/ui/spinner";
import "./ItemPrices.css";

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
    // If there are no items, no need to do anything.
    if (!items || items.length === 0) {
      setLoading(false);
      return;
    }

    async function fetchPrices() {
      setLoading(true);

      // Create the final list of items by mapping over the initial `items` prop.
      const updatedItems = await Promise.all(
        items.map(async (item) => {
          // --- THIS IS THE FIX ---
          // The component will now trust the item.icon URL from the database.
          // If the URL is invalid or missing, we use a default placeholder.
          // We no longer re-fetch the icon here.
          const finalIconUrl =
            item.icon ||
            "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg";

          try {
            // Only fetch the prices for the item.
            const priceRes = await fetch(
              `/api/blizzard/item-price?itemId=${item.id}&region=us&realmSlug=illidan`
            );

            if (!priceRes.ok) {
              // If fetching the price fails, we still return the item with its original data.
              // This ensures the name and icon are still displayed.
              throw new Error("Price fetch failed");
            }

            const priceData = await priceRes.json();

            // Return the item with its original data, plus the new price information.
            return {
              ...item,
              icon: finalIconUrl,
              serverPrice: priceData?.serverPrice ?? "N/A",
              regionalAveragePrice: priceData?.regionalAveragePrice ?? "N/A",
            };
          } catch {
            // If any error occurs (including network issues), return the item with its icon
            // and "N/A" for the prices. This keeps the UI consistent.
            return {
              ...item,
              icon: finalIconUrl,
              serverPrice: "N/A",
              regionalAveragePrice: "N/A",
            };
          }
        })
      );

      // Update the state with the final list of items.
      setPricedItems(updatedItems);
      setLoading(false);
    }

    fetchPrices();
  }, [items]); // This effect will only re-run if the `items` prop changes.

  // Display a loading spinner only if the component is in a loading state.
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
