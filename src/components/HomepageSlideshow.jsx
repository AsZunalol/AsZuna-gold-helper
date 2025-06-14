"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function HomepageSlideshow({ guides }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === guides.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? guides.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    if (guides.length > 1) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [guides.length]);

  if (!guides || guides.length === 0) {
    return (
      <div
        style={{ textAlign: "center", color: "var(--color-text-secondary)" }}
      >
        No recent guides to display.
      </div>
    );
  }

  return (
    <div className="slideshow-container">
      {guides.map((guide, index) => (
        <div
          key={guide.id}
          className={index === currentIndex ? "slide active" : "slide"}
        >
          <Image
            src={guide.thumbnail_url || "/images/default-thumb.jpg"}
            alt={guide.title}
            fill
            style={{ objectFit: "cover" }}
            priority={index === 0}
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
          <div className="slide-text">
            <h3>{guide.title}</h3>
            <Link href={`/guide/${guide.id}`} className="cta-button-small">
              Read The Guide →
            </Link>
          </div>
        </div>
      ))}
      <a className="prev" onClick={prevSlide}>
        ❮
      </a>
      <a className="next" onClick={nextSlide}>
        ❯
      </a>
    </div>
  );
}
