import React from "react";
import { STAGES } from "./data";

export function ProcessFlow({ currentStage, onStageClick }) {
  const visibleStages = STAGES;
  const currentIdx = visibleStages.findIndex(s => s.id === currentStage);

  return (
    <div className="process-flow">
      <div className="process-flow-title">FLUX DU PROCESSUS</div>
      <div className="process-flow-chain">
        {visibleStages.map((stage, i) => {
          const isActive = stage.id === currentStage;
          const isPast = i < currentIdx;
          const isSubStage = stage.id.startsWith("04") && stage.id.length > 4;
          return (
            <React.Fragment key={stage.id}>
              <button
                className={"process-flow-node" + (isActive ? " active" : "") + (isPast ? " past" : "") + (isSubStage ? " sub" : "")}
                style={{ borderColor: stage.color, background: isActive ? stage.color + "33" : isPast ? stage.color + "18" : undefined }}
                onClick={() => onStageClick(stage.id)}
                title={stage.title}
              >
                <span className="process-flow-dot" style={{ background: stage.color }} />
                <span className="process-flow-label">{stage.label.split("·")[1]?.trim() || stage.label}</span>
              </button>
              {i < visibleStages.length - 1 && (
                <span className={"process-flow-arrow" + (isPast ? " past" : "")}>→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
