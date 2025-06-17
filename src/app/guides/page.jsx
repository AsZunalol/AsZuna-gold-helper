// src/app/guides/page.jsx

import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";

async function getPublishedGuides() {
  try {
    const guides = await prisma.guide.findMany({
      where: {
        status: "PUBLISHED", // Only fetch published guides
      },
      orderBy: { createdAt: "desc" },
    });
    return guides;
  } catch (error) {
    console.error("Failed to fetch published guides:", error);
    return [];
  }
}

export const metadata = {
  title: "Gold-Making Guides - AsZuna's Gold Helper",
  description: "Browse all World of Warcraft gold-making guides.",
};

export default async function GuidesPage() {
  const guides = await getPublishedGuides();

  return (
    <main className="page-container">
      <h1
        className="section-title"
        style={{ textAlign: "center", marginBottom: "3rem" }}
      >
        All Guides
      </h1>

      <div className="guides-grid-container">
        {guides.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "var(--color-text-secondary)",
            }}
          >
            No guides have been published yet. Check back soon!
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
