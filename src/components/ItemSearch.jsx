"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Search, LoaderCircle } from "lucide-react";
import debounce from "lodash.debounce";

export default function ItemSearch({ onItemSelected }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchItems = async (query) => {
    if (query.length < 3) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      // --- THIS IS THE FIX ---
      // Changed 'itemName' to 'query' to match the API route
      const response = await fetch(
        `/api/blizzard/search?query=${encodeURIComponent(query)}`
      );
      // ---------------------

      if (!response.ok) {
        throw new Error("Failed to fetch items from server.");
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchItems = useCallback(debounce(fetchItems, 300), []);

  useEffect(() => {
    debouncedFetchItems(searchTerm);
    return () => {
      debouncedFetchItems.cancel();
    };
  }, [searchTerm, debouncedFetchItems]);

  const handleSelect = (item) => {
    onItemSelected(item);
    setSearchTerm("");
    setResults([]);
  };

  return (
    <div className="item-search-container">
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or item ID..."
          className="search-input"
        />
        {isLoading && <LoaderCircle size={18} className="spinner" />}
      </div>
      {results.length > 0 && (
        <ul className="search-results-list">
          {results.map((item) => (
            <li key={item.id} onClick={() => handleSelect(item)}>
              <img
                src={`https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg`}
                data-wowhead={`item=${item.id}&domain=www&icon-size=large`}
                alt={item.name}
                className="item-icon"
              />
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
