import { prisma } from "@/lib/prisma";
import PriceHistoryChart from "@/components/Charts/PriceHistoryChart";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const itemId = parseInt(searchParams.get("itemId"));
  const region = searchParams.get("region");
  const realmSlug = searchParams.get("realmSlug");

  if (!itemId || !region || !realmSlug) {
    return new Response(JSON.stringify([]), { status: 400 });
  }

  try {
    const history = await prisma.itemPriceHistory.findMany({
      where: { itemId, region, realmSlug },
      orderBy: { timestamp: "asc" },
      take: 50,
    });

    return new Response(JSON.stringify(history), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to load item price history:", err);
    return new Response(
      JSON.stringify({ error: "Failed to load item price history" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export function PriceHistoryCardWrapper() {
  return (
    <div className="card card--data">
      <h3
        style={{
          fontSize: "1.125rem",
          fontWeight: "600",
          marginBottom: "1rem",
        }}
      >
        Item Price History (Chart)
      </h3>
      <PriceHistoryChart itemId={19019} region="eu" realmSlug="kazzak" />
    </div>
  );
}
