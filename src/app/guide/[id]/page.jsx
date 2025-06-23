// src/app/guide/[id]/page.jsx

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image"; // Import the Image component
import TransmogGuide from "./TransmogGuide";
import NormalGuide from "./NormalGuide";
import { WOW_EXPANSIONS } from "@/lib/constants"; // Import expansions for color coding
import styles from "./transmog-guide.module.css";

// Reusable GuideHeader component
const GuideHeader = ({ guide }) => {
  const expansionInfo = WOW_EXPANSIONS.find(
    (exp) => exp.name === guide.expansion
  );
  const allTags = guide.tags
    ? guide.tags.split(",").map((tag) => tag.trim())
    : [];

  // Helper to format the GPH string
  const formatGPH = (gphString) => {
    if (!gphString) return "N/A";
    const numericPart = parseInt(gphString.replace(/[^0-9]/g, ""), 10);
    return isNaN(numericPart) ? "N/A" : `${numericPart.toLocaleString()} GPH`;
  };

  return (
    <div className="relative mb-8 overflow-hidden rounded-lg">
      <Image
        src={guide.thumbnail_url || "/images/default-thumb.jpg"}
        alt={guide.title}
        width={1600}
        height={400}
        className="object-cover w-full h-96"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute top-4 left-4">
        <span className="px-3 py-1 text-sm font-bold text-blue-200 bg-black/30 backdrop-blur-md border border-white/10 rounded-full">
          {guide.category}
        </span>
      </div>
      <div className="absolute top-4 right-4">
        <span className="px-4 py-2 text-base font-bold text-yellow-400 bg-black/30 backdrop-blur-md border border-white/10 rounded-lg">
          {formatGPH(guide.gold_pr_hour)}
        </span>
      </div>
      {/* ADDED a container with glassy background effect */}
      <div className="absolute bottom-4 left-4 p-4 bg-black/30 backdrop-blur-md rounded-lg border border-white/10">
        <h1 className="text-4xl font-black tracking-tight text-white">
          {guide.title}
        </h1>
        {expansionInfo && (
          <p
            className="text-lg font-semibold"
            style={{ color: expansionInfo.color }}
          >
            {guide.expansion}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {allTags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs font-semibold text-white bg-gray-700/80 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

async function getGuide(id) {
  try {
    const guide = await prisma.guide.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        author: {
          select: {
            username: true,
            imageUrl: true,
          },
        },
      },
    });
    return guide;
  } catch (error) {
    console.error("Failed to fetch guide:", error);
    return null;
  }
}

export default async function Page({ params }) {
  const { id } = await params;
  const guide = await getGuide(id);

  if (!guide) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <GuideHeader guide={guide} />
      {guide.is_transmog ? (
        <TransmogGuide guide={guide} />
      ) : (
        <NormalGuide guide={guide} />
      )}
    </div>
  );
}
