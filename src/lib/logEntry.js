import prisma from "@/lib/prisma";

export async function logEntry(type, message, level = "info") {
  try {
    await prisma.apiLog.create({
      data: {
        type,
        level,
        message,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to write log entry:", error);
  }
}
