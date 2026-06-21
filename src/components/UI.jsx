import { useAppContext } from "./AppContext";
import { FINGERS } from "./HandModel";

export default function UI() {
  const { hoveredFinger, showHitZones, setShowHitZones } = useAppContext();

  const label = hoveredFinger !== null ? FINGERS[hoveredFinger].name : "";
  const color = hoveredFinger !== null ? FINGERS[hoveredFinger].color : "#fff";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 40,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 36,
          left: "50%",
          transform: "translateX(-50%)",
          color: "#fff",
          fontSize: 22,
          fontWeight: 300,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          opacity: hoveredFinger !== null ? 1 : 0,
          transition: "opacity 0.3s",
          textShadow: `0 0 30px ${color}`,
        }}
      >
        <span style={{ color }}>{label}</span>
      </div>

      <div
        style={{
          position: "absolute",
          top: 36,
          right: 28,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {FINGERS.map((finger) => (
          <div
            key={finger.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: finger.color,
                boxShadow: `0 0 10px ${finger.color}`,
              }}
            />
            {finger.name}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowHitZones((v) => !v)}
        style={{
          position: "absolute",
          bottom: 36,
          left: 28,
          pointerEvents: "auto",
          background: showHitZones
            ? "rgba(74, 158, 255, 0.15)"
            : "rgba(255,255,255,0.06)",
          border: showHitZones
            ? "1px solid rgba(74, 158, 255, 0.6)"
            : "1px solid rgba(255,255,255,0.15)",
          color: showHitZones ? "#4a9eff" : "rgba(255,255,255,0.6)",
          padding: "10px 16px",
          borderRadius: 6,
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          cursor: "pointer",
          boxShadow: showHitZones ? "0 0 20px rgba(74,158,255,0.25)" : "none",
          transition: "all 0.2s",
        }}
      >
        Hit zones {showHitZones ? "on" : "off"}
      </button>

      <div
        style={{
          color: "rgba(255,255,255,0.35)",
          fontSize: 13,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          opacity: hoveredFinger !== null ? 0 : 1,
          transition: "opacity 0.5s",
        }}
      >
        Hover over a finger
      </div>
    </div>
  );
}
