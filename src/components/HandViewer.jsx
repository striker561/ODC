import { Suspense, useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import HandModel from "./HandModel";
import HitZones from "./HitZones";
import LoadingScreen from "./LoadingScreen";
import Scene from "./Scene";
import { useAppContext } from "./AppContext";
import { useFingerAnimation } from "../hooks/useFingerAnimation";
import { useHandSignSequence } from "../hooks/useHandSignSequence";

function HandInteraction() {
  const handRef = useRef(null);
  const {
    hoveredFinger,
    setHoveredFinger,
    showHitZones,
    signModeActive,
    setCurrentSign,
  } = useAppContext();

  const hoverState = useFingerAnimation(signModeActive ? null : hoveredFinger);
  const signState = useHandSignSequence(signModeActive, setCurrentSign);

  useFrame(() => {
    const api = handRef.current;
    if (!api) return;
    api.updateMatrices();

    const fingerState = signModeActive ? signState.current : hoverState.current;
    if (signModeActive) {
      fingerState.forEach((s, i) =>
        api.applyFingerPose(i, s.progress, { skipEmissive: true }),
      );
    } else {
      fingerState.forEach((s, i) => api.applyFingerPose(i, s.progress));
    }

    api.updateMatrices();
  }, -1);

  const handlePointerEnter = useCallback(
    (fingerIndex) => {
      if (!signModeActive) setHoveredFinger(fingerIndex);
    },
    [signModeActive, setHoveredFinger],
  );

  const handlePointerLeave = useCallback(() => {
    if (!signModeActive) setHoveredFinger(null);
  }, [signModeActive, setHoveredFinger]);

  return (
    <HandModel ref={handRef}>
      <HitZones
        handRef={handRef}
        hoveredFinger={hoveredFinger}
        visible={showHitZones}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      />
    </HandModel>
  );
}

export default function HandViewer() {
  return (
    <>
      <Scene />
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
