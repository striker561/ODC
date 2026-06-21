import { useAppContext } from "./AppContext";
import { FINGERS } from "./HandModel";

export default function UI() {
  const { hoveredFinger, showHitZones, setShowHitZones } = useAppContext();

  const label = hoveredFinger !== null ? FINGERS[hoveredFinger].name : "";

  return (
    <div className="ui-overlay">
      <div
        className={`finger-label ${hoveredFinger !== null ? "visible" : ""}`}
      >
        {label}
      </div>

      <button
        type="button"
        className={`hit-zones-toggle ${showHitZones ? "active" : ""}`}
        onClick={() => setShowHitZones((v) => !v)}
      >
        Hit zones {showHitZones ? "on" : "off"}
      </button>

      <p className={`hint ${hoveredFinger !== null ? "hidden" : ""}`}>
        Hover over a finger
      </p>
    </div>
  );
}
