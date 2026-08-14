import { useState, useEffect } from "react";

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

  useEffect(() => {
    setStatus("loading");
    setCurrentSrc(src);
    setRetryCount(0);
  }, [src]);

  const handleError = () => {
    if (retryCount < 3) {
      const delay = Math.pow(2, retryCount) * 1000;
      setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        // Append a timestamp to force a re-fetch
        setCurrentSrc(`${src}&t=${Date.now()}`);
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
