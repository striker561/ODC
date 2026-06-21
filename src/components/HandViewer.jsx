import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import HandModel from './HandModel';

export default function HandViewer() {
  return (
    <>
      <SceneBackground />
      <ambientLight intensity={1} />
      <directionalLight position={[1, 2, 1]} intensity={2} />
      <directionalLight position={[-1, 0.5, -1]} intensity={0.5} color="#6699ff" />
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.02, 0.02, 0.02]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      <axesHelper args={[0.05]} />
      <HandModel />
      <OrbitControls enableDamping />
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
