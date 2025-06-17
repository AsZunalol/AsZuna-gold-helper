// src/app/admin/page.jsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { FilePenLine } from "lucide-react";
import styles from "./Admin.module.css";

async function getGuides() {
  try {
    const guides = await prisma.guide.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: { username: true },
        },
      },
    });
    return guides;
  } catch (error) {
    console.error("Failed to fetch guides:", error);
    return [];
  }
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // Redirect if not an Admin or Owner
  if (!session || !["ADMIN", "OWNER"].includes(session.user.role)) {
    redirect("/");
  }

  const guides = await getGuides();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
      </div>

      {/* Guide Management Table */}
      <h2 className={styles.sectionHeader}>Manage Guides</h2>
      {guides.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.guidesTable}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Author</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {guides.map((guide) => {
                // This logic correctly determines which editor to use
                const editPath = guide.is_transmog
                  ? `/admin/edit-transmog-guide/${guide.id}`
                  : `/admin/edit-guide/${guide.id}`;

                return (
                  <tr key={guide.id}>
                    <td>{guide.title}</td>
                    <td>{guide.category}</td>
                    <td>
                      <span
                        className={`${styles.statusPill} ${
                          guide.status === "PUBLISHED"
                            ? styles.published
                            : styles.draft
                        }`}
                      >
                        {guide.status}
                      </span>
                    </td>
                    <td>{guide.author.username}</td>
                    <td>{new Date(guide.updatedAt).toLocaleDateString()}</td>
                    <td className={styles.actionsCell}>
                      <Link href={editPath} className={styles.actionButton}>
                        <FilePenLine size={16} /> Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No guides found.</p>
      )}
    </div>
  );
}
