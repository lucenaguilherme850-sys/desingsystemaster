import { useEffect, useRef, useState } from "react";

/**
 * Tracks real-time performance metrics (FPS, frame time).
 * Used for adaptive quality throttling and monitoring.
 */
export function usePerformanceMetrics() {
  const [fps, setFps] = useState(60);
  const [frameTime, setFrameTime] = useState(16.6);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const framesRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(performance.now());

  useEffect(() => {
    const loop = (now: number) => {
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;
      
      framesRef.current++;
      
      if (now - lastFpsUpdateRef.current >= 1000) {
        setFps(Math.round((framesRef.current * 1000) / (now - lastFpsUpdateRef.current)));
        setFrameTime(parseFloat(delta.toFixed(2)));
        framesRef.current = 0;
        lastFpsUpdateRef.current = now;
      }
      
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return { fps, frameTime };
}
