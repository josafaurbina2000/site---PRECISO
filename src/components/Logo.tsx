/**
 * Logo — Minimal wordmark only.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-[22px] font-bold tracking-tight text-text">
        preciso
      </span>
      <span className="text-accent text-[22px] font-bold">.</span>
    </div>
  );
}
