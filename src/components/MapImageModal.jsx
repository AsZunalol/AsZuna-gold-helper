// src/components/MapImageModal.jsx
"use client";

import { useState } from "react";
import Image from "next/image";

export default function MapImageModal({ src }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="map-thumbnail" onClick={() => setIsOpen(true)}>
        <Image
          src={src}
          alt="Map Thumbnail"
          width={240}
          height={140}
          className="map-thumbnail-img"
        />
        <p className="map-click-text">Click to enlarge</p>
      </div>

      {isOpen && (
        <div className="map-modal-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="map-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={src} alt="Map Full" width={1000} height={600} />
          </div>
        </div>
      )}
    </>
  );
}
