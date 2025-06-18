import prisma from "@/lib/prisma";
import GuideCategory from "@/components/GuideCategory/GuideCategory";

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
          select: { name: true, image: true },
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

export default async function GuidesPage({ searchParams }) {
  const category = searchParams.category;
  const guides = await getGuides(category);
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-yellow-400 mb-8 text-center">
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
                <img
                  src={guide.author.image || "/default-avatar.png"}
                  alt={guide.author.name}
                  className="w-10 h-10 rounded-full mr-4"
                />
                <span className="text-gray-300">By {guide.author.name}</span>
              </div>
              <a
                href={`/guide/${guide.id}`}
                className="inline-block bg-yellow-500 text-black font-bold py-2 px-4 rounded hover:bg-yellow-600 transition-colors"
              >
                Read Guide
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
