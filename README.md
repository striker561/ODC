# ODC — Interactive Hand Signs

A React + Three.js web app that renders a rigged 3D hand (`hand.glb`) with per-finger hover interaction and an automated **Minato-style** one-handed sign sequence inspired by Naruto.

![Hand Animation](public/favicon.svg)

## Features

- **3D hand model** — skinned GLB with procedural skin material (normal map, vertex colors, physical shading)
- **Finger hover** — hover a finger to curl it with spring physics; label shows the finger name
- **Minato signs** — toggle button runs a looping sign sequence (Open Palm → Rat → Tiger → Boar → Release) with snap-and-hold animation and a short chime on each sign
- **Hit zone debug** — optional visible spheres at joint hit targets for tuning interaction
- **Orbit controls** — drag to rotate; scroll zoom disabled

## Tech stack

| Layer | Tools                             |
| ----- | --------------------------------- |
| UI    | React 19, TypeScript              |
| 3D    | Three.js, React Three Fiber, Drei |
| Build | Vite 8                            |

## Getting started

### Prerequisites

- Node.js 18+
- npm

### Install & run

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Other scripts

```bash
npm run typecheck   # TypeScript only
npm run build       # typecheck + production bundle → dist/
npm run preview     # serve production build locally
npm run lint        # ESLint
```

## Project structure

```
public/
  hand.glb                  # Rigged hand asset (23 bones)
src/
  main.tsx                  # React entry
  App.tsx                   # Canvas + UI shell
  constants/
    fingers.ts              # Finger config (names, bones, curl amounts)
  context/
    app-context.ts          # React context instance
  types/
    hand.ts                 # Hand / 3D model types
    animation.ts            # Animation & sign sequence types
    app.ts                  # App state types
    index.ts                # Type barrel export
  components/
    AppProvider.tsx         # Global state provider
    HandModel.tsx           # GLB load, skin material, bone pose API
    HandViewer.tsx          # Scene loop, sign/hover animation
    HitZones.tsx            # Joint spheres for hover picking
    UI.tsx                  # Overlay controls & labels
    Scene.tsx               # Lights & fog
    ChakraDust.tsx          # Background particles
    LoadingScreen.tsx       # Suspense fallback
  hooks/
    useAppContext.ts        # App context hook
    useFingerAnimation.ts   # Spring hover curl
    useHandSignSequence.ts  # Sign sequence driver
  handSigns/
    minatoSequence.ts       # Sign names, hold times, finger targets
  utils/
    fingers.ts              # Finger index guards
    signSound.ts            # Web Audio chime on sign change
```

## TypeScript conventions

- **Strict mode** — `strict`, `noUnusedLocals`, `verbatimModuleSyntax`
- **Path alias** — `@/` maps to `src/` (configured in `tsconfig.app.json` + `vite.config.ts`)
- **Type-only imports** — use `import type { … }` for types (enforced by ESLint)
- **Split types** — domain types live under `src/types/`; runtime values under `constants/` and `utils/`
- **Context pattern** — context object in `context/`, provider component, dedicated hook in `hooks/`
- **Linting** — `typescript-eslint` with type-aware rules via `projectService`

## How it works

### Finger pose model

Each finger has three driven bones. `HandModel.applyFingerPose(index, progress)` maps `progress` from **0 (extended)** to **1 (curled)** using per-joint rotation amounts on a single axis (X for fingers, Z for thumb).

### Hover interaction

`HitZones` mounts small spheres on each joint inside the hand transform. They stay invisible unless debug mode is on, but always receive pointer events. `useFingerAnimation` springs the hovered finger toward `progress = 1`.

### Sign sequence

`useHandSignSequence` runs when **Minato signs** is active:

1. **Transition** (~0.18s) — ease-out snap to target curl values
2. **Hold** — fingers locked at exact targets for the sign’s `hold` duration
3. Advance to the next sign and repeat

Edit poses in `src/handSigns/minatoSequence.ts`. Each `fingers` array is `[index, middle, ring, pinky, thumb]`.

### Bone naming

The GLB loader strips dots from bone names (`Bone.009_02` → `Bone009_02`). Patterns in `HandModel.tsx` match the stripped names.

## Configuration

| What                     | Where                                        |
| ------------------------ | -------------------------------------------- |
| Sign sequence            | `src/handSigns/minatoSequence.ts`            |
| Curl amounts / hit radii | `src/constants/fingers.ts`                   |
| Transition speed         | `SIGN_TRANSITION_SEC` in `minatoSequence.ts` |
| Skin / lighting          | `HandModel.tsx`, `Scene.tsx`, `index.css`    |

## Asset

Place the hand model at `public/hand.glb`. The app expects a skinned mesh with five finger chains and palm bone `Bone001_01` (or compatible pattern-based names).

## License

Private project — see repository owner for terms.
