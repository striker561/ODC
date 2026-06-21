import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { FINGER_COUNT, FINGERS } from "@/constants/fingers";
import type {
  ApplyFingerPoseOptions,
  BoneRotation,
  FingerIndex,
  HandData,
  HandModelApi,
  ResolvedFinger,
} from "@/types/hand";
import { toFingerIndex } from "@/utils/fingers";

const SKIN_BASE = new THREE.Color(0xd4a07a);
const SKIN_PALM = new THREE.Color(0xc48a6a);
const SKIN_TIP = new THREE.Color(0xd47a5a);
const SSS_GLOW = new THREE.Color(0xff6633);
const PALM_BONE = "Bone001_01";

function boneKey(name: string): string {
  return name.replace(/\./g, "");
}

function findBone(
  bones: Record<string, THREE.Bone>,
  pattern: string,
): THREE.Bone | undefined {
  return bones[pattern] ?? bones[boneKey(pattern)];
}

function hideDebugObjects(root: THREE.Object3D): void {
  root.traverse((obj) => {
    if (
      (obj as THREE.SkeletonHelper).isSkeletonHelper ||
      obj.type === "AxesHelper" ||
      obj.type === "Line" ||
      obj.type === "LineSegments" ||
      obj.type === "LineLoop"
    ) {
      obj.visible = false;
    }
  });
}

function isBone(obj: THREE.Object3D): obj is THREE.Bone {
  return (obj as THREE.Bone).isBone === true;
}

function isSkinnedMesh(obj: THREE.Object3D): obj is THREE.SkinnedMesh {
  return (obj as THREE.SkinnedMesh).isSkinnedMesh === true;
}

function isMesh(obj: THREE.Object3D): obj is THREE.Mesh {
  return (obj as THREE.Mesh).isMesh === true;
}

function collectChain(baseBone: THREE.Bone): THREE.Bone[] {
  const chain: THREE.Bone[] = [];
  let bone: THREE.Bone | null = baseBone;
  while (bone?.isBone) {
    if (!bone.name.includes("_end")) chain.push(bone);
    const next: THREE.Bone | undefined = bone.children.find(isBone);
    bone = next ?? null;
  }
  return chain.slice(0, 3);
}

function discoverFingers(
  bones: Record<string, THREE.Bone>,
): ResolvedFinger[] | null {
  const palm = findBone(bones, PALM_BONE);
  if (!palm?.children?.length) return null;

  const chains = palm.children.filter(isBone).map((base) => ({
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

function resolveFingers(bones: Record<string, THREE.Bone>): ResolvedFinger[] {
  const fromPatterns: ResolvedFinger[] = FINGERS.map((f) => ({
    ...f,
    bones: f.patterns
      .filter((p) => !p.includes("_end"))
      .map((p) => findBone(bones, p))
      .filter((b): b is THREE.Bone => Boolean(b)),
  }));

  if (fromPatterns.every((f) => f.bones.length === 3)) return fromPatterns;
  return discoverFingers(bones) ?? fromPatterns;
}

function buildBoneIndexToFinger(
  skeleton: THREE.Skeleton,
  fingers: ResolvedFinger[],
): number[] {
  const boneToFinger = new Map<string, number>();
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

let cachedSkinNormalMap: THREE.CanvasTexture | null = null;

function createSkinNormalMap(size = 384): THREE.CanvasTexture {
  if (cachedSkinNormalMap) return cachedSkinNormalMap;

  function hash(x: number, y: number): number {
    let h = x * 374761393 + y * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    return (h ^ (h >> 16)) & 0xff;
  }

  function smoothNoise(x: number, y: number): number {
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

  function fbm(x: number, y: number, octaves = 4): number {
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

  function heightAt(u: number, v: number): number {
    const pores = fbm(u * 14, v * 14, 3) * 0.22;
    const fine = fbm(u * 28 + 17, v * 28 + 31, 2) * 0.06;
    const creases = fbm(u * 2.8 + 90, v * 2.8, 2) * 0.05;
    return pores + fine + creases;
  }

  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++)
      heights[y * size + x] = heightAt(x / size, y / size);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas 2d context");

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

function applySkinVertexColors(
  mesh: THREE.SkinnedMesh,
  boneIndexToFinger: number[],
): void {
  const { geometry } = mesh;
  const pos = geometry.attributes.position;
  const skinIndex = geometry.attributes.skinIndex;
  const skinWeight = geometry.attributes.skinWeight;
  if (!pos || !skinIndex || !skinWeight) return;

  const count = pos.count;
  const colors = new Float32Array(count * 3);

  for (let v = 0; v < count; v++) {
    let fingerIdx = -1;
    let maxW = 0;

    for (let slot = 0; slot < 4; slot++) {
      const bi = skinIndex.getComponent(v, slot);
      if (bi >= boneIndexToFinger.length) continue;
      const w = skinWeight.getComponent(v, slot);
      const fi = boneIndexToFinger[bi];
      if (fi >= 0 && w > maxW) {
        maxW = w;
        fingerIdx = fi;
      }
    }

    const y = pos.getY(v);
    let color: THREE.Color;
    if (fingerIdx >= 0 && maxW > 0.04) {
      const tipFactor = Math.max(0, Math.min(1, (y + 0.3) / 0.25));
      color = SKIN_BASE.clone().lerp(SKIN_TIP, tipFactor * 0.55);
    } else {
      color = SKIN_PALM.clone();
    }

    colors[v * 3] = color.r;
    colors[v * 3 + 1] = color.g;
    colors[v * 3 + 2] = color.b;
  }

  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
}

function applySkinMaterial(
  mesh: THREE.SkinnedMesh,
  boneIndexToFinger: number[],
): void {
  if (mesh.geometry.attributes.color) mesh.geometry.deleteAttribute("color");

  const normalMap = createSkinNormalMap();

  const mat = new THREE.MeshPhysicalMaterial({
    color: SKIN_BASE,
    roughness: 0.48,
    metalness: 0.0,
    clearcoat: 0.06,
    clearcoatRoughness: 0.5,
    sheen: 0.3,
    sheenColor: new THREE.Color(0xffbb88),
    sheenRoughness: 0.5,
    emissive: SSS_GLOW,
    emissiveIntensity: 0.035,
    normalMap,
    normalScale: new THREE.Vector2(0.5, 0.5),
    envMapIntensity: 0.4,
    vertexColors: true,
  });

  mesh.material = mat;
  applySkinVertexColors(mesh, boneIndexToFinger);
}

function buildHandData(model: THREE.Object3D): HandData {
  const bones: Record<string, THREE.Bone> = {};
  const originalRotations: Record<string, BoneRotation> = {};
  let skinnedMesh: THREE.SkinnedMesh | null = null;
  let boneIndexToFinger: number[] | null = null;

  model.traverse((obj) => {
    if (isBone(obj)) {
      bones[obj.name] = obj;
      originalRotations[obj.name] = {
        x: obj.rotation.x,
        y: obj.rotation.y,
        z: obj.rotation.z,
      };
    }
    if (isMesh(obj)) {
      obj.raycast = () => {};
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  const fingers = resolveFingers(bones);

  model.traverse((obj) => {
    if (isSkinnedMesh(obj)) {
      skinnedMesh = obj;
      boneIndexToFinger = buildBoneIndexToFinger(obj.skeleton, fingers);
      applySkinMaterial(obj, boneIndexToFinger);
    }
  });

  return {
    bones,
    originalRotations,
    fingers,
    skinnedMesh,
    boneIndexToFinger,
  };
}

function pickFingerAtPoint(
  pointWorld: THREE.Vector3,
  handData: HandData | null,
): FingerIndex | null {
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

  return toFingerIndex(bestFinger);
}

interface HandTransform {
  scale: [number, number, number];
  position: [number, number, number];
}

function computeTransform(model: THREE.Object3D): HandTransform {
  model.traverse((obj) => {
    if (isSkinnedMesh(obj)) obj.skeleton?.update();
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

interface HandModelProps {
  children?: ReactNode;
}

const HandModel = forwardRef<HandModelApi, HandModelProps>(function HandModel(
  { children },
  ref,
) {
  const { scene } = useGLTF("/hand.glb");
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);

  const { model, handData, transform } = useMemo(() => {
    const cloned = SkeletonUtils.clone(scene);
    hideDebugObjects(cloned);
    const data = buildHandData(cloned);
    const tx = computeTransform(cloned);
    return { model: cloned, handData: data, transform: tx };
  }, [scene]);

  modelRef.current = model;
  const dataRef = useRef(handData);
  dataRef.current = handData;

  useImperativeHandle(ref, () => ({
    getFingers: () => dataRef.current?.fingers ?? [],
    getBones: () => dataRef.current?.bones ?? {},
    getFingerCount: () => FINGER_COUNT,
    getHandGroup: () => groupRef.current,
    pickFingerAtPoint: (point) => pickFingerAtPoint(point, dataRef.current),
    updateMatrices: () => {
      const root = modelRef.current;
      if (!root) return;
      root.traverse((obj) => {
        if (isSkinnedMesh(obj)) obj.skeleton?.update();
      });
      root.updateMatrixWorld(true);
      groupRef.current?.updateMatrixWorld(true);
    },
    applyFingerPose: (
      fingerIndex: FingerIndex,
      progress: number,
      opts: ApplyFingerPoseOptions = {},
    ) => {
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

      if (opts.skipEmissive) return;

      const mesh = data.skinnedMesh;
      if (mesh) {
        const mats = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        mats.forEach((mat) => {
          if (!(mat instanceof THREE.MeshPhysicalMaterial)) return;
          const target = 0.035 + progress * 0.35;
          mat.emissiveIntensity += (target - mat.emissiveIntensity) * 0.12;
          if (progress > 0) {
            mat.emissive.setHSL(0.07, 0.9, 0.15 + progress * 0.2);
          } else {
            mat.emissive.set(SSS_GLOW);
          }
        });
      }
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
