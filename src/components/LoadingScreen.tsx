import { Html } from "@react-three/drei";

export default function LoadingScreen() {
  return (
    <Html center>
      <div className="loading-panel">
        <span className="loading-label">Summoning hand</span>
        <div className="loading-bar">
          <div className="loading-bar-fill" />
        </div>
      </div>
    </Html>
  );
}
