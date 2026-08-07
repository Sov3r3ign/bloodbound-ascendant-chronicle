import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { GameState } from "@/lib/dungeon-engine";

export type DescentPath = "quiet" | "hoard" | "bleeding";

type PathDef = {
  id: DescentPath;
  name: string;
  flavor: string;
  boon: string;
  bane: string;
  accent: string;
};

export const DESCENT_PATHS: PathDef[] = [
  {
    id: "quiet",
    name: "THE QUIET WAY",
    flavor: "A collapsed servants' stair, half-choked with root and silt. Few things bother to hunt here.",
    boon: "A third of the floor's hunters never find you · +6 HP as you catch your breath",
    bane: "The poor take the quiet road — little of worth is left down it",
    accent: "text-bone border-bone/50 hover:bg-bone/10",
  },
  {
    id: "hoard",
    name: "THE HOARD ROAD",
    flavor: "A merchants' descent, still lamplit. Someone died rich down here and never spent it.",
    boon: "Caches along the way · +40 obols, +1 potion, +1 elixir",
    bane: "Lamplight cuts both ways — the floor's foes strike harder (+1 atk)",
    accent: "text-ember border-ember/50 hover:bg-ember/10",
  },
  {
    id: "bleeding",
    name: "THE BLEEDING PATH",
    flavor: "A shaft cut by something with claws, still wet. Whatever made it went down willingly.",
    boon: "Blood answers blood · +1 permanent attack bonus, +1 shard",
    bane: "Everything below is fed and waiting (+4 HP, +1 atk to all foes)",
    accent: "text-blood border-blood/50 hover:bg-blood/10",
  },
];

/** Applies the chosen route's boons and banes to a freshly generated floor. */
export function applyDescentPath(s: GameState, path: DescentPath): GameState {
  const next = s;
  if (path === "quiet") {
    const keep = Math.ceil(next.monsters.length * 0.66);
    next.monsters = next.monsters.filter((m) => m.boss).concat(next.monsters.filter((m) => !m.boss).slice(0, keep));
    next.player.hp = Math.min(next.player.maxHp, next.player.hp + 6);
    next.log.unshift({ t: "narrative", m: "You take the quiet way. The dungeon barely notices you arrive." });
  } else if (path === "hoard") {
    next.player.gold += 40;
    next.player.potions += 1;
    next.player.elixirs += 1;
    next.counters.goldEarned += 40;
    for (const m of next.monsters) m.atk += 1;
    next.log.unshift({ t: "loot", m: "The hoard road pays out — 40 obols, a phial, an elixir. Something below noticed the lamplight." });
  } else {
    next.player.atkBonus += 1;
    next.player.shards += 1;
    next.counters.shardsEarned += 1;
    for (const m of next.monsters) { m.atk += 1; m.hp += 4; m.maxHp += 4; }
    next.log.unshift({ t: "event", m: "You follow the claw-marks down. Your grip is surer. So is theirs." });
  }
  return next;
}

export function DescentPathModal({ floor, onPick }: { floor: number; onPick: (p: DescentPath) => void }) {
  useEffect(() => {
    const stop = (e: KeyboardEvent) => {
      if (["1", "2", "3"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        onPick(DESCENT_PATHS[Number(e.key) - 1].id);
      } else {
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", stop, true);
    return () => window.removeEventListener("keydown", stop, true);
  }, [onPick]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[85] flex items-start justify-center overflow-y-auto bg-black/90 p-3 backdrop-blur-sm animate-in fade-in sm:items-center sm:p-6">
      <div className="my-auto w-full max-w-3xl rounded-sm border border-arcane/50 bg-card p-5 shadow-rune sm:p-7">
        <div className="text-center">
          <div className="font-display text-[10px] tracking-[0.5em] text-arcane animate-flicker">◆ THE STAIR FORKS ◆</div>
          <h2 className="mt-1 font-display text-2xl tracking-widest text-bone text-glow">CHOOSE YOUR DESCENT</h2>
          <p className="mt-1 font-serif text-xs italic text-muted-foreground">Three ways down to Floor {floor}. Only one will be remembered.</p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {DESCENT_PATHS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => onPick(p.id)}
              className={`group flex flex-col rounded-sm border bg-background/40 p-4 text-left transition-colors ${p.accent}`}
            >
              <div className="font-mono text-[10px] text-muted-foreground">[{i + 1}]</div>
              <div className="mt-0.5 font-display text-sm tracking-[0.2em] group-hover:text-glow">{p.name}</div>
              <p className="mt-2 font-serif text-xs italic leading-relaxed text-foreground/80">{p.flavor}</p>
              <div className="mt-3 font-mono text-[10px] leading-relaxed text-bone">+ {p.boon}</div>
              <div className="mt-1 font-mono text-[10px] leading-relaxed text-blood">− {p.bane}</div>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
