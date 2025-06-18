"use client";
import { useState } from "react";
import Image from "next/image";
import "./map-image-modal.css";

const MapImageModal = ({ imageUrl, coordinates }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <div className="map-container" onClick={() => setModalOpen(true)}>
        <Image
          src={imageUrl}
          alt="Farming Route Map"
          width={800}
          height={600}
          className="map-image"
          style={{ height: "auto" }} // This maintains the aspect ratio
        />
        {coordinates.map((coord, index) => (
          <div
            key={index}
            className="map-dot"
            style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
          >
            {index + 1}
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <Image
              src={imageUrl}
              alt="Farming Route Map"
              layout="fill"
              objectFit="contain"
            />
            {coordinates.map((coord, index) => (
              <div
                key={index}
                className="map-dot-modal"
                style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapImageModal;
