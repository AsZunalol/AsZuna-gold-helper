import prisma from "@/lib/prisma";
import GuideCategory from "@/components/GuideCategory/GuideCategory";
import Link from "next/link";
import Image from "next/image";

async function getGuides(type, category) {
  try {
    return await prisma.guide.findMany({
      where: {
        status: "published",
        ...(type === "transmog"
          ? { is_transmog: true }
          : { is_transmog: false }),
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
  const { category, type = "gold" } = await searchParams;
  const [guides, categories] = await Promise.all([
    getGuides(type, category),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center text-[#00ffaa] mb-10 tracking-tight">
          Explore Gold & Transmog Guides
        </h1>

        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <Link
            href="/guides?type=gold"
            className={`px-6 py-3 rounded-full border-2 transition-all ${
              type === "gold"
                ? "bg-[#00ffaa] text-black border-transparent"
                : "border-[#00ffaa] hover:bg-[#00ffaa22]"
            }`}
          >
            Gold Guides
          </Link>
          <Link
            href="/guides?type=transmog"
            className={`px-6 py-3 rounded-full border-2 transition-all ${
              type === "transmog"
                ? "bg-[#00ffaa] text-black border-transparent"
                : "border-[#00ffaa] hover:bg-[#00ffaa22]"
            }`}
          >
            Transmog Guides
          </Link>
        </div>

        <GuideCategory categories={categories} selectedCategory={category} />

        <div className="grid gap-8 mt-12 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className="bg-[#1a1f2c] rounded-2xl shadow-lg overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="relative w-full h-52">
                <Image
                  src={guide.thumbnail || "/images/default-thumb.jpg"}
                  alt={guide.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 bg-[#1a2027] text-yellow-500 text-sm font-bold px-2 py-1 rounded shadow">
                  {guide.gold_pr_hour?.replace(/\s*g\/hr\s*$/i, "") || "N/A"}{" "}
                  GPH
                </div>
                {guide.expansion && (
                  <div className="absolute top-2 left-2 bg-[#1a2027] text-white text-sm font-bold px-2 py-1 rounded shadow">
                    {guide.expansion}
                  </div>
                )}
                {guide.category && (
                  <div className="absolute bottom-2 left-2 bg-[#1a2027] text-white text-xs font-semibold px-2 py-1 rounded shadow">
                    {guide.category}
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col justify-between h-full">
                <h2 className="text-2xl font-bold mb-3 leading-snug">
                  {guide.title}
                </h2>
                <Link
                  href={`/guide/${guide.id}`}
                  className="inline-block mt-auto bg-[#00ffaa] text-black text-center font-semibold py-2 px-5 rounded-xl hover:bg-[#00cc88] transition"
                >
                  Read Guide
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
