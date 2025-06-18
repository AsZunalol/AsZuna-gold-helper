/*
  IMPORTANT: If you are still seeing the "searchParams should be awaited" error
  after using this code, the problem is very likely a caching issue with the
  Next.js development server. Please follow these steps exactly:

  1. STOP your development server (Ctrl + C in the terminal).
  2. DELETE the `.next` folder from your project's root directory.
  3. RESTART the development server (`npm run dev` or `yarn dev`).

  This forces Next.js to rebuild the page from scratch with the correct code.
*/
import prisma from "@/lib/prisma";
import GuideCategory from "@/components/GuideCategory/GuideCategory";
import Link from "next/link";
import Image from "next/image";

// Fetch guides filtered by category
async function getGuides(category) {
  try {
    return await prisma.guide.findMany({
      where: {
        status: "published",
        ...(category ? { category } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Failed to fetch guides:", error);
    return [];
  }
}

// Fetch distinct guide categories
async function getCategories() {
  try {
    const guides = await prisma.guide.findMany({
      where: {
        status: "published",
      },
      select: {
        category: true,
      },
      distinct: ["category"],
    });
    return guides.map((guide) => guide.category);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

// Page component – must be async so we can await searchParams
export default async function GuidesPage({ searchParams }) {
  // ✅ In Next.js 15 `searchParams` is a Promise – await it *before* using its properties.
  const { category } = await searchParams;

  // Fetch data in parallel for better performance
  const [guides, categories] = await Promise.all([
    getGuides(category),
    getCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-[#00ffaa] mb-8 text-center">
        {category ? `${category} Guides` : "All Guides"}
      </h1>

      {/* Category filter tabs */}
      <GuideCategory categories={categories} />

      {/* Guides grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {guides.map((guide) => (
          <div
            key={guide.id}
            className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
          >
            {/* Thumbnail */}
            {guide.thumbnail && (
              <Image
                src={guide.thumbnail}
                alt={guide.title}
                width={640}
                height={360}
                className="w-full h-48 object-cover"
              />
            )}

            {/* Card content */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {guide.title}
              </h2>
              <p className="text-gray-400 mb-4 line-clamp-3">
                {guide.description}
              </p>
              <Link
                href={`/guide/${guide.id}`}
                className="inline-block bg-[#00ffaa] text-black font-bold py-2 px-4 rounded hover:bg-[#00dd96] transition-colors"
              >
                Read Guide
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
