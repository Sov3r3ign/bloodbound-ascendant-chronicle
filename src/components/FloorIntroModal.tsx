import { useEffect, useState } from "react";
import { biomeForFloor } from "@/lib/dungeon-engine";
import {
  pickFloorIntro,
  pickFloorEvent,
  type FloorChoice,
  type FloorEvent,
} from "@/lib/floor-events";

type Props = {
  floor: number;
  isSanctuary: boolean;
  onChoice: (choice: FloorChoice) => void;
  onClose: () => void;
};

function romanize(n: number): string {
  const map: [number, string][] = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = ""; let v = n;
  for (const [val, sym] of map) { while (v >= val) { out += sym; v -= val; } }
  return out;
}

export function FloorIntroModal({ floor, isSanctuary, onChoice, onClose }: Props) {
  const biome = biomeForFloor(floor);
  // freeze intro + event for the lifetime of this modal instance
  const [intro] = useState(() => pickFloorIntro(biome.id, floor));
  const [event] = useState<FloorEvent | null>(() => pickFloorEvent(biome.id, floor, isSanctuary));
  const [resolvedChoice, setResolvedChoice] = useState<FloorChoice | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (!event || resolvedChoice) onClose();
      } else if (e.key === "Enter" || e.key === " ") {
        if (!event || resolvedChoice) {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [event, resolvedChoice, onClose]);

  const pick = (c: FloorChoice) => {
    setResolvedChoice(c);
    onChoice(c);
  };

  const accent = biome.accentClass;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={`Floor ${floor} — ${biome.name}`}
    >
      <div className="relative w-full max-w-xl overflow-hidden rounded-sm border border-arcane/60 bg-card shadow-rune">
        {/* Header */}
        <div className="relative border-b border-arcane/20 bg-gradient-to-b from-background/40 to-transparent px-6 pb-4 pt-5 text-center">
          <div className={`font-display text-[10px] tracking-[0.5em] ${accent} animate-flicker`}>
            {isSanctuary ? "◆ SANCTUARY ◆" : "◆ YOU DESCEND ◆"}
          </div>
          <div className="mt-1 font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
            FLOOR {romanize(floor)}
          </div>
          <h2 className={`mt-1 font-display text-2xl tracking-widest text-glow ${accent}`}>
            {biome.name.toUpperCase()}
          </h2>
          <div className="mt-0.5 font-serif text-xs italic text-muted-foreground">
            {biome.subtitle}
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="font-serif text-sm italic leading-relaxed text-foreground/90">
            {intro}
          </p>

          {event && (
            <div className="mt-5 rounded-sm border border-bone/40 bg-bone/5 p-4">
              <div className="font-display text-[10px] tracking-[0.4em] text-bone">
                ENCOUNTER
              </div>
              <div className="mt-1 font-display text-lg tracking-wider text-bone text-glow">
                {event.title.toUpperCase()}
              </div>
              {event.npc && (
                <div className="mt-0.5 font-serif text-[11px] italic text-muted-foreground">
                  {event.npc}
                </div>
              )}
              <p className="mt-2 font-serif text-sm italic leading-relaxed text-foreground/85">
                {event.prompt}
              </p>

              {!resolvedChoice ? (
                <div className="mt-4 grid gap-2">
                  {event.choices.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => pick(c)}
                      className="group rounded-sm border border-arcane/40 bg-background/40 px-3 py-2 text-left transition-colors hover:border-arcane/80 hover:bg-arcane/10"
                    >
                      <div className="font-display text-xs tracking-widest text-bone group-hover:text-glow">
                        {c.label.toUpperCase()}
                      </div>
                      {c.hint && (
                        <div className="mt-0.5 font-mono text-[10px] text-ember">{c.hint}</div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-sm border border-ember/40 bg-ember/5 p-3">
                  <div className="font-display text-[10px] tracking-widest text-ember">OUTCOME</div>
                  <p className="mt-1 font-serif text-sm italic text-foreground/90">
                    {resolvedChoice.outcome}
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            disabled={!!event && !resolvedChoice}
            className="mt-5 w-full rounded-sm border border-arcane/50 bg-arcane/10 px-4 py-2 font-display text-xs tracking-[0.4em] text-arcane transition-colors hover:bg-arcane/20 hover:text-glow disabled:cursor-not-allowed disabled:opacity-40"
            autoFocus
          >
            {event && !resolvedChoice ? "CHOOSE YOUR ANSWER" : "STEP FORWARD — [SPACE]"}
          </button>
        </div>
      </div>
    </div>
  );
}
