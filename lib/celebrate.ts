/**
 * Small confetti burst from a point on screen. canvas-confetti is loaded
 * lazily (only when a task actually lands in "Done") and the effect is skipped
 * entirely for users who prefer reduced motion.
 */
export async function celebrate(origin?: { x: number; y: number }) {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const { default: confetti } = await import('canvas-confetti');
  const styles = getComputedStyle(document.documentElement);
  const hsl = (v: string) => `hsl(${styles.getPropertyValue(v).trim().replace(/ /g, ', ')})`;
  const colors = [hsl('--brand-from'), hsl('--brand-via'), hsl('--brand-to'), '#34d399', '#fbbf24'];

  const o = origin ?? { x: 0.5, y: 0.4 };
  confetti({
    particleCount: 70,
    spread: 70,
    startVelocity: 32,
    gravity: 1.1,
    scalar: 0.85,
    ticks: 140,
    origin: o,
    colors,
    disableForReducedMotion: true,
  });
}
