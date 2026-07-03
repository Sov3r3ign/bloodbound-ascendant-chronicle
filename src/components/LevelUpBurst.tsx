import { useEffect } from "react";
import { TIER_NAMES } from "@/lib/dungeon-engine";

export function LevelUpBurst({ tier, onDone }: { tier: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  const name = (TIER_NAMES[tier - 1] ?? "Ascendant").toUpperCase();

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
      <div className="relative animate-level-burst text-center">
        <div className="absolute inset-0 -z-10 rounded-full bg-arcane/20 blur-3xl" />
        <div className="font-display text-[11px] tracking-[0.6em] text-ember">◆ ASCENSION ◆</div>
        <div className="mt-2 font-display text-6xl text-glow text-bone drop-shadow-[0_0_20px_rgba(200,180,255,0.6)]">
          LEVEL UP
        </div>
        <div className="mt-2 font-display text-lg tracking-[0.4em] text-arcane">
          TIER {tier} · {name} BLOOD
        </div>
      </div>
    </div>
  );
}
