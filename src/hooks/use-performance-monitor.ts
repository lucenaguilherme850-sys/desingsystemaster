import { useState, useEffect } from "react";

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    loadingTime: 0,
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let rafId: number;

    const calculateFps = () => {
      const now = performance.now();
      frameCount++;
      if (now >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        
        // Get memory info if available (Chrome/Edge)
        const memory = (performance as any).memory
          ? Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024))
          : 0;

        setMetrics(prev => ({ ...prev, fps, memory }));
        frameCount = 0;
        lastTime = now;
      }
      rafId = requestAnimationFrame(calculateFps);
    };

    rafId = requestAnimationFrame(calculateFps);

    // Measure initial page load after a small delay to ensure navigation timing is stable
    const timer = setTimeout(() => {
      const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      if (navEntry) {
        setMetrics(prev => ({ ...prev, loadingTime: Math.round(navEntry.duration) }));
      }
    }, 100);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, []);

  return metrics;
}
