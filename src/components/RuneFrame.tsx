import { type ReactNode } from "react";

export function RuneFrame({
  children,
  className = "",
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`relative parchment rounded-md rune-border ${
        glow ? "shadow-arcane" : "shadow-deep"
      } ${className}`}
    >
      {/* corner ornaments */}
      <span className="pointer-events-none absolute -top-px -left-px text-arcane/60 text-xs leading-none select-none">◆</span>
      <span className="pointer-events-none absolute -top-px -right-px text-arcane/60 text-xs leading-none select-none">◆</span>
      <span className="pointer-events-none absolute -bottom-px -left-px text-arcane/60 text-xs leading-none select-none">◆</span>
      <span className="pointer-events-none absolute -bottom-px -right-px text-arcane/60 text-xs leading-none select-none">◆</span>
      {children}
    </div>
  );
}
