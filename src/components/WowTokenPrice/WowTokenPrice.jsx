"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./WowTokenPrice.module.css";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const TrendIcon = ({ trend }) => {
  if (trend === "up")
    return <TrendingUp size={16} className={styles.trendUp} />;
  if (trend === "down")
    return <TrendingDown size={16} className={styles.trendDown} />;
  return <Minus size={16} className={styles.trendStable} />;
};

const formatPrice = (price) => {
  return price > 0 ? `${(price / 1000).toFixed(1)}k` : "N/A";
};

const TokenDisplay = ({ region, data, loading }) => {
  const {
    price = 0,
    trend = "stable",
    history = { avg: 0, high: 0, low: 0 },
  } = data || {};

  return (
    <div className={styles.tooltip}>
      <div className={styles.priceContainer}>
        <span className={styles.regionLabel}>{region.toUpperCase()}:</span>
        <span className={styles.priceValue}>
          {loading ? "Loading..." : formatPrice(price)}
        </span>
        {!loading && <TrendIcon trend={trend} />}
      </div>
      <div className={styles.tooltipContent}>
        <div className={styles.tooltipTitle}>
          {region.toUpperCase()} Token Price
        </div>
        <div className={styles.tooltipRow}>
          {/* Updated text to "7 Day" */}
          <span>7 Day Avg:</span>
          <span>{formatPrice(history.avg)}</span>
        </div>
        <div className={styles.tooltipRow}>
          <span>7 Day High:</span>
          <span>{formatPrice(history.high)}</span>
        </div>
        <div className={styles.tooltipRow}>
          <span>7 Day Low:</span>
          <span>{formatPrice(history.low)}</span>
        </div>
      </div>
    </div>
  );
};

export default function WowTokenPrice() {
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch("/api/blizzard/wow-token");
        if (!response.ok) {
          throw new Error("Failed to fetch token prices");
        }
        const data = await response.json();
        setPrices(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  return (
    <div className={styles.container}>
      <Image
        src="/icons/wow_token.png"
        alt="WoW Token Icon"
        width={24}
        height={24}
        className={styles.tokenIcon}
      />
      <TokenDisplay region="na" data={prices?.us} loading={loading} />
      <div className={styles.separator}></div>
      <TokenDisplay region="eu" data={prices?.eu} loading={loading} />
    </div>
  );
}
