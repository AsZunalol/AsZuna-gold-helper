// aszunalol/aszuna-gold-helper/AsZuna-gold-helper-e7b64661f52d01644dc7d7dea50098deeb640633/src/app/api/guides/route.js

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET handler to fetch all guides
export async function GET(request) {
  try {
    const guides = await prisma.guide.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(guides, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch guides:", error);
    return NextResponse.json(
      { message: "Failed to fetch guides.", error: error.message },
      { status: 500 }
    );
  }
}

// POST handler to create a new guide
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    if (!data.title || !data.authorId) {
      return NextResponse.json(
        { message: "Title and author are required" },
        { status: 400 }
      );
    }

    const authorId = parseInt(data.authorId, 10);
    if (isNaN(authorId)) {
      return NextResponse.json(
        { message: "Invalid author ID" },
        { status: 400 }
      );
    }

    const newGuide = await prisma.guide.create({
      data: {
        title: data.title,
        category: data.category,
        expansion: data.expansion,
        is_route: data.is_route || false,
        description: data.description,
        steps: data.steps,
        addons: data.addons,
        thumbnail_url: data.thumbnail_url,
        map_image_path: data.map_image_path,
        video_thumbnail_path: data.video_thumbnail_path,
        youtube_video_id: data.youtube_video_id,
        time_to_complete: data.time_to_complete,
        recommended_class: data.recommended_class,
        required_items: data.required_items,
        gold_pr_hour: data.gold_pr_hour,
        tsm_import_string: data.tsm_import_string,
        route_string: data.gathermate2_string,
        tags: data.tags,
        itemsOfNote: data.itemsOfNote, // ✅ ADDED FIELD TO BE SAVED
        authorId: authorId,
      },
    });

    return NextResponse.json(newGuide, { status: 201 });
  } catch (error) {
    console.error("Failed to create guide:", error);
    return NextResponse.json(
      { message: "Failed to create guide", error: error.message },
      { status: 500 }
    );
  }
}
