import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { AppProvider, useAppContext } from "./components/AppContext";
import HandViewer from "./components/HandViewer";
import UI from "./components/UI";
import ChakraDust from "./components/ChakraDust";

function HandCanvas() {
  const { setHoveredFinger } = useAppContext();

  return (
    <Canvas
      camera={{ fov: 42, position: [0, 0.08, 0.5], near: 0.01, far: 100 }}
      gl={{
        antialias: true,
        shadowMap: { enabled: true, type: "PCFSoftShadowMap" },
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      style={{ display: "block" }}
      onPointerMissed={() => setHoveredFinger(null)}
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
