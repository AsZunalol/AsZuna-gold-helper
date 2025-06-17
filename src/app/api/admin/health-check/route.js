import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAccessToken } from "@/app/api/blizzard/token/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  // Secure this endpoint to only be accessible by OWNERs
  if (session?.user.role !== "OWNER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Attempt to get an access token as a simple health check
    const accessToken = await getAccessToken();

    // Try to make a simple, lightweight request to the Blizzard API
    const response = await fetch(
      `https://us.api.blizzard.com/data/wow/token/index?namespace=dynamic-us`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Blizzard API responded with status: ${response.status}`);
    }

    // If both requests succeed, the API is healthy
    return NextResponse.json({ status: "ok", message: "API is operational" });
  } catch (error) {
    console.error("[API Health Check] Error:", error.message);
    return NextResponse.json(
      { status: "error", message: "Failed to connect to Blizzard API" },
      { status: 500 }
    );
  }
}
