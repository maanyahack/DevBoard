/** Shown while we resolve whether the user is authenticated. */
export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface-bg)]">
      <div className="flex flex-col items-center gap-4">
        {/* Branded logo mark */}
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl font-bold text-white shadow-[0_2px_12px_0_hsl(160_84%_39%/0.35)]">
          ◈
        </span>
        {/* Dot-pulse loader */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-emerald-500 opacity-60"
              style={{
                animation: `dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes dot-pulse {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40%            { transform: scale(1.2); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
