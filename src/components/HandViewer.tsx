import { Suspense, useCallback, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useAppContext } from "@/hooks/useAppContext";
import HandModel from "@/components/HandModel";
import HitZones from "@/components/HitZones";
import LoadingScreen from "@/components/LoadingScreen";
import Scene from "@/components/Scene";
import { ORBIT_CONFIG } from "@/constants/scene";
import { useFingerAnimation } from "@/hooks/useFingerAnimation";
import { useHandSignSequence } from "@/hooks/useHandSignSequence";
import type { FingerIndex, HandModelApi } from "@/types/hand";

function HandInteraction() {
  const handRef = useRef<HandModelApi>(null);
  const {
    hoveredFinger,
    setHoveredFinger,
    showHitZones,
    signModeActive,
    setCurrentSign,
  } = useAppContext();

  const hoverState = useFingerAnimation(signModeActive ? null : hoveredFinger);
  const signState = useHandSignSequence(signModeActive, setCurrentSign);

  const manualPoseActive = signModeActive || hoveredFinger !== null;

  useFrame(() => {
    const api = handRef.current;
    if (!api) return;

    if (!manualPoseActive) {
      api.updateMatrices();
      return;
    }

    api.updateMatrices();

    const fingerState = signModeActive ? signState.current : hoverState.current;
    if (signModeActive) {
      fingerState.forEach((s, i) =>
        api.applyFingerPose(i as FingerIndex, s.progress, {
          skipEmissive: true,
        }),
      );
    } else {
      fingerState.forEach((s, i) =>
        api.applyFingerPose(i as FingerIndex, s.progress, {
          skipIfIdle: true,
        }),
      );
    }

    api.updateMatrices();
  }, -1);

  const handlePointerEnter = useCallback(
    (fingerIndex: FingerIndex) => {
      if (!signModeActive) setHoveredFinger(fingerIndex);
    },
    [signModeActive, setHoveredFinger],
  );

  const handlePointerLeave = useCallback(() => {
    if (!signModeActive) setHoveredFinger(null);
  }, [signModeActive, setHoveredFinger]);

  return (
    <HandModel ref={handRef} manualPoseActive={manualPoseActive}>
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
        dampingFactor={ORBIT_CONFIG.dampingFactor}
        enablePan={false}
        enableZoom={false}
        target={[...ORBIT_CONFIG.target]}
        minPolarAngle={ORBIT_CONFIG.minPolarAngle}
        maxPolarAngle={ORBIT_CONFIG.maxPolarAngle}
      />
    </>
  );
}
