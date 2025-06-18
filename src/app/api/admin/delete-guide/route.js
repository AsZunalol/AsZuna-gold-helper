// src/app/api/admin/delete-guide/route.js

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing guide ID" }, { status: 400 });
    }

    await prisma.guide.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Guide Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
