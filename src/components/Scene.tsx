export default function Scene() {
  return (
    <>
      <fogExp2 attach="fog" args={[0x0c0a12, 0.016]} />

      <ambientLight color={0x554433} intensity={0.14} />

      <directionalLight
        color={0xffeedd}
        intensity={2.0}
        position={[1.6, 2.6, 1.4]}
      />

      <directionalLight
        color={0xffaa66}
        intensity={0.4}
        position={[-0.5, -1.0, 0.9]}
      />

      <directionalLight
        color={0x6699cc}
        intensity={0.35}
        position={[-1.6, 0.5, -1.4]}
      />

      <directionalLight
        color={0xffcc88}
        intensity={0.28}
        position={[0.4, 0.0, 1.6]}
      />
    </>
  );
}
