"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { PROFILE_IMAGES } from "@/lib/constants";
import styles from "./ChangeAvatarModal.module.css";

export default function ChangeAvatarModal({ user, onClose, onAvatarChange }) {
  const [selectedAvatar, setSelectedAvatar] = useState(user.imageUrl);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (selectedAvatar === user.imageUrl) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: selectedAvatar }),
      });

      if (!response.ok) {
        throw new Error("Failed to update avatar");
      }

      onAvatarChange(user.id, selectedAvatar);
      toast.success("Avatar updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to update avatar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Change Avatar for {user.username}</h3>
        <div className={styles.avatarGrid}>
          {PROFILE_IMAGES.map((src) => (
            <div
              key={src}
              className={`${styles.avatarWrapper} ${
                selectedAvatar === src ? styles.selected : ""
              }`}
              onClick={() => setSelectedAvatar(src)}
            >
              <Image src={src} alt={`Avatar option`} width={64} height={64} />
            </div>
          ))}
        </div>
        <div className={styles.modalActions}>
          <button onClick={onClose} className="form-button secondary">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="form-button"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Avatar"}
          </button>
        </div>
      </div>
    </div>
  );
}
