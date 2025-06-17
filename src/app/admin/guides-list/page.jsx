// src/app/admin/guides-list/page.jsx

import Link from "next/link";
import prisma from "@/lib/prisma";
import { FilePenLine, Trash2 } from "lucide-react";
import styles from "./guides-list.module.css"; // Using a new CSS module

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

export default async function GuidesListPage() {
  const guides = await getGuides();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Manage Guides</h1>
      </div>
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
              {guides.map((guide) => (
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
                    <Link
                      href={`/admin/edit-guide/${guide.id}`}
                      className={styles.actionButton}
                    >
                      <FilePenLine size={16} /> Edit
                    </Link>
                    {/* You would add a delete button/handler here */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No guides found.</p>
      )}
    </div>
  );
}
