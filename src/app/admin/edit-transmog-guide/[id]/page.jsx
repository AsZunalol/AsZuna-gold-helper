"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import TransmogGuideForm from "@/components/TransmogGuideForm/TransmogGuideForm";
import styles from "../../create-transmog-guide/transmogGuide.module.css";

export default function EditTransmogGuidePage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: session } = useSession();
  const [guideData, setGuideData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchGuideData = async () => {
        try {
          const response = await fetch(`/api/guides/${id}`);
          if (!response.ok) throw new Error("Failed to fetch guide data.");
          const data = await response.json();
          const parseJSON = (jsonString, defaultValue = []) => {
            try {
              if (!jsonString) return defaultValue;
              return typeof jsonString === "object"
                ? jsonString
                : JSON.parse(jsonString);
            } catch {
              return defaultValue;
            }
          };
          setGuideData({
            ...data,
            gold_sessions: parseJSON(data.gold_sessions),
            recommended_addons: parseJSON(data.recommended_addons),
            items_of_note: parseJSON(data.items_of_note),
            tags: data.tags ? data.tags.split(",") : ["transmog"],
          });
        } catch (err) {
          setError("Could not load guide data: " + err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchGuideData();
    }
  }, [id]);

  const handleUpdate = async (formData, averageGph, newStatus) => {
    if (!formData.title) {
      setError("A title is required.");
      return;
    }
    setSubmitting(true);
    setError("");

    const guideData = {
      ...formData,
      status: newStatus,
      gold_pr_hour: `${averageGph.toLocaleString()} g/hr`,
      items_of_note: JSON.stringify(formData.items_of_note),
      gold_sessions: JSON.stringify(formData.gold_sessions),
      recommended_addons: JSON.stringify(formData.recommended_addons),
      tags: formData.tags.join(","),
    };

    try {
      const response = await fetch(`/api/guides/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guideData),
      });
      if (!response.ok)
        throw new Error(
          (await response.json()).message || "Failed to update guide."
        );
      router.push("/admin/guides-list");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className={styles.pageWrapper}>
        <p>Loading editor...</p>
      </div>
    );
  if (error)
    return (
      <div className={styles.pageWrapper}>
        <p className={styles.error}>{error}</p>
      </div>
    );

  return (
    <div className={styles.pageWrapper}>
      {guideData && (
        <TransmogGuideForm
          initialData={guideData}
          onSave={handleUpdate}
          isEditing={true}
          submitting={submitting}
        />
      )}
    </div>
  );
}
