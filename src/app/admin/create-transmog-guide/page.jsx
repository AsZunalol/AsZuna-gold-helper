"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./transmogGuide.module.css";
import ItemsOfNoteManager from "../../../components/ItemsOfNoteManager/ItemsOfNoteManager";

export default function CreateTransmogGuidePage() {
  const region = "eu";
  const realm = "kazzak";
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [expansion, setExpansion] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [mapImage, setMapImage] = useState(null);

  const handleImageUpload = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Create Transmog Guide</h1>

      <div className={styles.card}>
        <label>Title</label>
        <input
          className={styles.cardInput}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Guide title"
        />

        <label>Expansion</label>
        <select
          className={styles.cardInput}
          value={expansion}
          onChange={(e) => setExpansion(e.target.value)}
        >
          <option value="">Select an expansion</option>
          <option value="vanilla">Vanilla</option>
          <option value="tbc">Burning Crusade</option>
          <option value="wotlk">Wrath of the Lich King</option>
          <option value="cata">Cataclysm</option>
          <option value="df">Dragonflight</option>
        </select>

        <label>Thumbnail Image</label>
        <input
          className={styles.cardInput}
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, setThumbnail)}
        />
        {thumbnail && (
          <Image
            src={thumbnail}
            alt="Thumbnail"
            width={150}
            height={150}
            className={styles.imagePreview}
          />
        )}
      </div>

      <div className={styles.card}>
        <label>Map Image</label>
        <input
          className={styles.cardInput}
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, setMapImage)}
        />
        {mapImage && (
          <Image
            src={mapImage}
            alt="Map"
            width={300}
            height={150}
            className={styles.imagePreview}
          />
        )}
      </div>

      <div className={styles.card}>
        <h2>Items of Note</h2>
        <ItemsOfNoteManager
          items={items}
          setItems={setItems}
          region={region}
          realm={realm}
          guideType="transmog"
        />
      </div>

      <button type="submit">Save Guide</button>
    </div>
  );
}
