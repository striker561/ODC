import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { AppProvider, useAppContext } from "./components/AppContext";
import HandViewer from "./components/HandViewer";
import UI from "./components/UI";
import ChakraDust from "./components/ChakraDust";

function HandCanvas() {
  const { setHoveredFinger, signModeActive } = useAppContext();

  return (
    <Canvas
      camera={{ fov: 42, position: [0, 0.08, 0.5], near: 0.01, far: 100 }}
      gl={{
        antialias: true,
        alpha: true,
        shadowMap: { enabled: true, type: "PCFSoftShadowMap" },
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.08,
      }}
      style={{ display: "block", background: "transparent" }}
      onPointerMissed={() => {
        if (!signModeActive) setHoveredFinger(null);
      }}
    >
      <HandViewer />
    </Canvas>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div id="canvas-container">
        <ChakraDust />
        <HandCanvas />
        <UI />
      </div>
    </AppProvider>
  );
}
