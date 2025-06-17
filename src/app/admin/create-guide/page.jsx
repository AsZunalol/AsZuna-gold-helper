// src/app/admin/create-guide/page.jsx

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "../Admin.module.css";

// Define your predefined list of tags here.
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
].sort();

// Define your predefined list of classes here.
const PREDEFINED_CLASSES = [
  "Death Knight",
  "Demon Hunter",
  "Druid",
  "Evoker",
  "Hunter",
  "Mage",
  "Monk",
  "Paladin",
  "Priest",
  "Rogue",
  "Shaman",
  "Warlock",
  "Warrior",
].sort();

// WoW Class Colors
const CLASS_COLORS = {
  "Death Knight": "#C41F3B",
  "Demon Hunter": "#A330C9",
  Druid: "#FF7C0A",
  Evoker: "#33937F",
  Hunter: "#AAD372",
  Mage: "#3FC7EB",
  Monk: "#00FF98",
  Paladin: "#F48CBA",
  Priest: "#FFFFFF", // White, needs dark text for contrast
  Rogue: "#FFF468",
  Shaman: "#0070DD",
  Warlock: "#8788EE",
  Warrior: "#C69B6D",
};

// Define predefined expansions in chronological order
const PREDEFINED_EXPANSIONS = [
  "Vanilla",
  "The Burning Crusade",
  "Wrath of the Lich King",
  "Cataclysm",
  "Mists of Pandaria",
  "Warlords of Draenor",
  "Legion",
  "Battle for Azeroth",
  "Shadowlands",
  "Dragonflight",
  "The War Within",
  "Midnight",
  "The Last Titan",
];

// WoW Expansion Colors
const EXPANSION_COLORS = {
  Vanilla: "#FFD100", // Gold/Yellow
  "The Burning Crusade": "#1EFF00", // Fel Green
  "Wrath of the Lich King": "#69CCF0", // Icy Blue
  Cataclysm: "#FF7D0A", // Fiery Orange
  "Mists of Pandaria": "#00FF7F", // Jade Green
  "Warlords of Draenor": "#804000", // Dark Brown/Iron
  Legion: "#9C27B0", // Deep Purple
  "Battle for Azeroth": "#007BFF", // Deep Blue (Neutral)
  Shadowlands: "#673AB7", // Indigo Purple
  Dragonflight: "#1D9E74", // Emerald Green/Teal
  "The War Within": "#0080FF", // Deep Blue
  Midnight: "#333366", // Dark Blue/Indigo
  "The Last Titan": "#EECC33", // Pale Gold/Titan Gold
};

// Helper function to determine if a hex color is light or dark for text contrast
const isLightColor = (hexColor) => {
  if (!hexColor) return false;
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  // HSP (Highly Sensitive to Perceived Luminance) equation
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
  return hsp > 180; // Threshold can be adjusted
};

export default function CreateGuidePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Raw Gold");
  const [expansion, setExpansion] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [youtubeVideoId, setYoutubeVideoId] = useState("");
  const [steps, setSteps] = useState([{ id: 1, content: "" }]);
  const [tags, setTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [goldPrHour, setGoldPrHour] = useState("");
  const [addons, setAddons] = useState([]);
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonLink, setNewAddonLink] = useState("");
  const [recommendedClasses, setRecommendedClasses] = useState([]);
  const [newClassInput, setNewClassInput] = useState("");
  const [filteredClassSuggestions, setFilteredClassSuggestions] = useState([]);
  const [showClassSuggestions, setShowClassSuggestions] = useState(false);
  const [tsmImportString, setTsmImportString] = useState("");
  const [routeString, setRouteString] = useState("");
  const [newExpansionInput, setNewExpansionInput] = useState("");
  const [filteredExpansionSuggestions, setFilteredExpansionSuggestions] =
    useState([]);
  const [showExpansionSuggestions, setShowExpansionSuggestions] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleAddStep = () =>
    setSteps([...steps, { id: Date.now(), content: "" }]);
  const handleRemoveStep = (id) =>
    setSteps(steps.filter((step) => step.id !== id));
  const handleStepChange = (id, value) =>
    setSteps(
      steps.map((step) => (step.id === id ? { ...step, content: value } : step))
    );
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
  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setNewTagInput(value);
    if (value.length > 0) {
      const lowerCaseValue = value.toLowerCase();
      const suggestions = PREDEFINED_TAGS.filter(
        (tag) =>
          tag.toLowerCase().includes(lowerCaseValue) && !tags.includes(tag)
      );
      setFilteredSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      const allAvailableTags = PREDEFINED_TAGS.filter(
        (tag) => !tags.includes(tag)
      );
      setFilteredSuggestions(allAvailableTags);
      setShowSuggestions(true);
    }
  };
  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmedTag = newTagInput.trim();
      const normalizedTrimmedTag = trimmedTag.toLowerCase();
      const matchedPredefinedTag = PREDEFINED_TAGS.find(
        (tag) => tag.toLowerCase() === normalizedTrimmedTag
      );
      if (matchedPredefinedTag && !tags.includes(matchedPredefinedTag)) {
        setTags([...tags, matchedPredefinedTag]);
        setNewTagInput("");
        setFilteredSuggestions([]);
        setShowSuggestions(false);
      }
    } else if (e.key === "Backspace" && newTagInput === "" && tags.length > 0) {
      setTags(tags.slice(0, tags.length - 1));
    }
  };
  const handleSelectSuggestion = (suggestion) => {
    if (!tags.includes(suggestion)) {
      setTags([...tags, suggestion]);
    }
    setNewTagInput("");
    setFilteredSuggestions([]);
    setShowSuggestions(false);
  };
  const handleRemoveTag = (tagToRemove) =>
    setTags(tags.filter((tag) => tag !== tagToRemove));
  const handleAddAddon = () => {
    if (newAddonName.trim()) {
      setAddons([
        ...addons,
        { name: newAddonName.trim(), link: newAddonLink.trim() },
      ]);
      setNewAddonName("");
      setNewAddonLink("");
    }
  };
  const handleRemoveAddon = (indexToRemove) =>
    setAddons(addons.filter((_, index) => index !== indexToRemove));
  const handleClassInputChange = (e) => {
    const value = e.target.value;
    setNewClassInput(value);
    if (value.length > 0) {
      const lowerCaseValue = value.toLowerCase();
      const suggestions = PREDEFINED_CLASSES.filter(
        (className) =>
          className.toLowerCase().includes(lowerCaseValue) &&
          !recommendedClasses.includes(className)
      );
      setFilteredClassSuggestions(suggestions);
      setShowClassSuggestions(true);
    } else {
      const allAvailableClasses = PREDEFINED_CLASSES.filter(
        (className) => !recommendedClasses.includes(className)
      );
      setFilteredClassSuggestions(allAvailableClasses);
      setShowClassSuggestions(true);
    }
  };
  const handleClassInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmedClass = newClassInput.trim();
      const normalizedTrimmedClass = trimmedClass.toLowerCase();
      const matchedClass = PREDEFINED_CLASSES.find(
        (className) => className.toLowerCase() === normalizedTrimmedClass
      );
      if (matchedClass && !recommendedClasses.includes(matchedClass)) {
        setRecommendedClasses([...recommendedClasses, matchedClass]);
        setNewClassInput("");
        setFilteredClassSuggestions([]);
        setShowClassSuggestions(false);
      }
    } else if (
      e.key === "Backspace" &&
      newClassInput === "" &&
      recommendedClasses.length > 0
    ) {
      setRecommendedClasses(
        recommendedClasses.slice(0, recommendedClasses.length - 1)
      );
    }
  };
  const handleSelectClassSuggestion = (suggestion) => {
    if (!recommendedClasses.includes(suggestion)) {
      setRecommendedClasses([...recommendedClasses, suggestion]);
    }
    setNewClassInput("");
    setFilteredClassSuggestions([]);
    setShowClassSuggestions(false);
  };
  const handleRemoveClass = (classToRemove) =>
    setRecommendedClasses(
      recommendedClasses.filter((className) => className !== classToRemove)
    );
  const handleExpansionInputChange = (e) => {
    const value = e.target.value;
    setNewExpansionInput(value);
    if (value.length > 0) {
      const lowerCaseValue = value.toLowerCase();
      const suggestions = PREDEFINED_EXPANSIONS.filter((exp) =>
        exp.toLowerCase().includes(lowerCaseValue)
      );
      setFilteredExpansionSuggestions(suggestions);
      setShowExpansionSuggestions(true);
    } else {
      setFilteredExpansionSuggestions(PREDEFINED_EXPANSIONS);
      setShowExpansionSuggestions(true);
    }
  };
  const handleExpansionInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmedExpansion = newExpansionInput.trim();
      const normalizedTrimmedExpansion = trimmedExpansion.toLowerCase();
      const matchedExpansion = PREDEFINED_EXPANSIONS.find(
        (exp) => exp.toLowerCase() === normalizedTrimmedExpansion
      );
      if (matchedExpansion) {
        setExpansion(matchedExpansion);
        setNewExpansionInput("");
        setFilteredExpansionSuggestions([]);
        setShowExpansionSuggestions(false);
      }
    } else if (e.key === "Backspace" && newExpansionInput === "" && expansion) {
      setExpansion("");
    }
  };
  const handleSelectExpansionSuggestion = (suggestion) => {
    setExpansion(suggestion);
    setNewExpansionInput("");
    setFilteredExpansionSuggestions([]);
    setShowExpansionSuggestions(false);
  };
  const handleClearExpansion = () => setExpansion("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");
    const stepsJson = JSON.stringify(steps.map((step) => step.content));
    const tagsString = tags.join(", ");
    const addonsJsonString = JSON.stringify(addons);
    const recommendedClassesString = recommendedClasses.join(", ");
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
          addons: addonsJsonString,
          recommended_class: recommendedClassesString,
          tsm_import_string: tsmImportString,
          route_string: routeString,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Something went wrong");
      setSuccessMessage("Guide created successfully!");
      setTitle("");
      setCategory("Raw Gold");
      setExpansion("");
      setNewExpansionInput("");
      setDescription("");
      setThumbnailUrl("");
      setYoutubeVideoId("");
      setSteps([{ id: 1, content: "" }]);
      setTags([]);
      setNewTagInput("");
      setGoldPrHour("");
      setAddons([]);
      setNewAddonName("");
      setNewAddonLink("");
      setRecommendedClasses([]);
      setNewClassInput("");
      setTsmImportString("");
      setRouteString("");
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

  // --- START OF FIX ---
  // This now checks if the user's role is either 'ADMIN' or 'OWNER'.
  if (
    status === "unauthenticated" ||
    !["ADMIN", "OWNER"].includes(session?.user.role)
  ) {
    return (
      <div className="page-background">
        <div className={styles.container}>
          <h1>Access Denied</h1>
          <p>You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }
  // --- END OF FIX ---

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
          <div className={styles.formGroup} style={{ position: "relative" }}>
            <label htmlFor="expansionInput">Expansion</label>
            {expansion ? (
              <div
                className={styles.tagPill}
                style={{
                  backgroundColor: EXPANSION_COLORS[expansion] || "#333",
                  color: isLightColor(EXPANSION_COLORS[expansion])
                    ? "#333"
                    : "#fff",
                }}
              >
                <span>{expansion}</span>
                <button
                  type="button"
                  onClick={handleClearExpansion}
                  className={styles.tagRemoveButton}
                >
                  &times;
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  id="expansionInput"
                  value={newExpansionInput}
                  onChange={handleExpansionInputChange}
                  onKeyDown={handleExpansionInputKeyDown}
                  onFocus={() => {
                    setShowExpansionSuggestions(true);
                    if (newExpansionInput === "") {
                      setFilteredExpansionSuggestions(PREDEFINED_EXPANSIONS);
                    }
                  }}
                  onBlur={() =>
                    setTimeout(() => setShowExpansionSuggestions(false), 100)
                  }
                  placeholder="Type or select an expansion"
                />
                {showExpansionSuggestions &&
                  filteredExpansionSuggestions.length > 0 && (
                    <ul className={styles.suggestionsList}>
                      {filteredExpansionSuggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          onMouseDown={() =>
                            handleSelectExpansionSuggestion(suggestion)
                          }
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
              </>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description">Short Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
            ></textarea>
            <p className={styles.helperText}>
              Use Markdown for links: `[Link Text](https://example.com)`
            </p>
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
              type="text"
              id="goldPrHour"
              value={goldPrHour}
              onChange={(e) => setGoldPrHour(e.target.value)}
              placeholder="e.g., 50,000g"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Addons (Optional)</label>
            <div className={styles.addonList}>
              {addons.map((addon, index) => (
                <div key={index} className={styles.addonItem}>
                  <span>{addon.name}</span>
                  {addon.link && (
                    <a
                      href={addon.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      (Link)
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveAddon(index)}
                    className={styles.addonRemoveButton}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <div className={styles.newAddonInputGroup}>
              <input
                type="text"
                placeholder="Addon Name"
                value={newAddonName}
                onChange={(e) => setNewAddonName(e.target.value)}
              />
              <input
                type="url"
                placeholder="Addon Link (URL)"
                value={newAddonLink}
                onChange={(e) => setNewAddonLink(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddAddon}
                className={styles.addAddonButton}
              >
                Add Addon
              </button>
            </div>
          </div>
          <div className={styles.formGroup} style={{ position: "relative" }}>
            <label htmlFor="recommendedClassInput">
              Recommended Classes (Optional)
            </label>
            <div className={styles.tagsInputWrapper}>
              {recommendedClasses.map((className, index) => (
                <span
                  key={index}
                  className={styles.tagPill}
                  style={{
                    backgroundColor: CLASS_COLORS[className] || "gray",
                    color: className === "Priest" ? "#333" : "#fff",
                  }}
                >
                  {className}
                  <button
                    type="button"
                    onClick={() => handleRemoveClass(className)}
                    className={styles.tagRemoveButton}
                  >
                    &times;
                  </button>
                </span>
              ))}
              <input
                type="text"
                id="recommendedClassInput"
                value={newClassInput}
                onChange={handleClassInputChange}
                onKeyDown={handleClassInputKeyDown}
                onFocus={() => {
                  setShowClassSuggestions(true);
                  if (newClassInput === "") {
                    const allAvailableClasses = PREDEFINED_CLASSES.filter(
                      (cl) => !recommendedClasses.includes(cl)
                    );
                    setFilteredClassSuggestions(allAvailableClasses);
                  }
                }}
                onBlur={() =>
                  setTimeout(() => setShowClassSuggestions(false), 100)
                }
                placeholder={
                  recommendedClasses.length === 0
                    ? "Type or select recommended classes"
                    : ""
                }
              />
            </div>
            {showClassSuggestions && filteredClassSuggestions.length > 0 && (
              <ul className={styles.suggestionsList}>
                {filteredClassSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onMouseDown={() => handleSelectClassSuggestion(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="tsmImportString">
              TSM Import String (Optional)
            </label>
            <textarea
              id="tsmImportString"
              value={tsmImportString}
              onChange={(e) => setTsmImportString(e.target.value)}
              rows="5"
              placeholder="Paste your TradeSkillMaster import string here."
            ></textarea>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="routeString">Route String (Optional)</label>
            <textarea
              id="routeString"
              value={routeString}
              onChange={(e) => setRouteString(e.target.value)}
              rows="5"
              placeholder="Paste your Gathermate2 or other route import string here."
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
                  if (newTagInput === "") {
                    const allAvailableTags = PREDEFINED_TAGS.filter(
                      (tag) => !tags.includes(tag)
                    );
                    setFilteredSuggestions(allAvailableTags);
                  }
                }}
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
                  <p className={styles.helperText}>
                    Use Markdown for links: `[Link Text](https://example.com)`
                  </p>
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
