// src/app/api/blizzard/search/route.js

import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/wow/blizzard-api";

// Helper function to search by name
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

// Helper function to fetch a single item by its ID
async function searchById(accessToken, region, itemId) {
  const itemUrl = `https://${region}.api.blizzard.com/data/wow/item/${itemId}?namespace=static-${region}`;
  const response = await fetch(itemUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("Failed to find item by ID.");
  const itemData = await response.json();

  return {
    results: [
      {
        data: {
          id: itemData.id,
          // --- THIS IS THE FIX ---
          // The name from this endpoint is a direct string, but the rest of the code
          // expects it to be an object. This wraps it to ensure consistency.
          name: {
            en_US: itemData.name,
          },
          // -----------------------
          media: { href: itemData.media?.href },
        },
      },
    ],
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const region = "us";

  if (!query) {
    return NextResponse.json(
      { message: "Search query is required" },
      { status: 400 }
    );
  }

  try {
    const accessToken = await getAccessToken(region);
    let searchData;

    if (!isNaN(query) && parseInt(query) > 0) {
      searchData = await searchById(accessToken, region, query);
    } else {
      searchData = await searchByName(accessToken, region, query);
    }

    const formattedResults = await Promise.all(
      searchData.results.map(async (item) => {
        let iconUrl =
          "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg";

        if (item.data.media && item.data.media.href) {
          try {
            const mediaResponse = await fetch(item.data.media.href, {
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
              `Could not fetch media for item ${item.data.id}:`,
              mediaError
            );
          }
        }

        return {
          id: item.data.id,
          name: item.data.name.en_US,
          icon: iconUrl,
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
