import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const itemName = searchParams.get("name");

  if (!itemName) {
    return NextResponse.json(
      { error: "Item name is required" },
      { status: 400 }
    );
  }

  // Connect to Supabase using the standard 'pg' library
  const pool = new Pool({
    connectionString: process.env.POSTGRES_AUCTION_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  const client = await pool.connect();

  try {
    const { rows } = await client.query(
      `SELECT 
         item_id, 
         MIN(buyout) as min_buyout, 
         SUM(quantity) as total_quantity 
       FROM auctions 
       WHERE item_id::text ILIKE $1 
       GROUP BY item_id 
       ORDER BY min_buyout ASC`,
      [`%${itemName}%`]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
    await pool.end();
  }
}
