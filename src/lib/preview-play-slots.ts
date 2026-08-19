/**
 * Global play-slot manager for preview videos.
 *
 * Rationale: dozens of simultaneously decoding <video> elements are the main
 * source of RAM/CPU pressure in the gallery. We keep previews looping like a
 * GIF, but never more than `max` at the same time. Cards closest to the
 * viewport centre (and the hovered card) win the slots.
 */
type Claimant = {
  id: string;
  priority: () => number; // lower = more important
  onChange: (granted: boolean) => void;
  granted: boolean;
};

const claimants = new Map<string, Claimant>();
let max = 4;
let scheduled = false;

function schedule() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    rebalance();
  });
}

function rebalance() {
  const sorted = [...claimants.values()].sort((a, b) => a.priority() - b.priority());
  sorted.forEach((c, i) => {
    const granted = i < max && c.priority() < Number.POSITIVE_INFINITY;
    if (granted !== c.granted) {
      c.granted = granted;
      c.onChange(granted);
    }
  });
}

export function setMaxConcurrentPreviews(n: number) {
  if (n === max) return;
  max = n;
  schedule();
}

export function claimPreviewSlot(
  id: string,
  priority: () => number,
  onChange: (granted: boolean) => void,
) {
  claimants.set(id, { id, priority, onChange, granted: false });
  schedule();
  return () => {
    claimants.delete(id);
    schedule();
  };
}

/** Ask the manager to re-evaluate (visibility/hover changed). */
export const refreshPreviewSlots = schedule;
