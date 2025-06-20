"use client";
import React, { useState } from "react";
import { Upload, XCircle } from "lucide-react";

export default function ImageUpload({
  imageUrl,
  setImageUrl,
  label = "Thumbnail",
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (event) => {
    setError("");
    const file = event.target.files?.[0];
    if (!file) return;

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
      setImageUrl(newBlob.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImageUrl("");
  };

  // Styles for the remove button to ensure it's always visible
  const removeButtonStyles = {
    position: "absolute",
    top: "0.5rem",
    right: "0.5rem",
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "white",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  return (
    <div className="image-upload-container">
      <label>{label}</label>
      <div className="image-upload-box">
        {imageUrl ? (
          <div className="image-preview">
            <img src={imageUrl} alt="Uploaded Thumbnail" />
            <button
              type="button"
              onClick={removeImage}
              style={removeButtonStyles}
              title="Remove image"
            >
              <XCircle size={20} />
            </button>
          </div>
        ) : (
          <label htmlFor="image-uploader" className="upload-label">
            <div className="upload-content">
              <Upload size={32} />
              <span>
                {uploading ? "Uploading..." : "Click to upload image"}
              </span>
              <input
                id="image-uploader"
                type="file"
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                disabled={uploading}
                style={{ display: "none" }}
              />
            </div>
          </label>
        )}
      </div>
      {error && (
        <p
          className="error-message"
          style={{ fontSize: "0.8rem", textAlign: "left" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
