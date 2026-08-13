import { usePerformanceMonitor } from "@/hooks/use-performance-monitor";
import { useState } from "react";
import { Activity, Zap, Cpu, Clock, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function PerformanceDashboard() {
  const { fps, memory, loadingTime } = usePerformanceMonitor();
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div 
      className={cn(
        "fixed bottom-4 left-4 z-[9999] transition-all duration-300 ease-in-out",
        isCollapsed ? "w-10 overflow-hidden" : "w-64"
      )}
    >
      <div className="flex flex-col rounded-xl border border-neon/30 bg-black/80 p-2 backdrop-blur-md shadow-[0_0_20px_rgba(0,255,255,0.1)]">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-between text-neon hover:text-white transition-colors p-1"
        >
          {isCollapsed ? <Activity size={18} /> : (
            <>
              <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} /> Metrics
              </span>
              <ChevronLeft size={16} />
            </>
          )}
        </button>

        {!isCollapsed && (
          <div className="mt-3 space-y-3 px-1 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap size={14} className="text-yellow-400" />
                <span className="text-xs">FPS</span>
              </div>
              <span className={cn(
                "font-mono text-sm font-bold",
                fps > 55 ? "text-green-400" : fps > 30 ? "text-yellow-400" : "text-red-400"
              )}>
                {fps}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Cpu size={14} className="text-blue-400" />
                <span className="text-xs">Memory</span>
              </div>
              <span className="font-mono text-sm text-white">
                {memory > 0 ? `${memory}MB` : "N/A"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={14} className="text-purple-400" />
                <span className="text-xs">Load Time</span>
              </div>
              <span className="font-mono text-sm text-white">
                {loadingTime}ms
              </span>
            </div>
            
            <div className="pt-2 border-t border-white/10">
              <div className="text-[9px] text-muted-foreground uppercase leading-tight">
                Diag: {memory > 1000 ? "High Usage" : "Normal"}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {isCollapsed && (
        <button 
          onClick={() => setIsCollapsed(false)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      )}
    </div>
  );
}
