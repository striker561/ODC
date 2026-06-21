export default function Scene() {
  return (
    <>
      <fogExp2 attach="fog" args={[0x030306, 0.018]} />

      <ambientLight color={0x445566} intensity={0.12} />

      <directionalLight
        color={0xffeedd}
        intensity={2.2}
        position={[1.8, 2.8, 1.5]}
      />

      <directionalLight
        color={0xffbb77}
        intensity={0.35}
        position={[-0.6, -1.2, 0.8]}
      />

      <directionalLight
        color={0x88bbff}
        intensity={0.5}
        position={[-1.8, 0.6, -1.5]}
      />

      <directionalLight
        color={0xffdd99}
        intensity={0.3}
        position={[0.5, 0.0, 1.8]}
      />
    </>
  );
}
