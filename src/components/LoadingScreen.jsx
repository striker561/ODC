import { Html } from '@react-three/drei';

export default function LoadingScreen() {
  return (
    <Html center>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          color: 'white',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          Loading hand
        </div>
        <div
          style={{
            width: 200,
            height: 2,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: '60%',
              background: 'linear-gradient(90deg, #4a9eff, #a78bfa)',
              borderRadius: 2,
              animation: 'shimmer 1.2s ease-in-out infinite',
            }}
          />
        </div>
      </div>
    </Html>
  );
}
