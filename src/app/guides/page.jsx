// aszunalol/aszuna-gold-helper/AsZuna-gold-helper-e7b64661f52d01644dc7d7dea50098deeb640633/src/app/guides/page.jsx

import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma"; // Use the shared PrismaClient instance

// Function to fetch all guides from the database
async function getAllGuides() {
  try {
    const guides = await prisma.guide.findMany({
      where: { is_route: false }, // Assuming 'routes' are separate from 'guides' based on homepage logic
      orderBy: { createdAt: "desc" }, // Order by most recent
    });
    return guides;
  } catch (error) {
    console.error("Failed to fetch guides:", error);
    return [];
  }
}

export const metadata = {
  title: "All Gold Guides - AsZuna's Gold Helper",
  description:
    "Browse all World of Warcraft gold-making guides and strategies.",
};

export default async function GuidesPage() {
  const guides = await getAllGuides();

  return (
    <main className="page-container">
      <h1
        className="section-title"
        style={{ textAlign: "center", marginBottom: "3rem" }}
      >
        All Gold Guides
      </h1>

      <div className="guides-grid-container">
        {guides.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "var(--color-text-secondary)",
            }}
          >
            No guides found. Check back soon for new content!
          </p>
        ) : (
          <div className="guides-grid">
            {guides.map((guide) => (
              <Link
                href={`/guide/${guide.id}`}
                key={guide.id}
                className="guide-card"
              >
                <div className="guide-card-image-container">
                  <Image
                    src={guide.thumbnail_url || "/images/default-thumb.jpg"}
                    alt={guide.title}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {guide.category && (
                    <span className="category-tag">{guide.category}</span>
                  )}
                </div>
                <div className="guide-card-content">
                  <h3>{guide.title}</h3>
                  <p className="guide-description">{guide.description}</p>
                  {/* Potentially add more details here like author, date, etc. */}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
