import { NextResponse } from "next/server";
import { getAccessToken } from "../token/route";

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

  // We format the single result to look like the array from the search results
  return {
    results: [
      {
        data: {
          id: itemData.id,
          name: itemData.name,
          media: { id: itemData.media.id },
        },
      },
    ],
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const region = "us"; // Or dynamically get from user session if needed

  if (!query) {
    return NextResponse.json(
      { message: "Search query is required" },
      { status: 400 }
    );
  }

  try {
    const accessToken = await getAccessToken();
    let searchData;

    // Check if the query is a number (an ID) or a string (a name)
    if (!isNaN(query) && parseInt(query) > 0) {
      searchData = await searchById(accessToken, region, query);
    } else {
      searchData = await searchByName(accessToken, region, query);
    }

    const formattedResults = searchData.results.map((item) => ({
      id: item.data.id,
      name: item.data.name.en_US,
      icon: item.data.media.id,
    }));

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error("Item Search API Error:", error);
    return NextResponse.json(
      { message: "Failed to search for items.", error: error.message },
      { status: 500 }
    );
  }
}
