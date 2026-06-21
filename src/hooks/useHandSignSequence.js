import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import {
    MINATO_SIGN_SEQUENCE,
    SIGN_TRANSITION_SEC,
} from "../handSigns/minatoSequence";
import { playSignSound } from "../utils/signSound";

function easeOutCubic(t) {
    return 1 - (1 - t) ** 3;
}

function beginSignStep(seq, states, index) {
    seq.index = index;
    seq.phase = "transition";
    seq.stepElapsed = 0;
    seq.fromProgress = states.map((s) => s.progress);
}

/**
 * Drives all five fingers through the Minato sign sequence when active.
 * Uses a fast ease-out snap then a locked hold — no spring drift.
 */
export function useHandSignSequence(active, onSignChange) {
    const statesRef = useRef(
        Array.from({ length: 5 }, () => ({ progress: 0 })),
    );
    const seqRef = useRef({
        index: 0,
        phase: "transition",
        stepElapsed: 0,
        fromProgress: [0, 0, 0, 0, 0],
    });
    const releaseRef = useRef({ active: false, elapsed: 0, from: [0, 0, 0, 0, 0] });
    const activeRef = useRef(active);
    const onSignChangeRef = useRef(onSignChange);

    activeRef.current = active;
    onSignChangeRef.current = onSignChange;

    useEffect(() => {
        if (active) {
            releaseRef.current = { active: false, elapsed: 0, from: [0, 0, 0, 0, 0] };
            beginSignStep(seqRef.current, statesRef.current, 0);
            onSignChangeRef.current?.(MINATO_SIGN_SEQUENCE[0].name);
            playSignSound();
        } else {
            const states = statesRef.current;
            releaseRef.current = {
                active: true,
                elapsed: 0,
                from: states.map((s) => s.progress),
            };
            onSignChangeRef.current?.(null);
        }
    }, [active]);

    useFrame((_, delta) => {
        const states = statesRef.current;
        const seq = seqRef.current;

        if (!activeRef.current) {
            const rel = releaseRef.current;
            if (!rel.active) return;

            rel.elapsed += delta;
            const t = Math.min(1, rel.elapsed / SIGN_TRANSITION_SEC);
            const eased = easeOutCubic(t);
            states.forEach((s, i) => {
                s.progress = rel.from[i] * (1 - eased);
                if (t >= 1) s.progress = 0;
            });
            if (t >= 1) rel.active = false;
            return;
        }

        const sign = MINATO_SIGN_SEQUENCE[seq.index];
        seq.stepElapsed += delta;

        if (seq.phase === "transition") {
            const t = Math.min(1, seq.stepElapsed / SIGN_TRANSITION_SEC);
            const eased = easeOutCubic(t);
            sign.fingers.forEach((target, i) => {
                states[i].progress =
                    seq.fromProgress[i] + (target - seq.fromProgress[i]) * eased;
                if (t >= 1) states[i].progress = target;
            });

            if (t >= 1) {
                seq.phase = "hold";
                seq.stepElapsed = 0;
            }
        } else {
            sign.fingers.forEach((target, i) => {
                states[i].progress = target;
            });

            if (seq.stepElapsed >= sign.hold) {
                const next = (seq.index + 1) % MINATO_SIGN_SEQUENCE.length;
                beginSignStep(seq, states, next);
                onSignChangeRef.current?.(MINATO_SIGN_SEQUENCE[next].name);
                playSignSound();
            }
        }
    });

    return statesRef;
}
