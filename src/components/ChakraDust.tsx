import { useMemo } from "react";

const COUNT = 60;

interface Particle {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: string;
  drift: string;
}

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 10}s`,
    duration: `${7 + Math.random() * 9}s`,
    size: `${2 + Math.random() * 3}px`,
    drift: `${-30 + Math.random() * 60}px`,
  }));
}

const PARTICLES = createParticles(COUNT);

export default function ChakraDust() {
  const particles = useMemo(() => PARTICLES, []);

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
            ["--drift" as string]: p.drift,
          }}
        />
      ))}
    </div>
  );
}
