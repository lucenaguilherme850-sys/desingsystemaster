# Advanced Performance Optimization Plan — Design Master

Implement a deep performance optimization layer for Design Master to ensure high visual quality with minimal computational cost.

## 1. Code Splitting & Dynamic Imports
- Implement route-level code splitting for heavy sections (Dashboard, Agent, Catalog).
- Use `React.lazy` and `Suspense` with optimized skeleton loaders for all heavy component views.
- **Three.js/OGL/GSAP:** Ensure these libraries are only loaded when a specific effect requires them. (Already partially done via `loadLiveFx` using `lazy` imports).

## 2. Smart Resource Management (Intersection Observer)
- **Global Lifecycle Control:** Refactor `MirrorCard` and effect templates to strictly pause all animations, loops, and dispose of WebGL contexts when elements are out of the viewport.
- **WebGL Disposal:** Implement a rigorous `dispose()` pattern for OGL/Three.js resources in the `_ShaderCanvas` and individual handcrafted effects to prevent memory leaks.

## 3. Library & Effect Optimization
- **Virtualized Grid:** Implement a virtualized catalog grid (e.g., using `@tanstack/react-virtual`) if the component list exceeds 100 items to prevent DOM bloat and heavy memory usage.
- **Lightweight Previews:** Implement a "Preview Tier" where cards only show a static poster or a highly optimized low-bitrate video loop by default, only loading the "Live Effect" after interaction or high-intent hover.

## 4. Adaptive Quality System
- **Real-time Performance Monitoring:** Create a hook `usePerformanceMetrics` to track FPS and frame time.
- **Adaptive Render Scale:** Automatically reduce pixel density (DPR) or complexity (particle count, shader passes) if FPS drops below 55.

## 5. Asset Optimization
- **Dynamic Image Sizing:** Use the `sz` parameter for Google Drive thumbnails more aggressively based on viewport size.
- **Lazy Video Mirroring:** Optimize the concurrency queue for mirroring assets to prioritize the current user view.

## Technical Details

- **Files affected:**
    - `src/components/animmaster/MirrorCard.tsx`: Add more aggressive pause/dispose logic.
    - `src/animfx/fx/webgl/_ShaderCanvas.tsx`: Improve disposal and implement adaptive DPR.
    - `src/routes/index.tsx`: Implement virtualization for the component grid.
    - `src/hooks/use-performance-metrics.ts` (New): Real-time FPS monitoring.
    - `src/components/debug/PerformanceMonitor.tsx` (New): Internal dashboard for metrics.

## Implementation Steps

1. **Phase 1: Lifecycle & Disposal** (Fixing leaks and stopping off-screen loops).
2. **Phase 2: Adaptive Quality** (Implementing FPS-based throttling).
3. **Phase 3: Virtualization** (Reducing DOM overhead for the large catalog).
4. **Phase 4: Monitoring** (Adding the diagnostic dashboard for admin/dev).
