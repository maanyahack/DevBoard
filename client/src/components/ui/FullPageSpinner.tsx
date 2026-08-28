/**
 * FullPageSpinner — a full-screen loading indicator.
 *
 * Shown while the app checks for an existing session (is the user logged in?).
 * Uses a branded logo mark and a pulsing dot animation to indicate loading.
 */
export function FullPageSpinner() {
  return (
    // Full-screen centered container with the app's background color.
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface-bg)]">
      <div className="flex flex-col items-center gap-4">
        {/* Branded logo mark — the green ◈ symbol. */}
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl font-bold text-white shadow-[0_2px_12px_0_hsl(160_84%_39%/0.35)]">
          ◈
        </span>

        {/* Three-dot pulsing loader animation. */}
        <div className="flex items-center gap-1.5">
          {/* Array.map creates 3 dots, each with a staggered animation delay.
              [0, 1, 2] → dot 0 starts immediately, dot 1 after 0.2s, dot 2 after 0.4s. */}
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-emerald-500 opacity-60"
              style={{
                // Inline style for the staggered animation delay.
                animation: `dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Inline <style> tag defining the dot-pulse keyframe animation.
          The dots scale up and become more opaque in the middle of the cycle,
          creating a "breathing" pulsing effect. */}
      <style>{`
        @keyframes dot-pulse {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40%            { transform: scale(1.2); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
