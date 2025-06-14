"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./Admin.module.css";

// Define your predefined list of tags here.
// You can expand this list as needed.
const PREDEFINED_TAGS = [
  "Solo",
  "Group",
  "Dungeon",
  "Open World",
  "Profession",
  "Flipping",
  "Faction",
  "Alliance",
  "Neutral",
  "Horde",
  "Transmog",
  "PVE",
  "PVP",
  "Crafting",
  "Gathering",
  "Consumables",
  "Mounts",
  "Pets",
  "Seasonal Event",
  "Beginner-Friendly",
  "High Capital",
  "Low Effort",
  "High Profit",
  "Herbalism",
  "Mining",
  "Skinning",
  "Blacksmithing",
  "Alchemy",
  "Enchanting",
  "Jewelcrafting",
  "Inscription",
  "Leatherworking",
  "Tailoring",
  "Engineering",
  "Cooking",
  "Fishing",
].sort(); // Optional: Keep them sorted alphabetically

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Raw Gold");
  const [expansion, setExpansion] = useState("Dragonflight");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [youtubeVideoId, setYoutubeVideoId] = useState("");
  const [steps, setSteps] = useState([{ id: 1, content: "" }]);
  const [tags, setTags] = useState([]); // Array to hold selected tags
  const [newTagInput, setNewTagInput] = useState(""); // Input for current tag being typed
  const [filteredSuggestions, setFilteredSuggestions] = useState([]); // Suggestions based on input
  const [showSuggestions, setShowSuggestions] = useState(false); // Control suggestions visibility
  const [goldPrHour, setGoldPrHour] = useState(""); // State for gold per hour
  const [addons, setAddons] = useState(""); // New state for addons

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // --- Handlers for managing steps (unchanged) ---
  const handleAddStep = () => {
    setSteps([...steps, { id: Date.now(), content: "" }]);
  };

  const handleRemoveStep = (id) => {
    setSteps(steps.filter((step) => step.id !== id));
  };

  const handleStepChange = (id, value) => {
    const newSteps = steps.map((step) =>
      step.id === id ? { ...step, content: value } : step
    );
    setSteps(newSteps);
  };

  const handleMoveStep = (index, direction) => {
    const newSteps = [...steps];
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= newSteps.length) return;

    [newSteps[index], newSteps[newIndex]] = [
      newSteps[newIndex],
      newSteps[index],
    ];

    setSteps(newSteps);
  };

  // --- Handlers for managing tags (unchanged) ---

  // Filters suggestions as user types, or shows all when input is empty
  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setNewTagInput(value);

    if (value.length > 0) {
      const lowerCaseValue = value.toLowerCase();
      // Filter predefined tags: must include typed value and not be already selected
      const suggestions = PREDEFINED_TAGS.filter(
        (tag) =>
          tag.toLowerCase().includes(lowerCaseValue) && !tags.includes(tag)
      );
      setFilteredSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      // When input is empty, show all predefined tags not already selected
      const allAvailableTags = PREDEFINED_TAGS.filter(
        (tag) => !tags.includes(tag)
      );
      setFilteredSuggestions(allAvailableTags);
      setShowSuggestions(true); // Always show when focused and empty, for inspiration
    }
  };

  // Handles adding tag when Enter is pressed
  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission or newline
      const trimmedTag = newTagInput.trim();
      const normalizedTrimmedTag = trimmedTag.toLowerCase();

      // Find an exact match (case-insensitive) in predefined tags
      const matchedPredefinedTag = PREDEFINED_TAGS.find(
        (tag) => tag.toLowerCase() === normalizedTrimmedTag
      );

      if (matchedPredefinedTag && !tags.includes(matchedPredefinedTag)) {
        setTags([...tags, matchedPredefinedTag]);
        setNewTagInput("");
        setFilteredSuggestions([]);
        setShowSuggestions(false);
      } else {
        // Optionally, provide feedback if tag is not found or already added
        // setError("Tag not recognized or already added.");
      }
    } else if (e.key === "Backspace" && newTagInput === "" && tags.length > 0) {
      // Allows removing last tag by pressing backspace if input is empty
      setTags(tags.slice(0, tags.length - 1));
    }
  };

  // Handles adding tag when a suggestion is clicked
  const handleSelectSuggestion = (suggestion) => {
    if (!tags.includes(suggestion)) {
      setTags([...tags, suggestion]);
    }
    setNewTagInput("");
    setFilteredSuggestions([]);
    setShowSuggestions(false);
  };

  // Handles removing a tag pill
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    const stepsJson = JSON.stringify(steps.map((step) => step.content));
    const tagsString = tags.join(", "); // Convert array of tags to a comma-separated string for saving

    try {
      const response = await fetch("/api/guides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          expansion,
          description,
          thumbnail_url: thumbnailUrl,
          youtube_video_id: youtubeVideoId,
          steps: stepsJson,
          tags: tagsString,
          gold_pr_hour: goldPrHour,
          addons, // Include addons here
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Something went wrong");

      setSuccessMessage("Guide created successfully!");
      setTitle("");
      setCategory("Raw Gold");
      setExpansion("Dragonflight");
      setDescription("");
      setThumbnailUrl("");
      setYoutubeVideoId("");
      setSteps([{ id: 1, content: "" }]);
      setTags([]);
      setNewTagInput("");
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      setGoldPrHour("");
      setAddons(""); // Clear addons input
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="page-background">
        <div className={styles.container}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user.role !== "ADMIN") {
    return (
      <div className="page-background">
        <div className={styles.container}>
          <h1>Access Denied</h1>
          <p>You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  // --- SVG Icons for Controls (unchanged) ---
  const MoveUpIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 -960 960 960"
      width="24"
    >
      <path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z" />
    </svg>
  );
  const MoveDownIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 -960 960 960"
      width="24"
    >
      <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
    </svg>
  );
  const RemoveIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 -960 960 960"
      width="24"
    >
      <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
    </svg>
  );

  return (
    <div className="page-background">
      <div className={styles.container}>
        <h1>Create New Guide</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p className={styles.errorMessage}>{error}</p>}
          {successMessage && (
            <p className={styles.successMessage}>{successMessage}</p>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="title">Guide Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Raw Gold">Raw Gold</option>
              <option value="Gathering">Gathering</option>
              <option value="Profession">Professions</option>
              <option value="Flipping">Flipping</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description">Short Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
            ></textarea>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="thumbnailUrl">Thumbnail Image URL</label>
            <input
              type="text"
              id="thumbnailUrl"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="e.g., https://i.imgur.com/your-image.jpg"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="youtubeVideoId">YouTube Video ID (Optional)</label>
            <input
              type="text"
              id="youtubeVideoId"
              value={youtubeVideoId}
              onChange={(e) => setYoutubeVideoId(e.target.value)}
              placeholder="e.g., dQw4w9WgXcQ"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="goldPrHour">Estimated Gold per Hour</label>
            <input
              type="text" // Or "number" if you want to restrict input, but "text" allows "10k" etc.
              id="goldPrHour"
              value={goldPrHour}
              onChange={(e) => setGoldPrHour(e.target.value)}
              placeholder="e.g., 50,000g"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="addons">Required/Suggested Addons</label>
            <textarea
              id="addons"
              value={addons}
              onChange={(e) => setAddons(e.target.value)}
              rows="3"
              placeholder="List any required or suggested addons here, e.g., WeakAuras, Auctionator."
            ></textarea>
          </div>

          <div className={styles.formGroup} style={{ position: "relative" }}>
            <label htmlFor="tagInput">Tags</label>
            <div className={styles.tagsInputWrapper}>
              {tags.map((tag, index) => (
                <span key={index} className={styles.tagPill}>
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className={styles.tagRemoveButton}
                  >
                    &times;
                  </button>
                </span>
              ))}
              <input
                type="text"
                id="tagInput"
                value={newTagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                onFocus={() => {
                  setShowSuggestions(true);
                  // On focus, if input is empty, show all available tags
                  if (newTagInput === "") {
                    const allAvailableTags = PREDEFINED_TAGS.filter(
                      (tag) => !tags.includes(tag)
                    );
                    setFilteredSuggestions(allAvailableTags);
                  }
                }}
                // Use onMouseDown for suggestions to prevent onBlur from hiding the list immediately
                onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                placeholder={
                  tags.length === 0
                    ? "Type tag and press Enter or select from suggestions"
                    : ""
                }
              />
            </div>
            {showSuggestions && filteredSuggestions.length > 0 && (
              <ul className={styles.suggestionsList}>
                {filteredSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onMouseDown={() => handleSelectSuggestion(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Guide Steps</label>
            <div className={styles.stepsList}>
              {steps.map((step, index) => (
                <div key={step.id} className={styles.stepCard}>
                  <div className={styles.stepNumber}>{index + 1}</div>
                  <div className={styles.stepContent}>
                    <textarea
                      value={step.content}
                      onChange={(e) =>
                        handleStepChange(step.id, e.target.value)
                      }
                      rows="4"
                      placeholder="Describe this step..."
                      required
                    ></textarea>
                  </div>
                  <div className={styles.stepControls}>
                    <button
                      type="button"
                      onClick={() => handleMoveStep(index, -1)}
                      disabled={index === 0}
                    >
                      <MoveUpIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveStep(index, 1)}
                      disabled={index === steps.length - 1}
                    >
                      <MoveDownIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(step.id)}
                      disabled={steps.length <= 1}
                    >
                      <RemoveIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddStep}
              className={styles.addStepButton}
            >
              + Add Step
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? "Creating..." : "Create Guide"}
          </button>
        </form>
      </div>
    </div>
  );
}
