"use client";
import React, { useState, useRef } from "react";
import { Upload, XCircle, PlusSquare } from "lucide-react";

export default function ImageSliderManager({ images = [], setImages }) {
  // Default to an empty array
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const response = await fetch(
        `/api/upload?filename=${encodeURIComponent(file.name)}`,
        {
          method: "POST",
          body: file,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload file.");
      }

      const newBlob = await response.json();
      setImages([...images, newBlob.url]); // Add the new URL to the list
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    handleFileUpload(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (urlToRemove) => {
    setImages(images.filter((url) => url !== urlToRemove));
  };

  return (
    <div className="image-slider-manager">
      <label>Image Slider</label>
      <div className="image-grid">
        {/* This map call is now safe */}
        {images.map((url, index) => (
          <div key={index} className="image-grid-item">
            <img src={url} alt={`Slider image ${index + 1}`} />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="remove-image-button"
            >
              <XCircle size={20} />
            </button>
          </div>
        ))}
        <div className="upload-new-item">
          <label htmlFor="slider-image-uploader" className="upload-label">
            <div className="upload-content">
              {uploading ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <PlusSquare size={24} />
                  <span>Add Image</span>
                </>
              )}
              <input
                id="slider-image-uploader"
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                disabled={uploading}
                style={{ display: "none" }}
              />
            </div>
          </label>
        </div>
      </div>
      {error && (
        <p
          className="error-message"
          style={{ fontSize: "0.8rem", textAlign: "left", marginTop: "0.5rem" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
