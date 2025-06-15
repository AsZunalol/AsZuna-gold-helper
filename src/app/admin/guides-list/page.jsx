// src/app/admin/guides-list/page.jsx
"use client"; // This must be at the very top

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// Adjust path to Admin.module.css if it's in a different location relative to guides-list/page.jsx
import styles from "../Admin.module.css";

export default function AdminGuidesList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return; // Do nothing while session is loading

    // Redirect if not authenticated or not an admin
    if (status === "unauthenticated" || session?.user.role !== "ADMIN") {
      router.push("/");
      return;
    }

    const fetchGuides = async () => {
      try {
        const response = await fetch("/api/guides"); // Assuming a GET /api/guides endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch guides.");
        }
        const data = await response.json();
        setGuides(data);
      } catch (err) {
        console.error("Error fetching guides:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, [session, status, router]);

  // Initial loading state or access denied
  if (loading || status === "loading") {
    return (
      <div className={styles.container}>
        <h1 style={{ textAlign: "center", marginTop: "5rem", color: "white" }}>
          Loading Guides...
        </h1>
      </div>
    );
  }

  // Access denied after loading
  if (status === "unauthenticated" || session?.user.role !== "ADMIN") {
    return (
      <div className={styles.container}>
        <h1 style={{ textAlign: "center", marginTop: "5rem", color: "white" }}>
          Access Denied
        </h1>
        <p
          style={{ textAlign: "center", color: "var(--color-text-secondary)" }}
        >
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1
        style={{
          textAlign: "center",
          marginBottom: "2.5rem",
          color: "white",
          textShadow: "var(--shadow-glow-md)",
        }}
      >
        Manage Guides
      </h1>
      {error && <p className={styles.errorMessage}>{error}</p>}

      <div className={styles.guideGrid}>
        {guides.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              width: "100%",
              color: "var(--color-text-secondary)",
            }}
          >
            No guides found.{" "}
            <Link
              href="/admin/create-guide"
              style={{ color: "var(--color-primary)" }}
            >
              Create one now!
            </Link>
          </p>
        ) : (
          guides.map((guide) => (
            <div key={guide.id} className={styles.guideCard}>
              <div className={styles.guideCardImage}>
                <Image
                  src={guide.thumbnail_url || "/images/default-thumb.jpg"}
                  alt={guide.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className={styles.guideCardContent}>
                <h3 className={styles.guideCardTitle}>{guide.title}</h3>
                <p className={styles.guideCardMeta}>
                  Category: {guide.category || "N/A"}{" "}
                  {guide.expansion && ` | Expansion: ${guide.expansion}`}
                </p>
                <div className={styles.guideCardActions}>
                  <Link
                    href={`/admin/edit-guide/${guide.id}`}
                    className={styles.editButton}
                  >
                    Edit
                  </Link>
                  {/* Delete functionality would be here. Example: */}
                  {/* <button className={styles.deleteButton} onClick={() => handleDelete(guide.id)}>Delete</button> */}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <Link href="/admin/create-guide" className={styles.addGuideButton}>
          + Create New Guide
        </Link>
      </div>
    </div>
  );
}
