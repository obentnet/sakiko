'use client'

import { useEffect, useRef, useState } from "react";

const dotSize = 6;
const ringSize = 28;
const pressedRingScale = 0.42;
const lerpFactor = 0.1;

function applyTranslate(
  element: HTMLDivElement,
  x: number,
  y: number,
  size: number,
) {
  element.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`;
}

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const enabledRef = useRef(false);
  const visibleRef = useRef(false);
  const pressedRef = useRef(false);
  const targetRef = useRef({ x: 0, y: 0 });
  const ringPositionRef = useRef({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(pointer: fine) and (hover: hover)");

    const updateEnabled = () => {
      const isEnabled = mediaQuery.matches;

      enabledRef.current = isEnabled;
      visibleRef.current = false;
      setEnabled(isEnabled);
      setVisible(false);
      setPressed(false);
      pressedRef.current = false;

      if (!isEnabled) {
        document.documentElement.classList.remove("custom-cursor-enabled");
        if (frameRef.current !== null) {
          window.cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
        return;
      }

      document.documentElement.classList.add("custom-cursor-enabled");
    };

    updateEnabled();
    mediaQuery.addEventListener("change", updateEnabled);

    return () => {
      mediaQuery.removeEventListener("change", updateEnabled);
      document.documentElement.classList.remove("custom-cursor-enabled");
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const tick = () => {
      const ring = ringRef.current;

      if (!ring) {
        frameRef.current = null;
        return;
      }

      const nextX =
        ringPositionRef.current.x +
        (targetRef.current.x - ringPositionRef.current.x) * lerpFactor;
      const nextY =
        ringPositionRef.current.y +
        (targetRef.current.y - ringPositionRef.current.y) * lerpFactor;

      ringPositionRef.current.x = nextX;
      ringPositionRef.current.y = nextY;

      applyTranslate(
        ring,
        nextX,
        nextY,
        ringSize,
      );

      if (
        Math.abs(targetRef.current.x - nextX) < 0.1 &&
        Math.abs(targetRef.current.y - nextY) < 0.1 &&
        !pressedRef.current
      ) {
        frameRef.current = null;
        return;
      }

      frameRef.current = window.requestAnimationFrame(tick);
    };

    const ensureAnimation = () => {
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(tick);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const x = event.clientX;
      const y = event.clientY;

      targetRef.current.x = x;
      targetRef.current.y = y;

      if (!visibleRef.current) {
        ringPositionRef.current.x = x;
        ringPositionRef.current.y = y;
        visibleRef.current = true;
        setVisible(true);
      }

      if (dotRef.current) {
        applyTranslate(dotRef.current, x, y, dotSize);
      }

      if (pressedRef.current && ringRef.current) {
        ringPositionRef.current.x = x;
        ringPositionRef.current.y = y;
        applyTranslate(ringRef.current, x, y, ringSize);
        return;
      }

      ensureAnimation();
    };

    const handlePointerDown = () => {
      if (!enabledRef.current) {
        return;
      }

      pressedRef.current = true;
      setPressed(true);

      if (ringRef.current) {
        const { x, y } = targetRef.current;
        ringPositionRef.current.x = x;
        ringPositionRef.current.y = y;
        applyTranslate(ringRef.current, x, y, ringSize);
      }
    };

    const handlePointerUp = () => {
      if (!enabledRef.current) {
        return;
      }

      pressedRef.current = false;
      setPressed(false);

      if (ringRef.current) {
        applyTranslate(
          ringRef.current,
          ringPositionRef.current.x,
          ringPositionRef.current.y,
          ringSize,
        );
      }

      ensureAnimation();
    };

    const hideCursor = () => {
      visibleRef.current = false;
      setVisible(false);
      setPressed(false);
      pressedRef.current = false;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("blur", hideCursor);
    document.addEventListener("visibilitychange", hideCursor);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("blur", hideCursor);
      document.removeEventListener("visibilitychange", hideCursor);
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[999] transition-opacity duration-150 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <div
        ref={ringRef}
        className="absolute"
        style={{
          width: ringSize,
          height: ringSize,
          willChange: "transform",
        }}
      >
        <div
          className={`h-full w-full rounded-full border border-white/95 transition-[transform,opacity] duration-150 ease-out ${pressed ? "opacity-100" : "opacity-90"}`}
          style={{
            boxShadow: "0 0 18px rgba(255,255,255,0.18)",
            transform: `scale(${pressed ? pressedRingScale : 1})`,
          }}
        />
      </div>
      <div
        ref={dotRef}
        className="absolute rounded-full bg-white"
        style={{
          width: dotSize,
          height: dotSize,
          boxShadow: "0 0 12px rgba(255,255,255,0.36)",
          willChange: "transform",
        }}
      />
    </div>
  );
}
