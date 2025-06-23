import { NextResponse } from "next/server";
import { createPool } from "@vercel/postgres";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const itemName = searchParams.get("name");

  if (!itemName) {
    return NextResponse.json(
      { error: "Item name is required" },
      { status: 400 }
    );
  }

  // Connect to our NEW auction-specific database
  const db = createPool({
    connectionString: process.env.POSTGRES_AUCTION_URL,
  });

  try {
    // This query now needs to join with your items table to get names
    // For now, let's assume item names are not in the auction data.
    // We will search by item ID if the user provides one.
    const { rows } = await db.query(
      `SELECT 
         item_id, 
         MIN(buyout) as min_buyout, 
         SUM(quantity) as total_quantity 
       FROM auctions 
       WHERE item_id::text ILIKE $1 
       GROUP BY item_id 
       ORDER BY min_buyout ASC`,
      [`%${itemName}%`] // A better search would be on an items table
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
