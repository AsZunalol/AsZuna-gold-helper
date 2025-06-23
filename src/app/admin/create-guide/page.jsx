// src/app/admin/create-guide/page.jsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import GuideForm from "@/components/GuideForm/GuideForm";
import styles from "../create-transmog-guide/transmogGuide.module.css";

const initialData = {
  title: "",
  category: "",
  expansion: "",
  description: "",
  steps: [{ id: Date.now(), content: "" }],
  youtube_video_id: "",
  gold_pr_hour: "",
  thumbnail_url: "",
  slider_images: [],
  recommended_addons: [],
  required_items: [],
  items_of_note: [],
  time_to_complete: "",
  recommended_classes: [],
  tsm_import_string: "",
  route_strings: [],
  tags: [],
  status: "DRAFT",
};

export default function CreateGuidePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (formData, newStatus) => {
    if (!formData.title) {
      setError("A title is required.");
      return;
    }
    setSubmitting(true);
    setError("");

    const guideData = {
      ...formData,
      status: newStatus,
      is_transmog: false,
      authorId: session.user.id,
      steps: JSON.stringify(formData.steps),
      slider_images: JSON.stringify(formData.slider_images),
      recommended_addons: JSON.stringify(formData.recommended_addons),
      required_items: JSON.stringify(formData.required_items),
      items_of_note: JSON.stringify(formData.items_of_note),
      route_strings: JSON.stringify(formData.route_strings),
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

  // Authorization check
  if (
    status === "authenticated" &&
    !["ADMIN", "OWNER"].includes(session.user.role)
  ) {
    router.push("/");
    return null;
  }

  return (
    <div className={styles.pageWrapper}>
      {error && <p className={styles.error}>{error}</p>}
      <GuideForm
        initialData={initialData}
        onSave={handleCreate}
        isEditing={false}
        submitting={submitting}
      />
    </div>
  );
}
