import { useAppContext } from './AppContext';

const FINGER_NAMES = ['Index', 'Middle', 'Ring', 'Pinky', 'Thumb'];
const FINGER_COLORS = ['#4a9eff', '#a78bfa', '#34d399', '#f472b6', '#fbbf24'];

export default function UI() {
  const { hoveredFinger } = useAppContext();

  const label = hoveredFinger !== null ? FINGER_NAMES[hoveredFinger] : '';
  const color = hoveredFinger !== null ? FINGER_COLORS[hoveredFinger] : '#fff';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 40,
      }}
    >
      {/* Finger label */}
      <div
        style={{
          position: 'absolute',
          top: 36,
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#fff',
          fontSize: 22,
          fontWeight: 300,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          opacity: hoveredFinger !== null ? 1 : 0,
          transition: 'opacity 0.3s',
          pointerEvents: 'none',
          textShadow: '0 0 30px rgba(120, 180, 255, 0.8)',
        }}
      >
        <span style={{ color }}>{label}</span>
      </div>

      {/* Hint */}
      <div
        style={{
          color: 'rgba(255,255,255,0.35)',
          fontSize: 13,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          opacity: hoveredFinger !== null ? 0 : 1,
          transition: 'opacity 0.5s',
        }}
      >
        Hover over a finger
      </div>
    </div>
  );
}
