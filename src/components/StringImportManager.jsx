"use client";
import React, { useState } from "react";
import { PlusCircle, Edit3, CheckCircle, XCircle } from "lucide-react";
import ImportStringModal from "./ImportStringModal";

export default function StringImportManager({
  title,
  stringValue,
  setStringValue,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasString = stringValue && stringValue.trim() !== "";

  return (
    <div className="string-import-manager">
      <label>{title}</label>
      <div className="import-status-box">
        <div className="status-indicator">
          {hasString ? (
            <CheckCircle size={20} color="var(--color-primary)" />
          ) : (
            <XCircle size={20} color="#666" />
          )}
          <span>{hasString ? "String is set" : "No string set"}</span>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="form-button secondary"
          style={{ padding: "0.5rem 1rem", width: "auto" }}
        >
          {hasString ? <Edit3 size={16} /> : <PlusCircle size={16} />}
          <span>{hasString ? "Edit String" : "Add String"}</span>
        </button>
      </div>

      {isModalOpen && (
        <ImportStringModal
          onClose={() => setIsModalOpen(false)}
          onSave={setStringValue}
          initialValue={stringValue}
          title={title}
        />
      )}
    </div>
  );
}
