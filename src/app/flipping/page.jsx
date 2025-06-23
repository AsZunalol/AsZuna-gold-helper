// src/app/flipping/page.jsx
"use client";
import { useState } from "react";
import ItemSearch from "@/components/ItemSearch/ItemSearch";
import ItemPrices from "@/components/ItemPrices/ItemPrices";
import styles from "./flipping.module.css";
import { useSession } from "next-auth/react";

export default function FlippingPage() {
  const [selectedItems, setSelectedItems] = useState([]);
  const { data: session } = useSession();

  const handleSelectItem = (item) => {
    // Avoid adding duplicate items
    if (!selectedItems.find((i) => i.id === item.id)) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Auction House Flipping Tool</h1>
      <div className={styles.searchContainer}>
        <ItemSearch onItemSelected={handleSelectItem} />
      </div>
      <div className={styles.resultsContainer}>
        <ItemPrices
          items={selectedItems}
          realm={session?.user?.realm || "your-realm"}
        />
      </div>
    </main>
  );
}
