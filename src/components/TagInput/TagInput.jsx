"use client";
import { useState, useMemo } from "react";
import { APPROVED_TAGS } from "@/lib/constants";

export default function TagInput({ tags, setTags }) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Memoize the filtering of tags for performance
  const filteredSuggestions = useMemo(() => {
    const availableTags = APPROVED_TAGS.filter((tag) => !tags.includes(tag));

    // If input is empty, show available tags. If not, filter them.
    if (!inputValue) {
      return availableTags.slice(0, 7); // Show a few initial suggestions on focus
    }

    return availableTags
      .filter((tag) => tag.toLowerCase().includes(inputValue.toLowerCase()))
      .slice(0, 7); // Limit suggestions while typing
  }, [inputValue, tags]);

  const addTag = (tagToAdd) => {
    const newTag = tagToAdd.trim().toLowerCase();
    if (newTag && APPROVED_TAGS.includes(newTag) && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setInputValue(""); // Clear input after adding
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // If there's an exact match or only one suggestion, add it
      const topSuggestion =
        filteredSuggestions.length > 0 ? filteredSuggestions[0] : null;
      if (topSuggestion) {
        // If the user's input is an exact match for a suggestion, add it.
        // Otherwise, add the top suggestion.
        const exactMatch = filteredSuggestions.find(
          (s) => s === inputValue.toLowerCase()
        );
        addTag(exactMatch || topSuggestion);
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="tag-input-container">
      <div className="tags-display">
        {tags.sort().map((tag) => (
          <div key={tag} className="tag-pill">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="remove-tag-button"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)} // Delay to allow click on suggestions
          placeholder="Search or click to see available tags..."
          className="tag-input-field"
          autoComplete="off"
        />
        {isFocused && filteredSuggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {filteredSuggestions.map((suggestion) => (
              <div
                key={suggestion}
                className="suggestion-item"
                // onMouseDown is used instead of onClick to prevent the blur event from firing first
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(suggestion);
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
