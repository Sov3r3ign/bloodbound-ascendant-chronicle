import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { RuneFrame } from "@/components/RuneFrame";

export const Route = createFileRoute("/dungeon")({
  head: () => ({
    meta: [
      { title: "The Dungeon — Bloodbound" },
      { name: "description", content: "Explore floors, ambushes, safe zones and boss chambers in a living dungeon that watches back." },
      { property: "og:title", content: "Enter the Dungeon" },
      { property: "og:description", content: "The dungeon does not sleep." },
    ],
  }),
  component: Dungeon,
});

type Cell =
  | { kind: "empty" }
  | { kind: "corridor" }
  | { kind: "monster"; name: string }
  | { kind: "trap"; name: string }
  | { kind: "safe" }
  | { kind: "event"; name: string }
  | { kind: "boss"; name: string }
  | { kind: "you" };

const LEGEND: { kind: Cell["kind"]; label: string; glyph: string; tone: string }[] = [
  { kind: "you", label: "You", glyph: "✦", tone: "text-arcane text-glow animate-flicker" },
  { kind: "monster", label: "Monster", glyph: "▲", tone: "text-blood" },
  { kind: "trap", label: "Trap", glyph: "✕", tone: "text-ember" },
  { kind: "safe", label: "Safe Zone", glyph: "❉", tone: "text-bone" },
  { kind: "event", label: "Event", glyph: "?", tone: "text-arcane" },
  { kind: "boss", label: "Boss", glyph: "☠", tone: "text-blood text-glow" },
];

// Hand-authored 12x8 floor map
const MAP: Cell["kind"][][] = [
  ["empty","corridor","corridor","corridor","corridor","monster","corridor","corridor","corridor","corridor","corridor","empty"],
  ["empty","corridor","empty","empty","empty","corridor","empty","empty","trap","empty","corridor","empty"],
  ["corridor","corridor","empty","safe","corridor","corridor","empty","corridor","corridor","corridor","corridor","corridor"],
  ["you","corridor","empty","corridor","empty","empty","empty","corridor","empty","empty","empty","boss"],
  ["corridor","corridor","empty","corridor","corridor","event","corridor","corridor","empty","corridor","corridor","corridor"],
  ["empty","monster","empty","empty","empty","corridor","empty","empty","empty","corridor","empty","empty"],
  ["empty","corridor","corridor","corridor","corridor","corridor","corridor","trap","corridor","corridor","empty","empty"],
  ["empty","empty","empty","empty","empty","empty","empty","empty","empty","monster","empty","empty"],
];

const PARTY = [
  { name: "Veyra", aspect: "Veils", tone: "arcane" as const, vigor: 7, max: 8 },
  { name: "Korrin", aspect: "Ruin", tone: "blood" as const, vigor: 4, max: 9 },
  { name: "Sael", aspect: "Echoes", tone: "arcane" as const, vigor: 6, max: 6 },
  { name: "Brann", aspect: "Oaths", tone: "bone" as const, vigor: 8, max: 9 },
];

const INITIAL_LOG = [
  { t: "narrative", m: "You descend the obsidian stairwell. The torches lean toward you." },
  { t: "system", m: "Party entered Floor I — The Whispering Mire." },
  { t: "roll", m: "Veyra · Perception · d20 → 17 (Success)" },
  { t: "narrative", m: "Veyra notices a tripwire half-buried in moss." },
];

function Dungeon() {
  const [attention, setAttention] = useState(3);
  const [log, setLog] = useState(INITIAL_LOG);
  const [dice, setDice] = useState<{ value: number; outcome: string } | null>(null);

  const roll = (label: string) => {
    const v = 1 + Math.floor(Math.random() * 20);
    const outcome =
      v === 1 ? "Critical Failure" :
      v <= 7 ? "Failure" :
      v <= 14 ? "Success" :
      v <= 19 ? "Great Success" : "Critical Success";
    setDice({ value: v, outcome });
    setLog((l) => [{ t: "roll", m: `You · ${label} · d20 → ${v} (${outcome})` }, ...l].slice(0, 30));
    if (v >= 18) setAttention((a) => Math.min(10, a + 1));
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Top bar: floor + attention */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-display text-[10px] tracking-[0.4em] text-arcane">FLOOR I</div>
            <h1 className="font-display text-2xl md:text-3xl text-glow">The Whispering Mire</h1>
          </div>
          <AttentionMeter value={attention} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr_300px]">
          {/* Party */}
          <RuneFrame className="p-4">
            <div className="font-display text-[10px] tracking-[0.4em] text-arcane">PARTY</div>
            <ul className="mt-3 space-y-3">
              {PARTY.map((p) => (
                <li key={p.name} className="rounded-sm border border-border/70 bg-background/40 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-display text-sm tracking-wider text-bone">{p.name}</div>
                      <div className="font-serif text-[11px] italic text-muted-foreground">Aspect of {p.aspect}</div>
                    </div>
                    <div className="font-mono text-xs text-foreground/70">{p.vigor}/{p.max}</div>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-border/60">
                    <div className={`h-full bg-${p.tone}`} style={{ width: `${(p.vigor / p.max) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-sm border border-arcane/30 bg-arcane/5 p-3">
              <div className="font-display text-[10px] tracking-widest text-arcane">UNITY TRIAL</div>
              <p className="mt-1 font-serif text-xs italic text-muted-foreground">Stay within 6m of one ally to gain +1 to all rolls.</p>
            </div>
          </RuneFrame>

          {/* Map */}
          <RuneFrame className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-display text-[10px] tracking-[0.4em] text-arcane">DUNGEON MAP</div>
              <div className="flex gap-3 text-[10px] font-display tracking-widest text-muted-foreground">
                {LEGEND.map((l) => (
                  <span key={l.label} className="flex items-center gap-1.5">
                    <span className={`${l.tone}`}>{l.glyph}</span>{l.label.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-px rounded-sm bg-border/40 p-px" style={{ gridTemplateColumns: `repeat(${MAP[0].length}, 1fr)` }}>
              {MAP.flatMap((row, y) =>
                row.map((cell, x) => <MapCell key={`${x}-${y}`} kind={cell} />)
              )}
            </div>

            {/* Dice + actions */}
            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_220px]">
              <div className="flex flex-wrap gap-2">
                {["Perception", "Stealth", "Strike", "Cast", "Persuade", "Flee"].map((a) => (
                  <button
                    key={a}
                    onClick={() => roll(a)}
                    className="rounded-sm border border-border bg-card/60 px-3 py-2 font-display text-[11px] tracking-widest text-foreground/90 transition-all hover:border-arcane hover:shadow-rune"
                  >
                    {a.toUpperCase()}
                  </button>
                ))}
              </div>
              <DiceDisplay dice={dice} />
            </div>
          </RuneFrame>

          {/* Combat log */}
          <RuneFrame className="flex flex-col p-4">
            <div className="font-display text-[10px] tracking-[0.4em] text-arcane">COMBAT LOG</div>
            <ol className="mt-3 max-h-[60vh] flex-1 space-y-2 overflow-y-auto pr-1 text-sm">
              {log.map((entry, i) => (
                <li
                  key={i}
                  className={`rounded-sm border-l-2 px-3 py-2 ${
                    entry.t === "narrative" ? "border-arcane/60 bg-arcane/5 font-serif italic text-foreground/90" :
                    entry.t === "roll" ? "border-ember/60 bg-ember/5 font-mono text-xs text-ember" :
                    "border-border bg-card/40 font-display text-[11px] tracking-wider text-muted-foreground"
                  }`}
                >
                  {entry.m}
                </li>
              ))}
            </ol>
          </RuneFrame>
        </div>

        {/* Ascension tracker */}
        <RuneFrame className="mt-6 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-[10px] tracking-[0.4em] text-arcane">ASCENSION</div>
              <div className="mt-1 font-display text-lg tracking-widest text-bone">TIER I — STIRRING BLOOD</div>
            </div>
            <div className="font-mono text-xs text-muted-foreground">XP 240 / 1000</div>
          </div>
          <div className="mt-3 grid grid-cols-6 gap-1.5">
            {[1,2,3,4,5,6].map((t) => (
              <div key={t} className={`h-2 rounded-full ${t === 1 ? "bg-arcane shadow-[0_0_10px_oklch(0.72_0.16_295)]" : "bg-border/60"}`} />
            ))}
          </div>
        </RuneFrame>
      </div>
    </div>
  );
}

function MapCell({ kind }: { kind: Cell["kind"] }) {
  const def = LEGEND.find((l) => l.kind === kind);
  const base = "aspect-square flex items-center justify-center text-sm font-display select-none";
  if (kind === "empty") return <div className={`${base} bg-background/80`} />;
  if (kind === "corridor") return <div className={`${base} bg-card/70 text-muted-foreground`}>·</div>;
  return (
    <div className={`${base} bg-card/90 ${def?.tone ?? ""}`} title={def?.label}>
      {def?.glyph}
    </div>
  );
}

function AttentionMeter({ value }: { value: number }) {
  const pct = Math.min(100, (value / 10) * 100);
  return (
    <div className="w-full max-w-xs">
      <div className="flex items-center justify-between font-display text-[10px] tracking-[0.3em]">
        <span className="text-arcane">DUNGEON ATTENTION</span>
        <span className="text-blood">{value}/10</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-border/60">
        <div className="h-full bg-gradient-blood transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 font-serif text-[11px] italic text-muted-foreground">
        {value < 3 && "The corridor breathes evenly."}
        {value >= 3 && value < 6 && "Something turns its head."}
        {value >= 6 && value < 9 && "Hunters are en route."}
        {value >= 9 && "The dungeon has spoken your name."}
      </div>
    </div>
  );
}

function DiceDisplay({ dice }: { dice: { value: number; outcome: string } | null }) {
  return (
    <div className="rounded-sm border border-arcane/40 bg-background/50 p-3 text-center shadow-rune">
      <div className="font-display text-[10px] tracking-[0.3em] text-arcane">D20</div>
      <div className="mt-1 font-display text-4xl text-glow text-bone">{dice?.value ?? "—"}</div>
      <div className={`font-display text-[10px] tracking-widest ${
        !dice ? "text-muted-foreground" :
        dice.outcome.includes("Critical Success") ? "text-ember text-glow-ember" :
        dice.outcome.includes("Critical Failure") ? "text-blood" :
        dice.outcome.includes("Great") ? "text-arcane" : "text-muted-foreground"
      }`}>
        {dice?.outcome.toUpperCase() ?? "AWAITING ROLL"}
      </div>
    </div>
  );
}
