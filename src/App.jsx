import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { AppProvider } from './components/AppContext';
import HandViewer from './components/HandViewer';
import UI from './components/UI';

export default function App() {
  return (
    <AppProvider>
      <div id="canvas-container">
        <Canvas
          camera={{ fov: 45, position: [0, 0.15, 0.6], near: 0.01, far: 100 }}
          gl={{
            antialias: true,
            shadowMap: { enabled: true, type: 'PCFSoftShadowMap' },
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.2,
          }}
          style={{ display: 'block' }}
        >
          <HandViewer />
        </Canvas>
        <UI />
      </div>
    </AppProvider>
  );
}
