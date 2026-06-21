import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { AppProvider } from "@/components/AppProvider";
import ChakraDust from "@/components/ChakraDust";
import HandViewer from "@/components/HandViewer";
import UI from "@/components/UI";
import { CAMERA_CONFIG } from "@/constants/scene";
import { useAppContext } from "@/hooks/useAppContext";

function HandCanvas() {
  const { setHoveredFinger, signModeActive } = useAppContext();

  return (
    <Canvas
      camera={{
        fov: CAMERA_CONFIG.fov,
        position: [...CAMERA_CONFIG.position],
        near: CAMERA_CONFIG.near,
        far: CAMERA_CONFIG.far,
      }}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
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
