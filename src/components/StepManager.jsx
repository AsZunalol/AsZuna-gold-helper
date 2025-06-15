"use client";
import React from "react";
import { PlusCircle, Trash2, GripVertical } from "lucide-react";
import StepEditor from "./StepEditor";

export default function StepManager({ steps, setSteps }) {
  const handleStepChange = (index, newContent) => {
    const updatedSteps = [...steps];
    updatedSteps[index].content = newContent;
    setSteps(updatedSteps);
  };

  const addStep = () => {
    setSteps([...steps, { id: Date.now(), content: "" }]);
  };

  const removeStep = (index) => {
    // Create a new array without the step at the specified index
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
  };

  return (
    <div className="step-manager">
      <label>Guide Steps</label>
      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={step.id} className="step-item">
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
