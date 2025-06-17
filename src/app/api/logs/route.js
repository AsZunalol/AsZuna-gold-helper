import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("LOG API: Attempting to fetch logs...");

    const logs = await prisma.logEntry.findMany({
      orderBy: { time: "desc" },
      take: 10,
    });

    console.log("LOG API: Retrieved logs:", logs);

    const formatted = logs.map((log) => ({
      time: new Date(log.time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      message: log.message,
    }));

    return new Response(JSON.stringify(formatted), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("LOG API ERROR:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch logs" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
