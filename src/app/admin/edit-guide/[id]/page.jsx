// src/app/admin/edit-guide/[id]/page.jsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import GuideForm from "@/components/GuideForm/GuideForm";
import Spinner from "@/components/ui/spinner";
import styles from "../../create-transmog-guide/transmogGuide.module.css";

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

export default function EditGuidePage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: session, status } = useSession();
  const [guideData, setGuideData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id || status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    const fetchGuideData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/guides/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch guide data.");
        }
        const data = await response.json();

        // Helper to safely parse JSON fields
        const parseJson = (jsonString, defaultValue = []) => {
          if (!jsonString) return defaultValue;
          try {
            const parsed = JSON.parse(jsonString);
            return parsed || defaultValue;
          } catch {
            return defaultValue;
          }
        };

        setGuideData({
          ...initialData,
          ...data,
          steps: parseJson(data.steps, [{ id: Date.now(), content: "" }]),
          slider_images: parseJson(data.slider_images),
          recommended_addons: parseJson(data.recommended_addons),
          required_items: parseJson(data.required_items),
          items_of_note: parseJson(data.items_of_note),
          route_strings: parseJson(data.route_strings),
          tags: data.tags ? data.tags.split(",") : [],
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGuideData();
  }, [id, status, router]);

  const handleUpdate = async (formData, newStatus) => {
    if (!formData.title) {
      setError("A title is required.");
      return;
    }
    setSubmitting(true);
    setError("");

    const dataToSave = {
      ...formData,
      status: newStatus,
      steps: JSON.stringify(formData.steps),
      slider_images: JSON.stringify(formData.slider_images),
      recommended_addons: JSON.stringify(formData.recommended_addons),
      required_items: JSON.stringify(formData.required_items),
      items_of_note: JSON.stringify(formData.items_of_note),
      route_strings: JSON.stringify(formData.route_strings),
      tags: formData.tags.join(","),
    };

    try {
      const response = await fetch(`/api/guides/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        throw new Error(
          (await response.json()).message || "Failed to update guide."
        );
      }

      router.push(`/admin/guides-list`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className="flex justify-center items-center h-screen">
          <Spinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageWrapper}>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <GuideForm
        initialData={guideData}
        onSave={handleUpdate}
        isEditing={true}
        submitting={submitting}
      />
    </div>
  );
}
