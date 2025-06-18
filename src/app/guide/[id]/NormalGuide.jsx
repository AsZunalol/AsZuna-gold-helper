import Image from "next/image";
import GoldInput from "@/components/GoldInput/GoldInput";
import TimeInput from "@/components/TimeInput/TimeInput";
import MapImageModal from "@/components/map-image-modal/MapImageModal";
import ItemPrices from "@/components/ItemPrices/ItemPrices";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import "./guide.css"; // Imports the original CSS for normal guides

export default function NormalGuide({ guide }) {
  const itemsOfNote = guide.itemsOfNote.map((item) => ({
    id: item.id,
    name: item.name,
  }));

  return (
    <div className="guide-container">
      <h1 className="guide-title">{guide.title}</h1>

      <div className="author-info">
        <Image
          src={guide.author.imageUrl || "/default-avatar.png"}
          alt={guide.author.username || "Author"}
          width={40}
          height={40}
          className="author-avatar"
        />
        <span>By {guide.author.username}</span>
      </div>

      {guide.videoUrl && (
        <div className="guide-video">
          <iframe
            src={`https://www.youtube.com/embed/${
              guide.videoUrl.split("v=")[1]
            }`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      <div
        className="guide-content"
        dangerouslySetInnerHTML={{ __html: guide.content }}
      />

      {guide.route && (
        <div className="route-container">
          <h3>Farming Route</h3>
          <MapImageModal
            imageUrl={guide.route.imageUrl}
            coordinates={guide.route.coordinates}
          />
        </div>
      )}

      {guide.steps && guide.steps.length > 0 && (
        <div className="steps-container">
          <h3>Steps</h3>
          {guide.steps.map((step, index) => (
            <div key={index} className="step">
              <h4>
                Step {index + 1}: {step.title}
              </h4>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      )}

      {guide.itemsOfNote && guide.itemsOfNote.length > 0 && (
        <div className="items-of-note">
          <h3>Items of Note</h3>
          <Suspense fallback={<Spinner />}>
            <ItemPrices items={itemsOfNote} />
          </Suspense>
        </div>
      )}

      <div className="calculator-container">
        <h3>Gold/Hour Calculator</h3>
        <GoldInput label="Gold Earned" />
        <TimeInput label="Time Spent (minutes)" />
      </div>
    </div>
  );
}
