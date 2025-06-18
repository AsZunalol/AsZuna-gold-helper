import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import TransmogGuide from "./TransmogGuide";
import NormalGuide from "./NormalGuide";

// Make the getGuide function async
async function getGuide(id) {
  try {
    const guide = await prisma.guide.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            username: true,
            imageUrl: true,
          },
        },
        itemsOfNote: {
          select: { id: true, name: true },
        },
        route: true,
        steps: {
          orderBy: {
            order: "asc",
          },
        },
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
  const guide = await getGuide(params.id);

  if (!guide) {
    notFound();
  }

  // Conditionally render the correct guide component based on category
  if (guide.category === "Transmog") {
    return <TransmogGuide guide={guide} />;
  } else {
    return <NormalGuide guide={guide} />;
  }
}
