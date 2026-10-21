import { useState, useEffect, useRef } from "react";

export function GoogleDriveImage({
  src,
  alt,
   className,
   fallback,
   loading = "lazy",
 }: {
   src: string;
   alt: string;
   className?: string;
   fallback?: string;
   loading?: "lazy" | "eager";
 }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);
  // Pending retry timer: cleared on src change/unmount so off-screen or
  // virtualized cards never update state after they are gone.
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setStatus("loading");
    setCurrentSrc(src);
    setRetryCount(0);
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
      retryTimer.current = null;
    };
  }, [src]);

  const handleError = () => {
    if (retryCount < 3) {
      const delay = Math.pow(2, retryCount) * 1000;
      if (retryTimer.current) clearTimeout(retryTimer.current);
      retryTimer.current = setTimeout(() => {
        retryTimer.current = null;
        setRetryCount((prev) => prev + 1);
        // Append a cache-buster with the correct separator (local URLs have no "?").
        setCurrentSrc(`${src}${src.includes("?") ? "&" : "?"}t=${Date.now()}`);
      }, delay);
    } else {
      setStatus("error");
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {status === "loading" && (
        <div className="absolute inset-0 animate-pulse bg-card/40" />
      )}
      
      <img
        src={status === "error" ? fallback : currentSrc}
        alt={alt}
        onLoad={() => setStatus("loaded")}
        onError={handleError}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          status === "loaded" ? "opacity-100" : "opacity-0"
        }`}
        loading={loading}
        decoding="async"
      />
      
      {status === "error" && !fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-[8px] uppercase tracking-widest text-muted-foreground">
          failed to load
        </div>
      )}
    </div>
  );
}
