"use client";
import React, { useState, useRef } from "react";
import { Upload, XCircle, PlusSquare } from "lucide-react";

export default function ImageSliderManager({ images, setImages }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // This ensures `images` is always an array, even if null or undefined is passed.
  const safeImages = Array.isArray(images) ? images : [];

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
      // Use the safeImages array to ensure we're adding to a valid array
      setImages([...safeImages, newBlob.url]);
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
    setImages(safeImages.filter((url) => url !== urlToRemove));
  };

  return (
    <div className="image-slider-manager">
      <label>Image Slider</label>
      <div className="image-grid">
        {/* This map call is now safe because it uses `safeImages` */}
        {safeImages.map((url, index) => (
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
