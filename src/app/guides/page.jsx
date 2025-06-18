import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import GuideCategory from "@/components/GuideCategory/GuideCategory";
import Link from "next/link";
import Image from "next/image";
import styles from "./guidesPage.module.css";
import cardStyles from "./GuideCard.module.css";
import GuidesSortDropdown from "./GuidesSortDropdown";

export default async function GuidesPage({ searchParams }) {
  const category = searchParams.get("category") || null;
  const type = searchParams.get("type") || "gold";
  const sort = searchParams.get("sort") || "latest";

  async function getGuides(type, category, sort) {
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
  }

  async function getCategories() {
    const guides = await prisma.guide.findMany({
      where: { status: "published" },
      select: { category: true },
      distinct: ["category"],
    });
    return guides.map((guide) => guide.category);
  }

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
            <div key={guide.id} className={cardStyles.card}>
              <div className={cardStyles.thumbnail}>
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
              <div className="p-4">
                <h2 className="text-lg font-bold mb-2 leading-snug">
                  {guide.title}
                </h2>
                <Link
                  href={`/guide/${guide.id}`}
                  className={cardStyles.readButton}
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
