import { NextResponse } from "next/server";
import postgres from "postgres";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const itemName = searchParams.get("name");

  if (!itemName) {
    return NextResponse.json(
      { error: "Item name is required" },
      { status: 400 }
    );
  }

  // Use the new 'postgres' library
  const sql = postgres(process.env.POSTGRES_AUCTION_URL, {
    ssl: "require",
  });

  try {
    const rows = await sql`
      SELECT 
        item_id, 
        MIN(buyout) as min_buyout, 
        SUM(quantity) as total_quantity 
      FROM auctions 
      WHERE item_id::text ILIKE ${"%" + itemName + "%"}
      GROUP BY item_id 
      ORDER BY min_buyout ASC
    `;
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await sql.end();
  }
}
