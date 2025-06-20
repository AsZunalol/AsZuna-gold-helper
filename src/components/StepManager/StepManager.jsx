"use client";
import React from "react";
import { PlusCircle, Trash2, GripVertical } from "lucide-react";
import StepEditor from "../StepEditor/StepEditor";

export default function StepManager({ steps, setSteps }) {
  // This ensures `steps` is always an array, even if null or undefined is passed.
  const safeSteps = Array.isArray(steps) ? steps : [];

  const handleStepChange = (index, newContent) => {
    // Use the safeSteps array for updating
    const updatedSteps = [...safeSteps];
    updatedSteps[index].content = newContent;
    setSteps(updatedSteps);
  };

  const addStep = () => {
    // Use the safeSteps array to ensure we're adding to a valid array
    setSteps([...safeSteps, { id: Date.now(), content: "" }]);
  };

  const removeStep = (index) => {
    // Use the safeSteps array for filtering
    const updatedSteps = safeSteps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
  };

  return (
    <div className="step-manager">
      <label>Guide Steps</label>
      <div className="steps-container">
        {safeSteps.map((step, index) => (
          <div key={step.id || index} className="step-item">
            <GripVertical className="step-drag-handle" size={20} />
            <div className="step-number">{index + 1}</div>

            <div style={{ flexGrow: 1 }}>
              <StepEditor
                value={step.content}
                onChange={(content) => handleStepChange(index, content)}
              />
            </div>

            <button
              type="button"
              onClick={() => removeStep(index)}
              className="step-action-button"
              aria-label="Remove step"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addStep} className="add-step-button">
        <PlusCircle size={16} />
        <span>Add New Step</span>
      </button>
    </div>
  );
}
