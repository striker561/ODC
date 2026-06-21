import { FogExp2 } from "three";

export default function Scene() {
  return (
    <>
      <fogExp2 attach="fog" args={[0x030306, 0.022]} />

      <ambientLight color={0x445577} intensity={0.2} />

      <directionalLight
        color={0xfff0e4}
        intensity={1.5}
        position={[1.4, 2.2, 1.0]}
      />

      <directionalLight
        color={0x886644}
        intensity={0.28}
        position={[-0.8, -0.6, 0.6]}
      />

      <directionalLight
        color={0x6688cc}
        intensity={0.45}
        position={[-1.6, 0.4, -1.2]}
      />

      <spotLight
        color={0xffddbb}
        intensity={0.9}
        angle={0.45}
        penumbra={0.6}
        position={[0.6, 1.2, 1.4]}
        castShadow
      />
    </>
  );
}
