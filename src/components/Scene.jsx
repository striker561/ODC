import { FogExp2 } from "three";

export default function Scene() {
  return (
    <>
      <fogExp2 attach="fog" args={[0x030306, 0.018]} />

      {/* Cool ambient — just barely lifts shadows */}
      <ambientLight color={0x445566} intensity={0.12} />

      {/* Main key — warm studio light, large soft source */}
      <directionalLight
        color={0xffeedd}
        intensity={2.2}
        position={[1.8, 2.8, 1.5]}
      />

      {/* Warm fill from below — bounces off environment */}
      <directionalLight
        color={0xffbb77}
        intensity={0.35}
        position={[-0.6, -1.2, 0.8]}
      />

      {/* Cool rim — defines shape edge */}
      <directionalLight
        color={0x88bbff}
        intensity={0.5}
        position={[-1.8, 0.6, -1.5]}
      />

      {/* Warm accent from right — fills front shadows */}
      <directionalLight
        color={0xffdd99}
        intensity={0.3}
        position={[0.5, 0.0, 1.8]}
      />
    </>
  );
}
