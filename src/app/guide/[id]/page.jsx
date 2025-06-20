// src/app/guide/[id]/page.jsx

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image"; // Import the Image component
import TransmogGuide from "./TransmogGuide";
import NormalGuide from "./NormalGuide";
import { WOW_EXPANSIONS } from "@/lib/constants"; // Import expansions for color coding

// Reusable GuideHeader component
const GuideHeader = ({ guide }) => {
  const expansionInfo = WOW_EXPANSIONS.find(
    (exp) => exp.name === guide.expansion
  );
  const allTags = guide.tags
    ? guide.tags.split(",").map((tag) => tag.trim())
    : [];

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
        <span className="px-3 py-1 text-sm font-bold text-white bg-pink-600 rounded-full">
          {guide.category}
        </span>
      </div>
      <div className="absolute bottom-4 right-4">
        <span className="px-3 py-1 text-sm font-bold text-black bg-yellow-400 rounded-full">
          {guide.gold_pr_hour || "N/A"}
        </span>
      </div>
      <div className="absolute bottom-4 left-4 text-white">
        <h1 className="text-4xl font-black tracking-tight">{guide.title}</h1>
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
              className="px-2 py-1 text-xs font-semibold bg-gray-700 rounded"
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
