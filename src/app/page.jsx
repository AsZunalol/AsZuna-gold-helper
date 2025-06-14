import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import HomepageSlideshow from "@/components/HomepageSlideshow";
import ParticlesComponent from "@/components/ParticlesComponent";

const prisma = new PrismaClient();

async function getLatestGuides() {
  try {
    const guides = await prisma.guide.findMany({
      where: { is_route: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    return guides;
  } catch (error) {
    console.error("Failed to fetch latest guides:", error);
    return [];
  }
}

const categories = [
  {
    name: "Raw Gold",
    href: "/guides?category=Raw+Gold",
    description: "Consistent gold from farming mobs and materials.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="48px"
        height="48px"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9h4v2h-4v-2zm-2 4h8v2H8v-2zm8-8H8v2h8V7z" />
      </svg>
    ),
  },
  {
    name: "Gathering",
    href: "/routes",
    description: "Reliable income from Mining, Herbalism, and Skinning.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="48px"
        height="48px"
      >
        <path d="M17.65 3.35C16.41 2.11 14.33 2.47 13.5 3.5L3.5 13.5c-1.39 1.39-1.39 3.65 0 5.04l5.04 5.04c1.39 1.39 3.65 1.39 5.04 0l10-10c1.03-.98.67-3.06-.58-4.31l-3.35-3.35zM8.46 17.54l-4-4c-.78-.78-.78-2.05 0-2.83l4-4c.78-.78 2.05-.78 2.83 0l4 4c.78.78.78 2.05 0 2.83l-4 4c-.78.78-2.05-.78-2.83 0z" />
      </svg>
    ),
  },
  {
    name: "Professions",
    href: "/guides?category=Profession",
    description: "Master crafting and generate massive profits.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="48px"
        height="48px"
      >
        <path d="M22 2v2h-2V2h-2v2h-2V2h-2v2h-2V2h-2v2h-2V2H8v2H6V2H4v2H2v18h20V2h-2zM8 18H4v-8h4v8zm6 0h-4v-8h4v8zm6 0h-4v-8h4v8z" />
      </svg>
    ),
  },
  {
    name: "Flipping",
    href: "/guides?category=Flipping",
    description: "Buy low, sell high. Dominate the Auction House.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="48px"
        height="48px"
      >
        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
      </svg>
    ),
  },
];

export default async function Homepage() {
  const latestGuides = await getLatestGuides();

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Master the Markets of Azeroth</h1>
          <p className="hero-subtitle">
            Your ultimate hub for the latest World of Warcraft gold-making
            strategies. From simple farms to complex market flipping.
          </p>
          <Link href="/guides" className="cta-button">
            <span>Browse All Guides</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 0 24 24"
              width="24px"
              fill="currentColor"
            >
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" />
            </svg>
          </Link>
        </div>
      </section>

      <section className="feature-section">
        <h2 className="section-title">Explore by Category</h2>
        <div className="category-grid">
          {categories.map((category) => (
            <Link
              href={category.href}
              key={category.name}
              className="category-card"
            >
              {category.icon}
              <h3>{category.name}</h3>
              <p>{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="feature-section">
        <h2 className="section-title">Latest Guides</h2>
        <HomepageSlideshow guides={latestGuides} />
      </section>
    </main>
  );
}
// NOTE: The extra '}' that was here before has been removed.
