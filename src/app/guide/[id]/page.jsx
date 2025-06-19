// src/app/guide/[id]/page.jsx

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import TransmogGuide from "./TransmogGuide";
import NormalGuide from "./NormalGuide";

// Make the getGuide function async
async function getGuide(id) {
  try {
    const guide = await prisma.guide.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        author: {
          select: {
            username: true,
            imageUrl: true,
          },
        },
        // Removed 'itemsOfNote' and 'route' from include as they are scalar JSON/TEXT fields.
        // Their data is returned directly on the guide object.
      },
    });
    return guide;
  } catch (error) {
    console.error("Failed to fetch guide:", error);
    return null;
  }
}

// Make the page component async and destructure params
export default async function Page({ params }) {
  // Await params before accessing its properties
  const { id } = await params;
  const guide = await getGuide(id);

  if (!guide) {
    notFound();
  }

  return (
    // Wrap the guide content with the new global wrapper class
    <div className="main-content-card-wrapper">
      {guide.category === "Transmog" ? (
        <TransmogGuide guide={guide} />
      ) : (
        <NormalGuide guide={guide} />
      )}
    </div>
  );
}
