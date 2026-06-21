import { FogExp2 } from 'three';

export default function Scene() {
  return (
    <>
      {/* Fog */}
      <fogExp2 attach="fog" args={[0x0a0a0f, 0.035]} />

      {/* Ambient */}
      <ambientLight color={0x8899bb} intensity={0.6} />

      {/* Key light */}
      <directionalLight
        color={0xffffff}
        intensity={2.5}
        position={[1, 2, 1.5]}
        castShadow
      />

      {/* Fill light */}
      <directionalLight
        color={0x6699ff}
        intensity={0.8}
        position={[-1.5, 0.5, -1]}
      />

      {/* Rim light */}
      <directionalLight
        color={0xffd0a0}
        intensity={1.2}
        position={[0, -1, -2]}
      />

      {/* Depth point light */}
      <pointLight
        color={0x4466ff}
        intensity={0.5}
        distance={3}
        position={[0, 0.3, 0.5]}
      />
    </>
  );
}
