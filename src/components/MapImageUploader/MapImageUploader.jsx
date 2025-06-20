"use client";

import { useState } from "react";
import Image from "next/image";
import ImageUpload from "@/components/ImageUpload/ImageUpload";
import styles from "./MapImageUploader.module.css";
import { XCircle } from "lucide-react";

export default function MapImageUploader({ imageUrl, setImageUrl }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    if (imageUrl) {
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles.container}>
      {!imageUrl ? (
        <ImageUpload
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          label="" // No extra label needed inside
        />
      ) : (
        <div className={styles.previewContainer}>
          <div className={styles.thumbnail} onClick={openModal}>
            <Image
              src={imageUrl}
              alt="Map Preview"
              fill
              style={{ objectFit: "cover" }}
            />
            <div className={styles.thumbnailOverlay}>
              <p>Click to enlarge</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setImageUrl("")}
            className={styles.removeButton}
            title="Remove map image"
          >
            <XCircle size={20} />
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={imageUrl} alt="Map" layout="fill" objectFit="contain" />
            <button onClick={closeModal} className={styles.closeModalButton}>
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
