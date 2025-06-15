// scripts/seed-items-of-note.js

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const guideId = 1; // Change this to the ID of the guide you want to update

  const newItems = [
    "Peacebloom",
    "Silverleaf",
    "Earthroot",
    "Copper Ore",
    "Linen Cloth",
  ];

  await prisma.guide.update({
    where: { id: guideId },
    data: {
      itemsOfNote: JSON.stringify(newItems),
    },
  });

  console.log(
    `✅ Updated guide #${guideId} with ${newItems.length} items of note.`
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Error updating guide:", e);
  prisma.$disconnect();
  process.exit(1);
});
