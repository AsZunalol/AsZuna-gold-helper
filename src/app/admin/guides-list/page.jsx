// src/app/admin/guides-list/page.jsx

import prisma from "@/lib/prisma";
import ClientGuidesList from "./ClientGuidesList";

async function getGuides() {
  try {
    const guides = await prisma.guide.findMany({
      orderBy: {
        updatedAt: "desc", // Order by most recently updated
      },
      include: {
        author: {
          select: { username: true },
        },
      },
    });
    return guides;
  } catch (error) {
    console.error("Failed to fetch guides:", error);
    return [];
  }
}

export default async function GuidesListPage() {
  const allGuides = await getGuides();

  // Separate guides into two lists on the server
  const publishedGuides = allGuides.filter(
    (guide) => guide.status === "PUBLISHED"
  );
  const draftGuides = allGuides.filter((guide) => guide.status === "DRAFT");

  return (
    <ClientGuidesList
      initialPublished={publishedGuides ?? []}
      initialDrafts={draftGuides ?? []}
    />
  );
}
