// src/lib/wow/updateItemPrices.js

import "dotenv/config";
import { getCachedOrFreshItemPrice } from "./useItemPriceCache.js";

const itemsToUpdate = [
  { id: 190452, slug: "stormscale", region: "eu" },
  { id: 198356, slug: "stormscale", region: "eu" },
];

const regionalServerSlugs = [
  "draenor",
  "silvermoon",
  "tarren-mill",
  "kazzak",
  "ravencrest",
  "ragnaros",
  "outland",
  "twisting-nether",
  "argent-dawn",
  "stormscale",
];

(async () => {
  for (const item of itemsToUpdate) {
    const prices = await getCachedOrFreshItemPrice(
      item.id,
      item.slug,
      item.region,
      regionalServerSlugs
    );
    console.log(`✅ Updated item ${item.id}:`, prices);
  }
})();
