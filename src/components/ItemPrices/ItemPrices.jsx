// src/components/ItemPrices/ItemPrices.jsx

"use client";

import Image from "next/image";
import { Server, Globe } from "lucide-react";
import "./ItemPrices.css";

function formatGold(copper) {
  if (copper === null || copper === undefined || copper === "N/A") return "N/A";
  const gold = Math.floor(copper / 10000);
  return `${gold.toLocaleString()}g`;
}

export default function ItemPrices({ items, realm }) {
  if (!items || items.length === 0) {
    return <p className="text-gray-400">No items to display.</p>;
  }

  // Capitalize the first letter of the realm name for display
  const realmName = realm
    ? realm.charAt(0).toUpperCase() + realm.slice(1)
    : "Your Server";

  return (
    <div className="item-prices-container">
      <ul className="item-prices-list">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`https://www.wowhead.com/item=${item.id}`}
              className="item-price-row"
              data-wowhead={`item=${item.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={
                  item.icon ||
                  "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg"
                }
                alt={item.name}
                width={40}
                height={40}
                className="item-icon"
              />
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                <div className="item-values">
                  <div className="price-detail tooltip">
                    <Server size={18} className="price-icon" />
                    <span className="tooltip-text">{realmName} Price</span>
                    <span className="price-value">
                      {formatGold(item.serverPrice)}
                    </span>
                  </div>
                  <div className="price-detail tooltip">
                    <Globe size={18} className="price-icon" />
                    <span className="tooltip-text">Region Avg. Price</span>
                    <span className="price-value">
                      {formatGold(item.regionalAveragePrice)}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
