import { useAppContext } from "./AppContext";
import { FINGERS } from "./HandModel";

export default function UI() {
  const {
    hoveredFinger,
    showHitZones,
    setShowHitZones,
    signModeActive,
    setSignModeActive,
    currentSign,
    setHoveredFinger,
  } = useAppContext();

  const label = signModeActive
    ? currentSign
    : hoveredFinger !== null
      ? FINGERS[hoveredFinger].name
      : "";

  const toggleSignMode = () => {
    setSignModeActive((on) => {
      if (!on) setHoveredFinger(null);
      return !on;
    });
  };

  return (
    <div className="ui-overlay">
      <div className={`finger-label ${label ? "visible" : ""}`}>{label}</div>

      <div className="ui-controls">
        <button
          type="button"
          className={`sign-toggle ${signModeActive ? "active" : ""}`}
          onClick={toggleSignMode}
        >
          {signModeActive ? "Stop signs" : "Minato signs"}
        </button>

        <button
          type="button"
          className={`hit-zones-toggle ${showHitZones ? "active" : ""}`}
          onClick={() => setShowHitZones((v) => !v)}
        >
          Hit zones {showHitZones ? "on" : "off"}
        </button>
      </div>

      <p className={`hint ${label ? "hidden" : ""}`}>
        {signModeActive ? "Hand sign sequence running…" : "Hover over a finger"}
      </p>
    </div>
  );
}
