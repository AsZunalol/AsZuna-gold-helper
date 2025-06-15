// src/app/api/guides/[id]/route.js

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  const guideId = parseInt(params.id, 10); // Get the guide ID from the URL parameters

  if (isNaN(guideId)) {
    return NextResponse.json({ message: "Invalid Guide ID" }, { status: 400 });
  }

  try {
    const data = await request.json(); // Get the raw JSON data from the request body

    // Validate authorId from the payload, similar to your POST handler
    const authorId = parseInt(data.authorId, 10);
    if (isNaN(authorId)) {
      return NextResponse.json(
        {
          message: "Invalid author ID provided in payload. Must be an integer.",
        },
        { status: 400 }
      );
    }

    const updatedGuide = await prisma.guide.update({
      where: { id: guideId },
      data: {
        title: data.title,
        category: data.category,
        expansion: data.expansion,
        description: data.description,
        steps: data.steps, // Ensure these are stringified JSON from frontend
        youtube_video_id: data.youtube_video_id,
        gold_pr_hour: data.gold_pr_hour,
        thumbnail_url: data.thumbnail_url,
        slider_images: data.slider_images, // Ensure these are stringified JSON from frontend
        addons: data.addons, // Ensure these are stringified JSON from frontend
        required_items: data.required_items, // Ensure these are stringified JSON from frontend
        items_of_note: data.items_of_note, // Ensure these are stringified JSON from frontend
        map_image_path: data.map_image_path,
        time_to_complete: data.time_to_complete,
        recommended_class: data.recommended_class, // Ensure this is a string
        tsm_import_string: data.tsm_import_string,
        gathermate2_string: data.gathermate2_string, // Ensure these are stringified JSON from frontend
        tags: data.tags, // Ensure this is a string
        authorId: authorId, // Use the validated authorId
        updatedAt: new Date(), // Automatically update the timestamp
      },
    });

    return NextResponse.json(
      { message: "Guide updated successfully", guide: updatedGuide },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating guide:", error); // This log will show the specific error in your server console!
    if (error.code === "P2025") {
      // Prisma error code for record not found
      return NextResponse.json(
        { message: "Guide not found." },
        { status: 404 }
      );
    }
    // Generic server error response, includes the internal error message for debugging
    return NextResponse.json(
      { message: "Failed to update guide.", error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); // Ensure Prisma client is disconnected
  }
}

// Optionally, you might want to add a GET handler to fetch a single guide by ID
// This is useful if you want to allow direct API access or verification
export async function GET(request, { params }) {
  const guideId = parseInt(params.id, 10);

  if (isNaN(guideId)) {
    return NextResponse.json({ message: "Invalid Guide ID" }, { status: 400 });
  }

  try {
    const guide = await prisma.guide.findUnique({
      where: { id: guideId },
    });

    if (!guide) {
      return NextResponse.json({ message: "Guide not found" }, { status: 404 });
    }

    return NextResponse.json(guide, { status: 200 });
  } catch (error) {
    console.error("Error fetching guide:", error);
    return NextResponse.json(
      { message: "Failed to fetch guide.", error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
