import { useMemo } from "react";

const COUNT = 28;

export default function ChakraDust() {
  const particles = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 10}s`,
        duration: `${7 + Math.random() * 9}s`,
        size: `${2 + Math.random() * 3}px`,
        drift: `${-30 + Math.random() * 60}px`,
      })),
    [],
  );

  return (
    <div className="chakra-dust" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="chakra-particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
            "--drift": p.drift,
          }}
        />
      ))}
    </div>
  );
}
