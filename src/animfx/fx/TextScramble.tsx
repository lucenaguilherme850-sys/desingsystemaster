import { useEffect, useRef, useState } from "react";

const CHARS = "!<>-_\\/[]{}—=+*^?#________";

function scramble(target: string, cb: (s: string) => void, done: () => void) {
  const from = "";
  const length = Math.max(from.length, target.length);
  const queue: Array<{ from: string; to: string; start: number; end: number; char?: string }> = [];
  for (let i = 0; i < length; i++) {
    queue.push({ from: from[i] || "", to: target[i] || "", start: Math.floor(Math.random() * 20), end: Math.floor(Math.random() * 20) + 20 });
  }
  let frame = 0;
  const tick = () => {
    let output = "";
    let complete = 0;
    for (const item of queue) {
      if (frame >= item.end) { complete++; output += item.to; }
      else if (frame >= item.start) {
        if (!item.char || Math.random() < 0.28) item.char = CHARS[Math.floor(Math.random() * CHARS.length)];
        output += `<span class="text-neon">${item.char}</span>`;
      } else output += item.from;
    }
    cb(output);
    if (complete === queue.length) { done(); return; }
    frame++;
    requestAnimationFrame(tick);
  };
  tick();
}

const phrases = ["ANIMATED", "COMPONENTS", "SHIP FAST", "MOTION LIB"];

export default function TextScramble() {
  const [html, setHtml] = useState(phrases[0]);
  const rootRef = useRef<HTMLDivElement>(null);
  const iRef = useRef(0);

  useEffect(() => {
    let stop = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let observer: IntersectionObserver | null = null;

    const cycle = () => {
      if (stop) return;
      iRef.current = (iRef.current + 1) % phrases.length;
      scramble(phrases[iRef.current], setHtml, () => {
        if (!stop) timer = setTimeout(cycle, 1500);
      });
    };

    const start = () => {
      if (!stop) return;
      stop = false;
      timer = setTimeout(cycle, 800);
    };

    const pause = () => {
      stop = true;
      if (timer) clearTimeout(timer);
    };

    if (rootRef.current) {
      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) start();
        else pause();
      }, { threshold: 0.01 });
      observer.observe(rootRef.current);
    }

    return () => {
      stop = true;
      if (timer) clearTimeout(timer);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef} className="grid h-[60vh] place-items-center bg-[#07090f]">
      <div className="text-center">
        <div className="font-mono text-xs uppercase tracking-[0.4em] text-neon">text scramble</div>
        <div
          className="mt-4 font-mono text-5xl md:text-7xl font-black uppercase tracking-tight"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}