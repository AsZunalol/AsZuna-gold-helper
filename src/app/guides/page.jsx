// src/app/guides/page.jsx

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import styles from "./guidesPage.module.css";
import cardStyles from "./GuideCard.module.css";
import GuidesSortDropdown from "./GuidesSortDropdown";
import GuideTypeSwitcher from "./GuideTypeSwitcher";
import ExpansionFilter from "./ExpansionFilter";
import SearchFilter from "./SearchFilter";
import CategoryFilter from "./CategoryFilter";
import LoadMoreButton from "./LoadMoreButton";
import { GUIDE_CATEGORIES } from "@/lib/constants";
import ClearFiltersButton from "./ClearFiltersButton";

export const dynamic = "force-dynamic";

const GUIDES_PER_PAGE = 9;

export default async function GuidesPage({ searchParams }) {
  const { category, type, sort, expansion, search, page } = await searchParams;

  const currentPage = parseInt(page || "1", 10);
  const skip = (currentPage - 1) * GUIDES_PER_PAGE;

  const parseGoldPerHour = (gphString) => {
    if (!gphString) return 0;
    const numericPart = gphString.replace(/[^0-9.]/g, "");
    return parseFloat(numericPart) || 0;
  };

  async function getGuides(
    type,
    category,
    sort,
    expansion,
    search,
    take,
    skip
  ) {
    let orderBy = {};

    if (sort === "title") {
      orderBy = { title: "asc" };
    } else if (sort === "gph_desc") {
      orderBy = { gold_pr_hour: "desc" };
    } else if (sort === "gph_asc") {
      orderBy = { gold_pr_hour: "asc" };
    } else {
      orderBy = { createdAt: "desc" };
    }

    const whereClause = {
      status: "PUBLISHED",
      ...(type === "transmog" ? { is_transmog: true } : {}),
      ...(type === "gold" ? { is_transmog: false } : {}),
      ...(category ? { category } : {}),
      ...(expansion ? { expansion } : {}),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { tags: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    console.log("🧠 WHERE CLAUSE:", JSON.stringify(whereClause));

    const guides = await prisma.guide.findMany({
      where: whereClause,
      orderBy,
      take,
      skip,
    });

    const totalGuidesCount = await prisma.guide.count({
      where: whereClause,
    });

    console.log("📦 PUBLIC GUIDES PAGE fetched:", guides.length, "guides");
    if (guides.length === 0) {
      console.warn("⚠️ No published guides returned");
    } else {
      guides.forEach((g) => console.log(`→ ${g.title} [${g.status}]`));
    }

    if (sort === "gph_desc") {
      guides.sort(
        (a, b) =>
          parseGoldPerHour(b.gold_pr_hour) - parseGoldPerHour(a.gold_pr_hour)
      );
    } else if (sort === "gph_asc") {
      guides.sort(
        (a, b) =>
          parseGoldPerHour(a.gold_pr_hour) - parseGoldPerHour(b.gold_pr_hour)
      );
    }

    return { guides, totalGuidesCount };
  }

  const availableCategories = GUIDE_CATEGORIES;

  const [{ guides, totalGuidesCount }] = await Promise.all([
    getGuides(
      type ?? "gold",
      category ?? null,
      sort ?? "latest",
      expansion ?? null,
      search ?? null,
      GUIDES_PER_PAGE,
      skip
    ),
  ]);

  const hasMoreGuides = currentPage * GUIDES_PER_PAGE < totalGuidesCount;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.heading}>Explore Gold & Transmog Guides</h1>

        <div className={styles.sortRow}>
          <GuideTypeSwitcher
            currentType={type ?? "gold"}
            currentSort={sort ?? "latest"}
            currentCategory={category ?? null}
          />
          <GuidesSortDropdown
            type={type ?? "gold"}
            currentCategory={category ?? null}
            sort={sort ?? "latest"}
          />
          <ExpansionFilter
            currentExpansion={expansion ?? null}
            currentType={type ?? "gold"}
            currentSort={sort ?? "latest"}
            currentCategory={category ?? null}
          />
          <ClearFiltersButton />
        </div>

        <div className={styles.searchRow}>
          <SearchFilter
            currentSearch={search ?? ""}
            currentType={type ?? "gold"}
            currentSort={sort ?? "latest"}
            currentCategory={category ?? null}
            currentExpansion={expansion ?? null}
          />
        </div>

        <CategoryFilter
          availableCategories={availableCategories}
          currentCategory={category ?? null}
          currentType={type ?? "gold"}
          currentSort={sort ?? "latest"}
          currentExpansion={expansion ?? null}
          currentSearch={search ?? null}
        />

        <div className={styles.grid}>
          {guides.map((guide) => (
            <div key={guide.id} className={cardStyles.card}>
              <div className={cardStyles.thumbnail}>
                <Image
                  src={guide.thumbnail_url || "/images/default-thumb.jpg"}
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

        {hasMoreGuides && (
          <LoadMoreButton
            currentPage={currentPage}
            currentType={type ?? "gold"}
            currentSort={sort ?? "latest"}
            currentCategory={category ?? null}
            currentExpansion={expansion ?? null}
            currentSearch={search ?? null}
          />
        )}
      </div>
    </div>
  );
}
