"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./GuideMapImage.module.css";

export default function GuideMapImage({ imageUrl }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If there's no map image URL provided, don't render anything.
  if (!imageUrl) {
    return null;
  }

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className={styles.thumbnail} onClick={openModal}>
        <Image
          src={imageUrl}
          alt="Farming Route Map"
          fill
          style={{ objectFit: "cover" }}
        />
        <div className={styles.thumbnailOverlay}>
          <p>Click to enlarge map</p>
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={imageUrl}
              alt="Farming Route Map"
              layout="fill"
              objectFit="contain"
            />
            <button onClick={closeModal} className={styles.closeModalButton}>
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
