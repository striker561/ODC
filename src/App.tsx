import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { AppProvider } from "@/components/AppProvider";
import ChakraDust from "@/components/ChakraDust";
import HandViewer from "@/components/HandViewer";
import UI from "@/components/UI";
import { useAppContext } from "@/hooks/useAppContext";

function HandCanvas() {
  const { setHoveredFinger, signModeActive } = useAppContext();

  return (
    <Canvas
      camera={{ fov: 42, position: [0, 0.08, 0.5], near: 0.01, far: 100 }}
      gl={{
        antialias: true,
        alpha: true,
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
