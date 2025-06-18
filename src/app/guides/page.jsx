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

// Data fetching functions remain async, which is correct.
async function getGuides(category) {
  try {
    const whereClause = {
      status: "published",
    };

    if (category) {
      whereClause.category = category;
    }

    const guides = await prisma.guide.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            username: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return guides;
  } catch (error) {
    console.error("Failed to fetch guides:", error);
    return [];
  }
}

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

// THE FIX: This page component MUST be declared as `async` to use `searchParams`.
// This allows the component to correctly handle dynamic request data on the server.
export default async function GuidesPage({ searchParams }) {
  // Now we can safely access properties of searchParams
  const category = searchParams.category;

  // Await the data fetching calls
  const guides = await getGuides(category);
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-[#00ffaa] mb-8 text-center">
        {category ? `${category} Guides` : "All Guides"}
      </h1>
      <GuideCategory categories={categories} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {guides.map((guide) => (
          <div
            key={guide.id}
            className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {guide.title}
              </h2>
              <p className="text-gray-400 mb-4">Category: {guide.category}</p>
              <div className="flex items-center mb-4">
                <Image
                  src={guide.author.imageUrl || "/default-avatar.png"}
                  alt={guide.author.username || "Author"}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full mr-4 object-cover"
                />
                <span className="text-gray-300">
                  By {guide.author.username}
                </span>
              </div>
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
