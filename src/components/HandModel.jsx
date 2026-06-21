import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

export const FINGERS = [
  {
    name: "Index",
    patterns: ["Bone009_02", "Bone010_03", "Bone011_04", "Bone011_end_017"],
    color: "#4a9eff",
    hitRadii: [0.024, 0.028, 0.03],
    pose: { axis: "x", amounts: [-0.37, -0.13, -0.18] },
  },
  {
    name: "Middle",
    patterns: ["Bone012_05", "Bone013_06", "Bone014_07", "Bone014_end_018"],
    color: "#a78bfa",
    hitRadii: [0.032, 0.034, 0.036],
    pose: { axis: "x", amounts: [-0.37, -0.13, -0.18] },
  },
  {
    name: "Ring",
    patterns: ["Bone015_08", "Bone016_09", "Bone017_010", "Bone017_end_019"],
    color: "#34d399",
    hitRadii: [0.032, 0.034, 0.036],
    pose: { axis: "x", amounts: [-0.37, -0.13, -0.18] },
  },
  {
    name: "Pinky",
    patterns: ["Bone018_011", "Bone019_012", "Bone020_013", "Bone020_end_020"],
    color: "#f472b6",
    hitRadii: [0.028, 0.03, 0.032],
    pose: { axis: "x", amounts: [-0.37, -0.13, -0.18] },
  },
  {
    name: "Thumb",
    patterns: ["Bone003_014", "Bone004_015", "Bone005_016", "Bone005_end_021"],
    color: "#fbbf24",
    hitRadii: [0.03, 0.032, 0.034],
    pose: { axis: "z", amounts: [-0.12, -0.16, -0.3] },
  },
];

const PALM_BONE = "Bone001_01";

function boneKey(name) {
  return name.replace(/\./g, "");
}

function findBone(bones, pattern) {
  return bones[pattern] ?? bones[boneKey(pattern)];
}

function hideDebugObjects(root) {
  root.traverse((obj) => {
    if (
      obj.isSkeletonHelper ||
      obj.type === "AxesHelper" ||
      obj.isLine ||
      obj.isLineSegments ||
      obj.isLineLoop
    ) {
      obj.visible = false;
    }
  });
}

function collectChain(baseBone) {
  const chain = [];
  let bone = baseBone;
  while (bone?.isBone) {
    if (!bone.name.includes("_end")) chain.push(bone);
    const next = bone.children.find((c) => c.isBone);
    bone = next ?? null;
  }
  return chain.slice(0, 3);
}

function discoverFingers(bones) {
  const palm = findBone(bones, PALM_BONE);
  if (!palm?.children?.length) return null;

  const chains = palm.children
    .filter((c) => c.isBone)
    .map((base) => ({
      base,
      chain: collectChain(base),
      localY: base.position.y,
      localX: base.position.x,
    }));

  if (chains.length < 5) return null;

  const thumbChain = chains.reduce((a, b) => (a.localY < b.localY ? a : b));
  const fingerChains = chains
    .filter((c) => c !== thumbChain)
    .sort((a, b) => a.localX - b.localX);

  const ordered = [...fingerChains, thumbChain];

  return ordered.map((entry, i) => ({
    ...FINGERS[i],
    bones: entry.chain,
  }));
}

function resolveFingers(bones) {
  const fromPatterns = FINGERS.map((f) => ({
    ...f,
    bones: f.patterns
      .filter((p) => !p.includes("_end"))
      .map((p) => findBone(bones, p))
      .filter(Boolean),
  }));

  if (fromPatterns.every((f) => f.bones.length === 3)) return fromPatterns;
  return discoverFingers(bones) ?? fromPatterns;
}

function buildBoneIndexToFinger(skeleton, fingers) {
  const boneToFinger = new Map();
  fingers.forEach((finger, fingerIndex) => {
    finger.patterns.forEach((name) => {
      boneToFinger.set(name, fingerIndex);
      boneToFinger.set(boneKey(name), fingerIndex);
    });
  });

  return skeleton.bones.map(
    (bone) =>
      boneToFinger.get(bone.name) ?? boneToFinger.get(boneKey(bone.name)) ?? -1,
  );
}

/**
 * Height field → normal map with visible pore / crease patterns.
 */
let cachedSkinNormalMap = null;

function createSkinNormalMap(size = 384) {
  if (cachedSkinNormalMap) return cachedSkinNormalMap;

  function hash(x, y) {
    let h = x * 374761393 + y * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    return (h ^ (h >> 16)) & 0xff;
  }

  function smoothNoise(x, y) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const a = hash(ix, iy);
    const b = hash(ix + 1, iy);
    const c = hash(ix, iy + 1);
    const d = hash(ix + 1, iy + 1);
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  }

  function fbm(x, y, octaves = 4) {
    let value = 0;
    let amplitude = 0.5;
    let freq = 6;
    for (let i = 0; i < octaves; i++) {
      value += amplitude * (smoothNoise(x * freq, y * freq) / 255);
      amplitude *= 0.5;
      freq *= 2.1;
    }
    return value;
  }

  function heightAt(u, v) {
    const pores = fbm(u * 14, v * 14, 3) * 0.22;
    const fine = fbm(u * 28 + 17, v * 28 + 31, 2) * 0.06;
    const creases = fbm(u * 2.8 + 90, v * 2.8, 2) * 0.05;
    return pores + fine + creases;
  }

  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      heights[y * size + x] = heightAt(x / size, y / size);
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;
  const strength = 1.5;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const hL = heights[y * size + Math.max(0, x - 1)];
      const hR = heights[y * size + Math.min(size - 1, x + 1)];
      const hD = heights[Math.max(0, y - 1) * size + x];
      const hU = heights[Math.min(size - 1, y + 1) * size + x];

      let nx = (hL - hR) * strength;
      let ny = (hD - hU) * strength;
      let nz = 1.0;
      const len = Math.hypot(nx, ny, nz);
      nx /= len;
      ny /= len;
      nz /= len;

      const px = (y * size + x) * 4;
      data[px] = Math.round((nx * 0.5 + 0.5) * 255);
      data[px + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      data[px + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      data[px + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.NoColorSpace;
  cachedSkinNormalMap = texture;
  return texture;
}

function applySkinMaterial(mesh) {
  if (!mesh.isSkinnedMesh) return;

  if (mesh.geometry.attributes.color) {
    mesh.geometry.deleteAttribute("color");
  }

  const normalMap = createSkinNormalMap();

  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xa07858),
    roughness: 0.5,
    metalness: 0.0,
    clearcoat: 0.08,
    clearcoatRoughness: 0.45,
    sheen: 0.2,
    sheenColor: new THREE.Color(0xffbb99),
    sheenRoughness: 0.55,
    emissive: new THREE.Color(0x221108),
    emissiveIntensity: 0.045,
    normalMap,
    normalScale: new THREE.Vector2(0.4, 0.4),
    envMapIntensity: 0.26,
  });

  mesh.material = mat;
}

function buildHandData(model) {
  const bones = {};
  const originals = {};
  let skinnedMesh = null;
  let boneIndexToFinger = null;

  model.traverse((obj) => {
    if (obj.isBone) {
      bones[obj.name] = obj;
      originals[obj.name] = {
        x: obj.rotation.x,
        y: obj.rotation.y,
        z: obj.rotation.z,
      };
    }
    if (obj.isMesh) {
      obj.raycast = () => {};
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  const fingers = resolveFingers(bones);

  model.traverse((obj) => {
    if (obj.isSkinnedMesh) {
      skinnedMesh = obj;
      applySkinMaterial(obj);
      boneIndexToFinger = buildBoneIndexToFinger(obj.skeleton, fingers);
    }
  });

  return {
    bones,
    originalRotations: originals,
    fingers,
    skinnedMesh,
    boneIndexToFinger,
  };
}

function pickFingerAtPoint(pointWorld, handData) {
  const mesh = handData?.skinnedMesh;
  const boneIndexToFinger = handData?.boneIndexToFinger;
  if (!mesh || !boneIndexToFinger) return null;

  const geometry = mesh.geometry;
  const position = geometry.attributes.position;
  const skinIndex = geometry.attributes.skinIndex;
  const skinWeight = geometry.attributes.skinWeight;
  if (!position || !skinIndex || !skinWeight) return null;

  mesh.updateMatrixWorld(true);
  const inverse = mesh.matrixWorld.clone().invert();
  const local = pointWorld.clone().applyMatrix4(inverse);

  let minDistSq = Infinity;
  let closestIdx = 0;

  for (let i = 0; i < position.count; i++) {
    const dx = position.getX(i) - local.x;
    const dy = position.getY(i) - local.y;
    const dz = position.getZ(i) - local.z;
    const distSq = dx * dx + dy * dy + dz * dz;
    if (distSq < minDistSq) {
      minDistSq = distSq;
      closestIdx = i;
    }
  }

  let bestFinger = -1;
  let bestWeight = 0;

  for (let slot = 0; slot < 4; slot++) {
    const boneIdx = skinIndex.getComponent(closestIdx, slot);
    const weight = skinWeight.getComponent(closestIdx, slot);
    const fingerIndex = boneIndexToFinger[boneIdx];
    if (fingerIndex >= 0 && weight > bestWeight) {
      bestWeight = weight;
      bestFinger = fingerIndex;
    }
  }

  return bestFinger >= 0 ? bestFinger : null;
}

function computeTransform(model) {
  model.traverse((obj) => {
    if (obj.isSkinnedMesh) obj.skeleton?.update();
  });
  model.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  const scale = 0.35 / maxDim;

  return {
    scale: [scale, scale, scale],
    position: [-center.x * scale, -center.y * scale, -center.z * scale],
  };
}

const HandModel = forwardRef(function HandModel({ children }, ref) {
  const { scene } = useGLTF("/hand.glb");
  const groupRef = useRef(null);
  const modelRef = useRef(null);

  const { model, handData, transform } = useMemo(() => {
    const cloned = SkeletonUtils.clone(scene);
    hideDebugObjects(cloned);
    const handData = buildHandData(cloned);
    const transform = computeTransform(cloned);
    return { model: cloned, handData, transform };
  }, [scene]);

  modelRef.current = model;
  const dataRef = useRef(handData);
  dataRef.current = handData;

  useImperativeHandle(ref, () => ({
    getFingers: () => dataRef.current?.fingers ?? [],
    getBones: () => dataRef.current?.bones ?? {},
    getFingerCount: () => FINGERS.length,
    getHandGroup: () => groupRef.current,
    pickFingerAtPoint: (point) => pickFingerAtPoint(point, dataRef.current),
    updateMatrices: () => {
      const root = modelRef.current;
      if (!root) return;
      root.traverse((obj) => {
        if (obj.isSkinnedMesh) obj.skeleton?.update();
      });
      root.updateMatrixWorld(true);
      groupRef.current?.updateMatrixWorld(true);
    },
    applyFingerPose: (fingerIndex, progress) => {
      const data = dataRef.current;
      if (!data) return;

      const finger = data.fingers[fingerIndex];
      if (!finger?.bones.length) return;

      const { axis, amounts } = finger.pose;
      finger.bones.forEach((bone, i) => {
        if (!bone || !data.originalRotations[bone.name]) return;
        const orig = data.originalRotations[bone.name];
        const delta = (amounts[i] ?? amounts[amounts.length - 1]) * progress;
        bone.rotation.x = orig.x;
        bone.rotation.y = orig.y;
        bone.rotation.z = orig.z;
        bone.rotation[axis] = orig[axis] + delta;
      });
    },
  }));

  return (
    <group ref={groupRef} position={transform.position} scale={transform.scale}>
      <primitive object={model} />
      {children}
    </group>
  );
});

export default HandModel;

useGLTF.preload("/hand.glb");
