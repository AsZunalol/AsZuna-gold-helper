"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import TransmogGuideForm from "@/components/TransmogGuideForm/TransmogGuideForm";
import styles from "./transmogGuide.module.css";

const initialData = {
  title: "",
  expansion: "",
  guide_type: "Raid",
  description: "",
  gold_sessions: [],
  thumbnail_url: "",
  recommended_addons: [],
  items_of_note: [],
  macro_string: "",
  tags: ["transmog"],
  status: "DRAFT",
};

export default function CreateTransmogGuidePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (formData, averageGph, newStatus) => {
    if (!formData.title) {
      setError("A title is required.");
      return;
    }
    setSubmitting(true);
    setError("");

    const guideData = {
      ...formData,
      status: newStatus,
      is_transmog: true,
      category: "Transmog",
      gold_pr_hour: `${averageGph.toLocaleString()} g/hr`,
      authorId: session.user.id,
      items_of_note: JSON.stringify(formData.items_of_note),
      gold_sessions: JSON.stringify(formData.gold_sessions),
      recommended_addons: JSON.stringify(formData.recommended_addons),
      tags: formData.tags.join(","),
    };

    try {
      const response = await fetch("/api/guides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guideData),
      });
      if (!response.ok)
        throw new Error(
          (await response.json()).message || "Failed to create guide."
        );

      const newGuide = await response.json();
      router.push(`/admin/guides-list`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading")
    return (
      <div className={styles.pageWrapper}>
        <p>Loading...</p>
      </div>
    );

  return (
    <div className={styles.pageWrapper}>
      {error && <p className={styles.error}>{error}</p>}
      <TransmogGuideForm
        initialData={initialData}
        onSave={handleCreate}
        isEditing={false}
        submitting={submitting}
      />
    </div>
  );
}
