import { MainMenuButton } from "@/components/MainMenuButton";
import { createFileRoute } from "@tanstack/react-router";
import { RuneFrame } from "@/components/RuneFrame";

export const Route = createFileRoute("/chronicler")({
  head: () => ({
    meta: [
      { title: "Chronicler Mode — Bloodbound" },
      { name: "description", content: "Run a session. Spawn monsters, trigger events, control bosses, and bend the dungeon's behavior." },
      { property: "og:title", content: "Chronicler Mode" },
      { property: "og:description", content: "Be the dungeon." },
    ],
  }),
  component: Chronicler,
});

const TOOLS = [
  { sigil: "▲", title: "Spawn Monster", desc: "Place foes onto any floor cell." },
  { sigil: "☠", title: "Summon Boss", desc: "Trigger a major encounter with custom phases." },
  { sigil: "?", title: "Trigger Event", desc: "Drop a narrative choice on the party." },
  { sigil: "✕", title: "Lay Trap", desc: "Hide a trap behind a Perception check." },
  { sigil: "❉", title: "Open Safe Zone", desc: "Grant a moment of rest." },
  { sigil: "✦", title: "Twist Fate", desc: "Override a roll. Spend Chronicler tokens." },
];

const ACTIVITY = [
  "Veyra triggered a Stealth check (17). She slipped past your ambush.",
  "Korrin entered the Boss antechamber. Phase I armed.",
  "Sael read a glyph aloud. You gained +1 Chronicler token.",
];

function Chronicler() {
  return (
    <div className="min-h-screen">
      <MainMenuButton />
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-10">
        <div className="text-center">
          <div className="font-display text-[10px] tracking-[0.5em] text-arcane">CHRONICLER MODE</div>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl text-glow">Be the Dungeon.</h1>
          <p className="mx-auto mt-3 max-w-xl font-serif italic text-muted-foreground">
            Run sessions for your party. Spawn what hunts them, write what whispers to them, decide what answers.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:mt-10 lg:grid-cols-[1fr_320px]">
          {/* Tools */}
          <RuneFrame className="p-6">
            <div className="font-display text-[10px] tracking-[0.4em] text-arcane">CHRONICLER TOOLS</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TOOLS.map((t) => (
                <button
                  key={t.title}
                  className="group rounded-sm border border-border bg-card/60 p-4 text-left transition-all hover:border-arcane/60 hover:shadow-rune"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm tracking-widest text-bone">{t.title}</span>
                    <span className="text-2xl text-arcane group-hover:text-glow group-hover:animate-flicker">{t.sigil}</span>
                  </div>
                  <p className="mt-2 font-serif text-xs italic text-muted-foreground">{t.desc}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-sm border border-arcane/30 bg-arcane/5 p-4">
              <div className="font-display text-[10px] tracking-widest text-arcane">DUNGEON BEHAVIOR</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {[
                  { l: "Aggression", v: 60 },
                  { l: "Whispers", v: 80 },
                  { l: "Generosity", v: 25 },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-display tracking-widest text-muted-foreground">{s.l.toUpperCase()}</span>
                      <span className="font-mono text-foreground/80">{s.v}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border/60">
                      <div className="h-full bg-gradient-arcane" style={{ width: `${s.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RuneFrame>

          {/* Activity */}
          <RuneFrame className="p-5">
            <div className="font-display text-[10px] tracking-[0.4em] text-arcane">PARTY ACTIVITY</div>
            <ul className="mt-3 space-y-2">
              {ACTIVITY.map((a, i) => (
                <li key={i} className="rounded-sm border-l-2 border-arcane/50 bg-arcane/5 p-2 font-serif text-xs italic text-foreground/85">{a}</li>
              ))}
            </ul>
            <div className="mt-6 rounded-sm border border-ember/30 bg-ember/5 p-3 text-center">
              <div className="font-display text-[10px] tracking-widest text-ember">CHRONICLER TOKENS</div>
              <div className="mt-1 font-display text-3xl text-ember text-glow-ember">7</div>
            </div>
          </RuneFrame>
        </div>
      </div>
    </div>
  );
}
