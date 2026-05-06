"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

type Ornament = {
  left: string;
  top: string;
  size: number;
  rotation: number;
  color: string;
  svg: React.ReactNode;
};

const ornamentScale = 2;
const ornamentSpring = {
  stiffness: 72,
  damping: 22,
  mass: 0.85,
} as const;

const ornaments: Ornament[] = [
  {
    left: "6%",
    top: "12%",
    size: 83,
    rotation: -18,
    color: "var(--theme-ornament-3)",
    svg: (
      <svg viewBox="0 0 100 100" fill="none">
        <path d="M50 14L83 76H17L50 14Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    left: "18%",
    top: "72%",
    size: 61,
    rotation: 24,
    color: "var(--theme-ornament-2)",
    svg: (
      <svg viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="32" fill="currentColor" />
      </svg>
    ),
  },
  {
    left: "29%",
    top: "18%",
    size: 54,
    rotation: 12,
    color: "var(--theme-ornament-4)",
    svg: (
      <svg viewBox="0 0 100 100" fill="none">
        <rect x="18" y="18" width="64" height="64" fill="currentColor" />
      </svg>
    ),
  },
  {
    left: "38%",
    top: "82%",
    size: 76,
    rotation: -32,
    color: "var(--theme-ornament-2)",
    svg: (
      <svg viewBox="0 0 100 100" fill="none">
        <rect x="12" y="40" width="76" height="12" rx="6" fill="currentColor" />
        <rect x="12" y="60" width="76" height="12" rx="6" fill="currentColor" />
      </svg>
    ),
  },
  {
    left: "52%",
    top: "9%",
    size: 68,
    rotation: 34,
    color: "var(--theme-ornament-5)",
    svg: (
      <svg viewBox="0 0 100 100" fill="none">
        <rect x="42" y="16" width="16" height="68" rx="8" fill="currentColor" />
        <rect x="16" y="42" width="68" height="16" rx="8" fill="currentColor" />
      </svg>
    ),
  },
  {
    left: "68%",
    top: "24%",
    size: 50,
    rotation: -10,
    color: "var(--theme-ornament-1)",
    svg: (
      <svg viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="18" fill="currentColor" />
      </svg>
    ),
  },
  {
    left: "79%",
    top: "66%",
    size: 72,
    rotation: 18,
    color: "var(--theme-ornament-4)",
    svg: (
      <svg viewBox="0 0 100 100" fill="none">
        <path d="M50 14L83 76H17L50 14Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    left: "88%",
    top: "16%",
    size: 65,
    rotation: 14,
    color: "var(--theme-ornament-5)",
    svg: (
      <svg viewBox="0 0 100 100" fill="none">
        <rect x="20" y="20" width="60" height="60" fill="currentColor" />
      </svg>
    ),
  },
  {
    left: "84%",
    top: "86%",
    size: 54,
    rotation: -24,
    color: "var(--theme-ornament-3)",
    svg: (
      <svg viewBox="0 0 100 100" fill="none">
        <rect x="42" y="16" width="16" height="68" rx="8" fill="currentColor" />
        <rect x="16" y="42" width="68" height="16" rx="8" fill="currentColor" />
      </svg>
    ),
  },
  {
    left: "10%",
    top: "46%",
    size: 47,
    rotation: 8,
    color: "var(--theme-ornament-1)",
    svg: (
      <svg viewBox="0 0 100 100" fill="none">
        <rect x="12" y="40" width="76" height="12" rx="6" fill="currentColor" />
        <rect x="12" y="60" width="76" height="12" rx="6" fill="currentColor" />
      </svg>
    ),
  },
  {
    left: "15%",
    top: "28%",
    size: 58,
    rotation: -14,
    color: "var(--theme-ornament-4)",
    svg: (
      <svg viewBox="0 0 100 100" fill="none">
        <rect x="42" y="16" width="16" height="68" rx="8" fill="currentColor" />
        <rect x="16" y="42" width="68" height="16" rx="8" fill="currentColor" />
      </svg>
    ),
  },
  {
    left: "24%",
    top: "56%",
    size: 64,
    rotation: 22,
    color: "var(--theme-ornament-5)",
    svg: (
      <svg viewBox="0 0 100 100" fill="none">
        <path d="M50 14L83 76H17L50 14Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    left: "44%",
    top: "34%",
    size: 57,
    rotation: -18,
    color: "var(--theme-ornament-2)",
    svg: (
      <svg viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="32" fill="currentColor" />
      </svg>
    ),
  },
  {
    left: "58%",
    top: "58%",
    size: 62,
    rotation: 16,
    color: "var(--theme-ornament-3)",
    svg: (
      <svg viewBox="0 0 100 100" fill="none">
        <rect x="18" y="18" width="64" height="64" fill="currentColor" />
      </svg>
    ),
  },
  {
    left: "72%",
    top: "42%",
    size: 54,
    rotation: -28,
    color: "var(--theme-ornament-5)",
    svg: (
      <svg viewBox="0 0 100 100" fill="none">
        <rect x="12" y="40" width="76" height="12" rx="6" fill="currentColor" />
        <rect x="12" y="60" width="76" height="12" rx="6" fill="currentColor" />
      </svg>
    ),
  },
  {
    left: "90%",
    top: "52%",
    size: 52,
    rotation: 30,
    color: "var(--theme-ornament-1)",
    svg: (
      <svg viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="32" fill="currentColor" />
      </svg>
    ),
  },
];

function BackgroundOrnamentItem({
  ornament,
  pointerX,
  pointerY,
}: {
  ornament: Ornament;
  pointerX: ReturnType<typeof useSpring>;
  pointerY: ReturnType<typeof useSpring>;
}) {
  const drift = Math.max(8, Math.min(22, ornament.size * 0.22));
  const x = useTransform(pointerX, (value) => value * -drift);
  const y = useTransform(pointerY, (value) => value * -drift);

  return (
    <motion.div
      className="absolute opacity-55"
      style={{
        left: ornament.left,
        top: ornament.top,
        width: ornament.size,
        height: ornament.size,
        color: ornament.color,
        rotate: ornament.rotation,
        scale: ornamentScale,
        x,
        y,
      }}
    >
      {ornament.svg}
    </motion.div>
  );
}

export default function BackgroundOrnaments() {
  const pointerX = useSpring(0, ornamentSpring);
  const pointerY = useSpring(0, ornamentSpring);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) {
      pointerX.set(0);
      pointerY.set(0);
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const nextX = (event.clientX / window.innerWidth - 0.5) * 2;
      const nextY = (event.clientY / window.innerHeight - 0.5) * 2;

      pointerX.set(nextX);
      pointerY.set(nextY);
    };

    const resetPointer = () => {
      pointerX.set(0);
      pointerY.set(0);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", resetPointer);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", resetPointer);
    };
  }, [pointerX, pointerY]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {ornaments.map((ornament, index) => (
        <BackgroundOrnamentItem
          key={`${ornament.left}-${ornament.top}-${index}`}
          ornament={ornament}
          pointerX={pointerX}
          pointerY={pointerY}
        />
      ))}
    </div>
  );
}
