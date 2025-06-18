import prisma from "@/lib/prisma";
import GuideCategory from "@/components/GuideCategory/GuideCategory";
import Link from "next/link";
import Image from "next/image";
import styles from "./guidesPage.module.css";
import GuidesSortDropdown from "./GuidesSortDropdown";

async function getGuides(type, category, sort) {
  try {
    const orderBy = sort === "title" ? { title: "asc" } : { createdAt: "desc" };
    return await prisma.guide.findMany({
      where: {
        status: "published",
        ...(type === "transmog"
          ? { is_transmog: true }
          : { is_transmog: false }),
        ...(category ? { category } : {}),
      },
      orderBy,
    });
  } catch (error) {
    console.error("Failed to fetch guides:", error);
    return [];
  }
}

async function getCategories() {
  try {
    const guides = await prisma.guide.findMany({
      where: { status: "published" },
      select: { category: true },
      distinct: ["category"],
    });
    return guides.map((guide) => guide.category);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export default async function GuidesPage({ searchParams }) {
  const { category, type = "gold", sort = "latest" } = searchParams;
  const [guides, categories] = await Promise.all([
    getGuides(type, category, sort),
    getCategories(),
  ]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.heading}>Explore Gold & Transmog Guides</h1>

        <div className={styles.sortRow}>
          <Link
            href={`/guides?type=gold&sort=${sort}`}
            className={type === "gold" ? "active" : ""}
          >
            Gold Guides
          </Link>
          <Link
            href={`/guides?type=transmog&sort=${sort}`}
            className={type === "transmog" ? "active" : ""}
          >
            Transmog Guides
          </Link>
          <GuidesSortDropdown type={type} category={category} sort={sort} />
        </div>

        <GuideCategory categories={categories} selectedCategory={category} />

        <div className={styles.grid}>
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
