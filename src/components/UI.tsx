import { FINGERS } from "@/constants/fingers";
import { useAppContext } from "@/hooks/useAppContext";

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

  const fingerName =
    hoveredFinger !== null ? FINGERS[hoveredFinger].name : null;

  const toggleSignMode = () => {
    setSignModeActive((on) => {
      if (!on) setHoveredFinger(null);
      return !on;
    });
  };

  return (
    <div className="ui-shell">
      <header className="ui-header">
        <div className="ui-brand">
          <span className="ui-brand-mark" aria-hidden="true">
            印
          </span>
          <div className="ui-brand-text">
            <h1 className="ui-title">Hand Seals</h1>
            <p className="ui-subtitle">Shinobi sign study · Minato sequence</p>
          </div>
        </div>
      </header>

      <div className="ui-center" aria-live="polite">
        {signModeActive && currentSign ? (
          <div className="sign-scroll">
            <span className="sign-scroll-label">Current seal</span>
            <strong className="sign-scroll-name">{currentSign}</strong>
          </div>
        ) : fingerName ? (
          <div className="sign-scroll sign-scroll--finger">
            <span className="sign-scroll-label">Finger</span>
            <strong className="sign-scroll-name">{fingerName}</strong>
          </div>
        ) : null}
      </div>

      <footer className="ui-footer">
        <p
          className={`ui-hint ${signModeActive || fingerName ? "ui-hint--hidden" : ""}`}
        >
          Hover a finger to curl · Drag to orbit
        </p>

        <div className="ui-toolbar">
          <button
            type="button"
            className={`ui-btn ui-btn--primary ${signModeActive ? "is-active" : ""}`}
            onClick={toggleSignMode}
            aria-pressed={signModeActive}
          >
            <span className="ui-btn-icon" aria-hidden="true">
              {signModeActive ? "◼" : "▶"}
            </span>
            {signModeActive ? "Stop sequence" : "Flying Raijin signs"}
          </button>

          <button
            type="button"
            className={`ui-btn ui-btn--ghost ${showHitZones ? "is-active" : ""}`}
            onClick={() => setShowHitZones((v) => !v)}
            aria-pressed={showHitZones}
            title="Show finger hit zones for debugging"
          >
            Hit zones
          </button>
        </div>

        {signModeActive && (
          <p className="ui-status">
            <span className="ui-status-dot" aria-hidden="true" />
            Sequence running
          </p>
        )}
      </footer>
    </div>
  );
}
