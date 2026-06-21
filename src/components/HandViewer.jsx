import { Suspense, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
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
      <SceneBackground />
      <Scene />
      <Suspense fallback={<LoadingScreen />}>
        <HandInteraction />
      </Suspense>
      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        enablePan={false}
        target={[0, 0.02, 0]}
        minPolarAngle={Math.PI * 0.22}
        maxPolarAngle={Math.PI * 0.48}
      />
    </>
  );
}

function SceneBackground() {
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color(0x0a0a0f);
  }, [scene]);
  return null;
}
