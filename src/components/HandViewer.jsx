import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import HandModel from "./HandModel";
import HitZones from "./HitZones";
import LoadingScreen from "./LoadingScreen";
import Scene from "./Scene";
import { useAppContext } from "./AppContext";
import { useFingerAnimation } from "../hooks/useFingerAnimation";

function HandInteraction() {
  const handRef = useRef(null);
  const { hoveredFinger, setHoveredFinger, showHitZones } = useAppContext();
  const fingerState = useFingerAnimation(hoveredFinger);

  useFrame(() => {
    const api = handRef.current;
    if (!api) return;
    api.updateMatrices();
    fingerState.current.forEach((s, i) => api.applyFingerPose(i, s.progress));
    api.updateMatrices();
  }, -1);

  return (
    <HandModel ref={handRef}>
      <HitZones
        handRef={handRef}
        hoveredFinger={hoveredFinger}
        visible={showHitZones}
        onPointerEnter={setHoveredFinger}
        onPointerLeave={() => setHoveredFinger(null)}
      />
    </HandModel>
  );
}

export default function HandViewer() {
  return (
    <>
      <Scene />
      <Environment preset="night" environmentIntensity={0.22} />
      <Suspense fallback={<LoadingScreen />}>
        <HandInteraction />
      </Suspense>
      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        enablePan={false}
        enableZoom={false}
        target={[0, 0.02, 0]}
        minPolarAngle={Math.PI * 0.22}
        maxPolarAngle={Math.PI * 0.48}
      />
    </>
  );
}
