"use client";

import { useEffect, useState } from "react";

export default function ItemPrices({ items }) {
  const [pricedItems, setPricedItems] = useState([]);

  useEffect(() => {
    async function fetchPrices() {
      const updated = await Promise.all(
        items.map(async (item) => {
          try {
            const res = await fetch(
              `/api/blizzard/item-price?itemId=${item.id}&region=us&realmSlug=illidan`
            );
            const data = await res.json();
            return {
              ...item,
              serverPrice: data?.serverPrice ?? "N/A",
              regionalAveragePrice: data?.regionalAveragePrice ?? "N/A",
            };
          } catch {
            return { ...item, serverPrice: "N/A", regionalAveragePrice: "N/A" };
          }
        })
      );
      setPricedItems(updated);
    }

    fetchPrices();
  }, [items]);

  return (
    <div className="items-of-note">
      <h2>Items of Note</h2>
      <ul>
        {pricedItems.map((item) => (
          <li key={item.id}>
            <strong>{item.name}</strong> – Server Price: {item.serverPrice},
            Regional Avg: {item.regionalAveragePrice}
          </li>
        ))}
      </ul>
    </div>
  );
}
