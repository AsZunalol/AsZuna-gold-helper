// lib/wow/useItemPriceCache.js

import { PrismaClient } from "@prisma/client";
import fetchItemPrices from "./fetchItemPrices.js";

const prisma = new PrismaClient();

const ONE_HOUR_MS = 60 * 60 * 1000;

export async function getCachedOrFreshItemPrice(
  itemId,
  userServerSlug,
  region,
  regionalServerSlugs
) {
  const now = new Date();

  // Try to find an existing cached entry
  const cached = await prisma.itemPrice.findUnique({
    where: {
      itemId_userServerSlug_region: {
        itemId,
        userServerSlug,
        region,
      },
    },
  });

  if (cached && now - new Date(cached.updatedAt) < ONE_HOUR_MS) {
    return {
      userServerPrice: cached.userServerPrice,
      regionalMarketPrice: cached.regionalPrice,
      fromCache: true,
    };
  }

  // Fetch new data
  const { userServerPrice, regionalMarketPrice } = await fetchItemPrices(
    itemId,
    userServerSlug,
    region,
    regionalServerSlugs
  );

  // Upsert into DB
  await prisma.itemPrice.upsert({
    where: {
      itemId_userServerSlug_region: {
        itemId,
        userServerSlug,
        region,
      },
    },
    update: {
      userServerPrice,
      regionalPrice: regionalMarketPrice,
    },
    create: {
      itemId,
      userServerSlug,
      region,
      userServerPrice,
      regionalPrice: regionalMarketPrice,
    },
  });

  return {
    userServerPrice,
    regionalMarketPrice,
    fromCache: false,
  };
}
