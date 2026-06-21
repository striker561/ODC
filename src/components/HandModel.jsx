import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

// Finger bone name patterns
const FINGERS = [
  { name: 'Index',  patterns: ['f_index.01.L_44', 'f_index.02.L_42', 'f_index.03.L_39'], color: '#4a9eff' },
  { name: 'Middle', patterns: ['f_middle.01.L_73', 'f_middle.02.L_71', 'f_middle.03.L_68'], color: '#a78bfa' },
  { name: 'Ring',   patterns: ['f_ring.01.L_92', 'f_ring.02.L_90', 'f_ring.03.L_87'], color: '#34d399' },
  { name: 'Pinky',  patterns: ['f_pinky.01.L_111', 'f_pinky.02.L_109', 'f_pinky.03.L_106'], color: '#f472b6' },
  { name: 'Thumb',  patterns: ['thumb.01.L_54', 'thumb.02.L_52', 'thumb.03.L_49'], color: '#fbbf24' },
];

const EXTEND_AMOUNTS = [0.6, 0.5, 0.3];

let sharedData = null;
let handApi = null;

export default function HandModel() {
  const { scene: threeScene } = useThree();
  const [model, setModel] = useState(null);
  const processedRef = useRef(false);

  // Load model imperatively (no Suspense)
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      '/hand.glb',
      (gltf) => {
        const s = gltf.scene;
        console.log('Model loaded! Children:', s.children.length);
        threeScene.add(s);
        setModel(s);
      },
      (progress) => {
        if (progress.total) {
          console.log('Loading:', Math.round(progress.loaded / progress.total * 100) + '%');
        }
      },
      (error) => {
        console.error('Model load error:', error);
      }
    );
  }, [threeScene]);

  // Process model once loaded
  useEffect(() => {
    if (!model || processedRef.current) return;
    processedRef.current = true;

    const bones = {};
    const originals = {};

    model.traverse((obj) => {
      if (obj.isBone) {
        bones[obj.name] = obj;
        originals[obj.name] = obj.rotation.clone();
      }
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((mat) => {
          if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
            mat.roughness = 0.6;
            mat.metalness = 0.0;
          }
        });
      }
    });

    const fingers = FINGERS.map((f) => ({
      ...f,
      bones: f.patterns.map((p) => bones[p]).filter(Boolean),
    }));

    // Center & scale
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleVal = 0.35 / maxDim;
    model.position.sub(center.clone().multiplyScalar(scaleVal));
    model.scale.setScalar(scaleVal);
    console.log('Model bounds:', { 
      center: center.toArray(), 
      size: size.toArray(), 
      maxDim, 
      scale: scaleVal, 
      finalPos: model.position.toArray(),
    });

    // Debug: count meshes and check materials
    let meshCount = 0;
    model.traverse((obj) => {
      if (obj.isMesh) {
        meshCount++;
        console.log('Mesh:', obj.name, 'material:', obj.material?.type, 'visible:', obj.visible, 'renderOrder:', obj.renderOrder);
      }
    });
    console.log('Total meshes:', meshCount);

    sharedData = { bones, originalRotations: originals, fingers };

    handApi = {
      getFingers: () => sharedData.fingers,
      getBones: () => sharedData.bones,
      getFingerCount: () => FINGERS.length,
      applyFingerPose: (fingerIndex, progress) => {
        const finger = sharedData.fingers[fingerIndex];
        if (!finger?.bones.length) return;
        finger.bones.forEach((bone, i) => {
          if (!bone || !sharedData.originalRotations[bone.name]) return;
          const orig = sharedData.originalRotations[bone.name];
          const amount = (EXTEND_AMOUNTS[i] ?? EXTEND_AMOUNTS[2]) * progress;
          bone.rotation.x = orig.x + amount;
        });
      },
    };

    console.log('Model processed! Fingers:', fingers.map(f => ({ name: f.name, count: f.bones.length })));
  }, [model]);

  return null;
}
