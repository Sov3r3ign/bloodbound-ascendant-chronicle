import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen } from "lucide-react";

const KEY = "bloodbound.howto.seen";

type Section = { title: string; lines: string[] };

const SECTIONS: Section[] = [
  {
    title: "I · The Goal",
    lines: [
      "Descend through the dungeon's floors. Each floor is a different biome with harsher foes and richer rewards.",
      "Survive as deep as you can. Every fourth floor is a Sanctuary — rest, shop, plan your next descent.",
      "Death is permanent for the run, but you keep Bloodbound Shards to unlock new bloodlines and aspects for next time.",
    ],
  },
  {
    title: "II · Forging Your Ascendant",
    lines: [
      "NAME · choose what the dungeon will learn to call you.",
      "VESSEL · the form your ascendant wears (cosmetic).",
      "BLOODLINE · your heritage and three innate traits.",
      "ASPECT · your bound power: a Passive, an Active, and an Ultimate.",
      "RESONANCE · 1–3 hungers the dungeon notices. Each grants a boon and a cost.",
      "VITALS · spend 18 points across Vigor (HP), Focus (mana), Resolve (defense).",
    ],
  },
  {
    title: "III · Moving and Fighting",
    lines: [
      "MOVE · arrow keys, WASD, or HJKL. Click an adjacent tile to step there.",
      "ATTACK · walk into a foe to strike. Combat is rolled on a d20 against their defense.",
      "WAIT · press SPACE or . to rest one turn (regenerates a little Focus).",
      "POTION · [1] heals Vigor. ELIXIR · [2] restores Focus.",
      "ASPECT POWER · [Q] spends Focus to unleash your bound power.",
      "SHRINE · stand on ▲ and press [R] to invoke a boon (or a curse).",
    ],
  },
  {
    title: "IV · Your Bag",
    lines: [
      "EQUIPMENT · Weapon, Armor, Trinket. Better gear is found in chests, dropped by bosses, or bought in Sanctuaries.",
      "BAG · Crimson Draughts (heal), Focus Elixirs (mana), Obols (gold), and Bloodbound Shards (meta-progression).",
      "You start with a basic kit — do not waste it on the first kobold you see.",
    ],
  },
  {
    title: "V · The Dungeon Watches",
    lines: [
      "ATTENTION rises as you linger, kill, or invoke power. High Attention spawns harder ambushes.",
      "Every floor introduces a story moment shaped by the biome. Your choices feed a persistent SAGA — blessings, curses, and reputation that carry between floors.",
      "NPCs remember. Be cruel, and the dungeon answers in kind.",
    ],
  },
];

export function HowToPlayModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!open) setPage(0);
  }, [open]);

  if (!open) return null;
  const section = SECTIONS[page];
  const isLast = page === SECTIONS.length - 1;

  function close() {
    try { localStorage.setItem(KEY, "1"); } catch {}
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm px-4 py-8 animate-in fade-in duration-300 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="How to Play"
    >
      <div className="relative w-full max-w-2xl my-auto flex flex-col max-h-[calc(100vh-4rem)] rounded-sm border border-arcane/40 bg-card/95 shadow-arcane">
        <div className="border-b border-border/60 px-8 py-5 text-center shrink-0">
          <div className="font-display text-[10px] tracking-[0.5em] text-arcane">PRIMER</div>
          <div className="mt-2 font-display text-3xl tracking-[0.3em] text-glow">HOW TO PLAY</div>
        </div>
        <div className="px-8 py-6 overflow-y-auto flex-1">
          <h2 className="font-display text-sm tracking-[0.3em] text-arcane">{section.title.toUpperCase()}</h2>
          <ul className="mt-5 space-y-3 font-serif text-[15px] leading-relaxed text-foreground/90">
            {section.lines.map((l, i) => (
              <li key={i} className="border-l-2 border-arcane/40 pl-4">{l}</li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border/60 px-8 py-5 shrink-0">
          <div className="flex items-center gap-2">
            {SECTIONS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-sm transition-all ${
                  i === page ? "bg-arcane shadow-[0_0_8px_oklch(0.7_0.18_280)]" : i < page ? "bg-arcane/40" : "bg-border"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            {page > 0 && (
              <button
                onClick={() => setPage((p) => p - 1)}
                className="font-display text-[10px] tracking-[0.3em] text-muted-foreground hover:text-foreground"
              >
                ← BACK
              </button>
            )}
            <button
              onClick={close}
              className="font-display text-[10px] tracking-[0.3em] text-muted-foreground hover:text-foreground"
            >
              CLOSE
            </button>
            {!isLast ? (
              <button
                onClick={() => setPage((p) => p + 1)}
                className="rounded-sm border border-arcane/40 bg-gradient-arcane px-6 py-2 font-display text-xs tracking-[0.3em] text-bone shadow-arcane hover:scale-[1.02] transition-transform"
              >
                CONTINUE →
              </button>
            ) : (
              <button
                onClick={close}
                className="rounded-sm border border-ember/50 bg-ember/20 px-6 py-2 font-display text-xs tracking-[0.3em] text-bone hover:bg-ember/30"
              >
                DESCEND
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HowToPlayButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="How to Play"
        className={`inline-flex items-center gap-2 rounded-sm border border-arcane/40 px-3 py-2 font-display text-[10px] tracking-[0.3em] text-arcane hover:bg-arcane/10 transition-colors ${className ?? ""}`}
      >
        <BookOpen size={12} />
        HOW TO PLAY
      </button>
      <HowToPlayModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function useAutoShowHowToPlay(): { open: boolean; close: () => void } {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {}
  }, []);
  return { open, close: () => setOpen(false) };
}
