// src/app/api/blizzard/search/route.js

import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/wow/blizzard-api";

// Helper function to search by name from Blizzard API
async function searchByName(accessToken, region, itemName) {
  const searchUrl = `https://${region}.api.blizzard.com/data/wow/search/item?namespace=static-${region}&name.en_US=${encodeURIComponent(
    itemName
  )}&orderby=id&_page=1`;
  const response = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("Failed to search by name.");
  return await response.json();
}

// Helper function to fetch a single item by its ID from Blizzard API
async function searchById(accessToken, region, itemId) {
  const itemUrl = `https://${region}.api.blizzard.com/data/wow/item/${itemId}?namespace=static-${region}`;
  const response = await fetch(itemUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("Failed to find item by ID.");
  return await response.json();
}

// This is the main API route handler
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const region = "us"; // Defaulting to US region

  if (!query) {
    return NextResponse.json(
      { message: "Search query is required" },
      { status: 400 }
    );
  }

  try {
    const accessToken = await getAccessToken(region);
    let itemsToProcess = [];

    // --- START OF THE DEFINITIVE FIX ---
    // This block correctly handles both search types and ensures
    // `itemsToProcess` is always an array of item data objects.
    if (!isNaN(query) && parseInt(query) > 0) {
      const itemData = await searchById(accessToken, region, query);
      if (itemData) {
        // If we search by ID, we get a single item object. We put it in an array.
        itemsToProcess.push(itemData);
      }
    } else {
      const searchData = await searchByName(accessToken, region, query);
      if (searchData && searchData.results) {
        // If we search by name, we get an array of results. We extract the data from each.
        itemsToProcess = searchData.results.map((result) => result.data);
      }
    }
    // --- END OF THE DEFINITIVE FIX ---

    // Process all found items consistently
    const formattedResults = await Promise.all(
      itemsToProcess.map(async (item) => {
        let iconUrl =
          "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg";

        // Handle inconsistent media property structure between search types
        const mediaHref = item.media?.key?.href || item.media?.href;

        if (mediaHref) {
          try {
            const mediaResponse = await fetch(mediaHref, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (mediaResponse.ok) {
              const mediaData = await mediaResponse.json();
              const iconAsset = mediaData.assets?.find(
                (asset) => asset.key === "icon"
              );
              if (iconAsset && iconAsset.value) {
                iconUrl = iconAsset.value;
              }
            }
          } catch (mediaError) {
            console.error(
              `Could not fetch media for item ${item.id}:`,
              mediaError
            );
          }
        }

        // We now guarantee that the `name` property sent to the client is a simple string
        const itemName =
          typeof item.name === "object" && item.name !== null
            ? item.name.en_US
            : item.name;

        return {
          id: item.id,
          name: itemName,
          icon: iconUrl, // This will be the full URL
        };
      })
    );

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error("Item Search API Error:", error);
    return NextResponse.json(
      { message: "Failed to search for items.", error: error.message },
      { status: 500 }
    );
  }
}
