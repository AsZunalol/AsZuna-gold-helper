import Image from "next/image";
import GoldInput from "@/components/GoldInput/GoldInput";
import TimeInput from "@/components/TimeInput/TimeInput";
import MapImageModal from "@/components/map-image-modal/MapImageModal";
import ItemPrices from "@/components/ItemPrices/ItemPrices";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import "./transmog-guide.css";

export default function TransmogGuide({ guide }) {
  const itemsOfNote = guide.itemsOfNote.map((item) => ({
    id: item.id,
    name: item.name,
  }));

  return (
    <div className="guide-container-redesigned">
      <div className="guide-header-redesigned">
        <h1 className="guide-title-redesigned">{guide.title}</h1>
      </div>

      <div className="guide-layout-redesigned">
        {/* Main Content Area */}
        <div className="main-content-redesigned">
          {guide.videoUrl && (
            <div className="guide-video-redesigned">
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

          <div className="content-bg-redesigned">
            <div
              className="guide-content-redesigned"
              dangerouslySetInnerHTML={{ __html: guide.content }}
            />
          </div>

          {guide.route && (
            <div className="route-container-redesigned content-bg-redesigned">
              <h2>Farming Route</h2>
              <MapImageModal
                imageUrl={guide.route.imageUrl}
                coordinates={guide.route.coordinates}
              />
            </div>
          )}

          {guide.steps && guide.steps.length > 0 && (
            <div className="steps-container-redesigned content-bg-redesigned">
              <h2>Steps</h2>
              {guide.steps.map((step, index) => (
                <div key={index} className="step-card-redesigned">
                  <h3>
                    Step {index + 1}: {step.title}
                  </h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Area */}
        <div className="sidebar-redesigned">
          <div className="sidebar-widget-redesigned">
            <h2 className="widget-title-redesigned">Guide Details</h2>
            <div className="author-info-redesigned">
              <Image
                src={guide.author.image || "/default-avatar.png"}
                alt={guide.author.name}
                width={50}
                height={50}
                className="author-avatar-redesigned"
              />
              <div className="author-name-redesigned">
                <span>By</span>
                <strong>{guide.author.name}</strong>
              </div>
            </div>
            <div className="guide-meta-redesigned">
              <div>
                <strong>Category:</strong> {guide.category}
              </div>
              <div>
                <strong>Expansion:</strong> {guide.expansion}
              </div>
              <div>
                <strong>Updated:</strong>{" "}
                {new Date(guide.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {guide.itemsOfNote && guide.itemsOfNote.length > 0 && (
            <div className="sidebar-widget-redesigned">
              <h2 className="widget-title-redesigned">Items of Note</h2>
              <div className="items-of-note-redesigned">
                <Suspense
                  fallback={
                    <div className="flex justify-center">
                      <Spinner />
                    </div>
                  }
                >
                  <ItemPrices items={itemsOfNote} />
                </Suspense>
              </div>
            </div>
          )}
          <div className="sidebar-widget-redesigned">
            <h2 className="widget-title-redesigned">Gold/Hour Calculator</h2>
            <div className="calculator-container-redesigned">
              <GoldInput label="Gold Earned" />
              <TimeInput label="Time Spent (minutes)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
