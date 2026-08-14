import { usePerformanceMetrics } from "@/hooks/use-performance-metrics";
import { Activity, Cpu, Database, Gauge, Timer } from "lucide-react";

export function PerformanceDashboard() {
  const { fps, frameTime } = usePerformanceMetrics();

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 rounded-lg border border-border/40 bg-black/80 p-3 font-mono text-[10px] backdrop-blur-md shadow-2xl">
      <div className="flex items-center gap-2 border-b border-border/40 pb-2 mb-1">
        <Gauge className="size-3 text-neon" />
        <span className="uppercase tracking-widest text-muted-foreground">Diagnostics</span>
      </div>
      
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-1.5">
          <Activity className={`size-3 ${fps < 30 ? 'text-red-500' : fps < 50 ? 'text-yellow-500' : 'text-green-500'}`} />
          <span className="text-muted-foreground">FPS:</span>
          <span className={`font-bold ${fps < 30 ? 'text-red-500' : 'text-foreground'}`}>{fps}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Timer className="size-3 text-blue-400" />
          <span className="text-muted-foreground">Frame:</span>
          <span className="text-foreground">{frameTime}ms</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-1.5">
          <Cpu className="size-3 text-purple-400" />
          <span className="text-muted-foreground">Memory:</span>
          <span className="text-foreground">
            {(performance as any).memory ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) : '?'} MB
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Database className="size-3 text-orange-400" />
          <span className="text-muted-foreground">DOM:</span>
          <span className="text-foreground">{document.querySelectorAll('*').length}</span>
        </div>
      </div>
      
      {fps < 45 && (
        <div className="mt-1 flex items-center gap-1.5 text-[9px] text-yellow-500 border-t border-yellow-500/20 pt-1">
          <span className="animate-pulse">●</span> Adaptive Quality Throttling Active
        </div>
      )}
    </div>
  );
}
