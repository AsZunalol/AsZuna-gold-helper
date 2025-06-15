"use client";
import { WOW_CLASSES } from "@/lib/constants";

export default function MultiClassSelect({
  selectedClasses,
  setSelectedClasses,
}) {
  // Filter out classes that have already been selected
  const availableClasses = Object.values(WOW_CLASSES)
    .filter((cls) => !selectedClasses.includes(cls.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleSelect = (e) => {
    const className = e.target.value;
    if (className && !selectedClasses.includes(className)) {
      setSelectedClasses([...selectedClasses, className]);
    }
  };

  const removeClass = (classToRemove) => {
    setSelectedClasses(selectedClasses.filter((cls) => cls !== classToRemove));
  };

  return (
    <div className="multi-select-container">
      {/* Display selected classes as colored pills */}
      <div className="pills-display">
        {selectedClasses.length === 0 ? (
          <span
            style={{ color: "var(--color-text-secondary)", padding: "0.5rem" }}
          >
            No classes selected...
          </span>
        ) : (
          selectedClasses.map((className) => {
            const classInfo = WOW_CLASSES[className];
            return (
              <div
                key={className}
                className="class-pill"
                style={{ backgroundColor: classInfo?.color || "#A0A0A0" }}
              >
                {className}
                <button
                  type="button"
                  onClick={() => removeClass(className)}
                  className="remove-pill-button"
                >
                  &times;
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Dropdown to add new classes */}
      <select
        value="" // Always reset to the placeholder
        onChange={handleSelect}
        className="select-field"
        style={{ flexGrow: 1 }}
        disabled={availableClasses.length === 0}
      >
        <option value="" disabled>
          {availableClasses.length === 0
            ? "All classes added"
            : "Add a class..."}
        </option>
        {availableClasses.map((cls) => (
          <option
            key={cls.name}
            value={cls.name}
            style={{
              color: cls.color,
              backgroundColor: "var(--color-background)",
            }}
          >
            {cls.name}
          </option>
        ))}
      </select>
    </div>
  );
}
